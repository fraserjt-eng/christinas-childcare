import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Christina's Child Care Center",
  description: "Nurturing young minds with love, creativity, and excellence. Quality child care programs for infants through school age.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
