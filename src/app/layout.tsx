import type { Metadata, Viewport } from "next";
import "@/styles.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Brandium Telesales CRM",
  description: "Telesales CRM for prospects, opportunities, follow-ups and billing.",
  authors: [{ name: "Brandium" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Brandium Telesales CRM",
    description: "Telesales CRM for prospects, opportunities, follow-ups and billing.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@Brandium",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen bg-background text-foreground antialiased"
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
