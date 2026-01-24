import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/session-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { CustomCursor } from "@/components/custom-cursor";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "WAXFEED - Discover Music & Friends Tailored to You",
  description: "Review albums, discover your unique TasteID, and connect with people who share your musical DNA.",
  icons: {
    icon: [
      { url: "/favicon.ico?v=4", sizes: "any" },
      { url: "/logo/favicon-32.png?v=4", type: "image/png", sizes: "32x32" },
      { url: "/logo/favicon-16.png?v=4", type: "image/png", sizes: "16x16" },
    ],
    apple: "/apple-touch-icon.png?v=4",
  },
  openGraph: {
    title: "WAXFEED - Discover Music & Friends Tailored to You",
    description: "Review albums, discover your unique TasteID, and connect with people who share your musical DNA.",
    type: "website",
    images: ["/logo/waxfeed-disc-512.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className="antialiased min-h-screen transition-colors duration-200">
        <SessionProvider>
          <ThemeProvider>
            <CustomCursor />
            <Header />
            <main className="pt-16">
              {children}
            </main>
            <Analytics />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
