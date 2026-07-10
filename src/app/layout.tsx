import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster as Sonner } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Brock Exchange — TRADE • INVEST • GROW",
  description:
    "Brock Exchange — the next-generation crypto trading platform. Trade binary options on 12+ assets with up to 50% returns in 120 seconds.",
  keywords: ["Brock Exchange", "crypto", "trading", "bitcoin", "ethereum", "binary options"],
  authors: [{ name: "Brock Exchange" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        {children}
        <Sonner richColors theme="dark" position="top-right" />
      </body>
    </html>
  );
}
