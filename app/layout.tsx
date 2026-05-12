import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Pulse Traders — Affiliate Program",
  description: "Partner with The Pulse Traders. Earn 50% commission on every successful sale through your unique referral link.",
  icons: {
    icon: "/The Pulse Traders Fav 32x32 webp.webp",
    shortcut: "/The Pulse Traders Fav 32x32 webp.webp",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
