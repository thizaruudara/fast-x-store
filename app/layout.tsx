import type { Metadata } from "next";
import "./globals.css";
import AnimatedBackground from "@/components/AnimatedBackground";

export const metadata: Metadata = {
  title: "Fast X | Premium AI & Streaming Subscriptions Store",
  description: "Buy ChatGPT Plus, Gemini Advanced, CapCut Pro VIP, Netflix UHD, Claude Pro with instant crypto & Binance Pay delivery.",
  icons: {
    icon: "/fastx-logo.jpg",
    apple: "/fastx-logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#07090e] text-zinc-100 min-h-screen relative selection:bg-amber-400 selection:text-black">
        <AnimatedBackground />
        {children}
      </body>
    </html>
  );
}
