import type { Metadata } from "next";
import { Outfit, Work_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const primaryFont = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-primary-family",
});

const secondaryFont = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-secondary-family",
});

export const metadata: Metadata = {
  title: "PSIR Management System",
  description: "Post-Sentence Investigation Report Management System - Bureau of Corrections",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${primaryFont.variable} ${secondaryFont.variable}`}>
      <body className="antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
