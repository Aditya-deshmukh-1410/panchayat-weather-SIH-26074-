import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Panchayat Weather Intelligence & Agro-Advisory",
  description: "High-Resolution Spatial Downscaling from Block-Level Forecasts for Smart Agriculture (SIH 2026)",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
