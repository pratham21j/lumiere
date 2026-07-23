import { z } from "zod";
import { NextResponse } from "next/server";
import { handleApiError, rateLimited } from "@/lib/api";
import { rateLimiters, clientKey } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAIProvider, type Recommendation } from "@/lib/providers/ai";
import { chatCandidates } from "@/features/search/service";
import { logger } from "@/lib/logger";

/**
 * POST /api/chat — streaming AI recommendations.
 *
 * Wire format: plain text tokens, then a `@@RECS@@<json>` trailer carrying
 * the structured recommendations (movieId, title, reason). The client
 * renders text as it streams and cards when the trailer lands.
 * The conversation id (when persisted) is in the `x-conversation-id` header.
 */

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(30),
  conversationId: z.string().cuid().optional(),
});

export async function POST(req: Request) {
  try {
    const limit = await rateLimiters.chat.check(clientKey(req));
    if (!limit.allowed) return rateLimited(limit.retryAfterSeconds);

    const { messages, conversationId } = bodySchema.parse(await req.json());
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) throw new Error("No user message provided.");

    const session = await auth();
    const userId = session?.user?.id ?? null;

    // Grounding context: semantic candidates + the viewer's taste, if known.
    const [candidates, taste, liked] = await Promise.all([
      chatCandidates(lastUser.content),
      userId && prisma
        ? prisma.tasteProfile.findUnique({
            where: { userId },
            select: { summary: true },
          })
        : null,
      userId && prisma
        ? prisma.interaction.findMany({
            where: { userId, type: "LIKE" },
            include: { movie: { select: { title: true } } },
            orderBy: { createdAt: "desc" },
            take: 5,
          })
        : [],
    ]);

    const result = await getAIProvider().chat(messages, {
      candidates,
      tasteSummary: taste?.summary ?? undefined,
      likedTitles: liked.map((l) => l.movie.title),
    });

    // Persist the user turn up front; the assistant turn after the stream.
    let convId = conversationId ?? null;
    if (userId && prisma) {
      if (!convId) {
        const conv = await prisma.conversation.create({
          data: {
            userId,
            title: lastUser.content.slice(0, 60),
          },
        });
        convId = conv.id;
      } else {
        const owned = await prisma.conversation.findFirst({
          where: { id: convId, userId },
          select: { id: true },
        });
        if (!owned) convId = null;
      }
      if (convId) {
        await prisma.message.create({
          data: { conversationId: convId, role: "USER", content: lastUser.content },
        });
      }
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const reader = result.stream.getReader();
        let fullText = "";
        try {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            fullText += value;
            controller.enqueue(encoder.encode(value));
          }
          const recs: Recommendation[] = await result.recommendations;
          controller.enqueue(encoder.encode(`\n@@RECS@@${JSON.stringify(recs)}`));
          controller.close();

          if (convId && prisma) {
            await prisma.message
              .create({
                data: {
                  conversationId: convId,
                  role: "ASSISTANT",
                  content: fullText,
                  recommendations: JSON.parse(JSON.stringify(recs)),
                },
              })
              .catch((e) =>
                logger.warn("failed to persist assistant message", { error: String(e) }),
              );
          }
        } catch (err) {
          logger.error("chat stream failed", { error: String(err) });
          controller.error(err);
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        ...(convId ? { "x-conversation-id": convId } : {}),
      },
    });
  } catch (err) {
    return handleApiError(err, "/api/chat");
  }
}
