import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const monoFont = Inter({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BlockExchange.buzz — Trade Smarter. Grow Faster.",
  description: "BlockExchange.buzz — premium crypto trading platform. Trade smarter, grow faster.",
  keywords: ["BlockExchange", "crypto", "exchange", "trading", "bitcoin", "ethereum"],
  authors: [{ name: "BlockExchange.buzz" }],
  icons: {
    icon: "/blockexchange-mark.svg",
    apple: "/blockexchange-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${monoFont.variable} antialiased`}>
        <AuthProvider>
          {children}
          <Toaster />
          <Sonner />
        </AuthProvider>
      </body>
    </html>
  );
}
