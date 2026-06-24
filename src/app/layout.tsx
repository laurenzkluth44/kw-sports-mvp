import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Bebas_Neue, Outfit } from "next/font/google";
import "./globals.css";

// KW Sports identity: condensed all-caps display + clean Outfit body.
const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap"
});

const outfit = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "KW Sports Kaderbedarf",
  description: "Interne B2B-Datenbank für offene Kaderbedarfe von Handballvereinen.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png"
  }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="de" className={`${bebasNeue.variable} ${outfit.variable}`}>
      <body>{children}</body>
    </html>
  );
}
