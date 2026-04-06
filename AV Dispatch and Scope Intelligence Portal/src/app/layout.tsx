import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AV Dispatch & Scope Intelligence Portal",
  description: "Dispatch visibility, scope drafting, BOM validation, and operational intelligence for AV field service teams."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
