import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gobang Online",
  description: "Online multiplayer Gobang game",
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
