// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { AppProviders } from "@/app/providers";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ScanX Command Center",
    template: "%s | ScanX Command Center",
  },
  description:
    "ScanX Health clinic operations and command center.",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} min-h-screen antialiased`}
      >
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}