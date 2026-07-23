import type { Metadata } from "next";
import { Chat } from "@/features/chat/components/chat";

export const metadata: Metadata = { title: "AI chat" };

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return (
    <main>
      <Chat initialQuery={q?.slice(0, 500)} />
    </main>
  );
}
