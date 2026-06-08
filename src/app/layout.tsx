import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "KW Sports Kaderbedarf",
  description: "Interne B2B-Datenbank für offene Kaderbedarfe von Handballvereinen."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
