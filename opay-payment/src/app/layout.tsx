import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "payment-examples · OPay 歐付寶 demos",
  description:
    "TypeScript reference: OPay AIO credit card, TWQR dynamic QR, e-invoice, refund, reports — Next.js, Prisma, SQLite.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} ${geistMono.variable} h-full bg-neutral-950 antialiased`}
    >
      <body className={`min-h-full bg-neutral-950 font-sans ${geistSans.className}`}>
        <div className="min-h-full text-neutral-100">{children}</div>
      </body>
    </html>
  );
}
