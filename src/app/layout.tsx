// app/layout.tsx
import "./globals.css";
import Providers from "@/shared/providers/Providers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});


export const metadata = {
  title: "Mebsystore",
  description: "Tu tienda online de productos informaticos y componentes",
  keywords: "tienda, ecommerce, productos, Mebsystore",
  authors: [{ name: "Mebsystore" }],
  icons: {
    icon: "/gengar.ico",
    shortcut: "/gengar.ico",
    apple: "/gengar.ico",
  },
  openGraph: {
    title: "Mebsystore",
    description: "Tu tienda online de productos informaticos y componentes",
    url: "https://www.mebsy.store",
    siteName: "Mebsystore",
    images: ["/og-image.webp"],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mebsystore",
    description: "Tu tienda online de productos informaticos y componentes",
    images: ["/og-image.webp"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${manrope.className} antialiased`} suppressHydrationWarning>
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}