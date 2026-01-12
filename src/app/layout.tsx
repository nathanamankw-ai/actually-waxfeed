import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/session-provider";
import { Header } from "@/components/header";
import { CustomCursor } from "@/components/custom-cursor";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://waxfeed.com"),
  title: {
    default: "WAXFEED - Rate, Review & Discover Music",
    template: "%s | WAXFEED",
  },
  description: "The social platform for music lovers. Rate albums, write reviews, create lists, and discover new music with a community of passionate listeners.",
  keywords: ["music reviews", "album ratings", "music discovery", "music community", "album reviews", "music lists"],
  authors: [{ name: "WAXFEED" }],
  creator: "WAXFEED",
  icons: {
    icon: [
      { url: "/favicon.ico?v=4", sizes: "any" },
      { url: "/logo/favicon-32.png?v=4", type: "image/png", sizes: "32x32" },
      { url: "/logo/favicon-16.png?v=4", type: "image/png", sizes: "16x16" },
    ],
    apple: "/apple-touch-icon.png?v=4",
  },
  openGraph: {
    title: "WAXFEED - Rate, Review & Discover Music",
    description: "The social platform for music lovers. Rate albums, write reviews, create lists, and discover new music.",
    type: "website",
    siteName: "WAXFEED",
    images: [
      {
        url: "/logo/waxfeed-disc-512.png",
        width: 512,
        height: 512,
        alt: "WAXFEED Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WAXFEED - Rate, Review & Discover Music",
    description: "The social platform for music lovers.",
    images: ["/logo/waxfeed-disc-512.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[#0a0a0a] text-[#ededed]">
        <SessionProvider>
          <CustomCursor />
          <Header />
          <main className="pt-16">
            {children}
          </main>
          <Analytics />
        </SessionProvider>
      </body>
    </html>
  );
}
