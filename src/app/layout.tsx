import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  Instrument_Sans,
  Spline_Sans_Mono,
} from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SITE } from "@/lib/site";
import { buildSecurityHeaders } from "@/lib/security";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["wdth"],
});

const body = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const data = Spline_Sans_Mono({
  variable: "--font-data",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
};

export const viewport: Viewport = {
  themeColor: "#0a0b10",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headers = buildSecurityHeaders();

  return (
    <html
      lang="en"
      className={`dark ${display.variable} ${body.variable} ${data.variable}`}
    >
      <body className="min-h-dvh">
        <div style={{ display: "none" }} data-security-headers={JSON.stringify(headers)} />
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}

export const dynamic = "force-dynamic";
