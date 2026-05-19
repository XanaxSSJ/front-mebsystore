import "./globals.css";
import Providers from "@/shared/providers/Providers";
import DeferredVercelInsights from "@/shared/components/DeferredVercelInsights";
import { SITE_URL } from "@/lib/site";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});


export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Mebsystore",
  description: "Tienda online de ropa moderna y exclusiva al mejor precio",
  keywords: "tienda, ecommerce, productos, Mebsystore",
  authors: [{ name: "Mebsystore" }],
  icons: {
    icon: "/gengar.ico",
    shortcut: "/gengar.ico",
    apple: "/gengar.ico",
  },
  openGraph: {
    title: "Mebsystore",
    description: "Tienda online de ropa moderna y exclusiva al mejor precio",
    url: SITE_URL,
    siteName: "Mebsystore",
    images: ["/og-image.webp"],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mebsystore",
    description: "Tienda online de ropa moderna y exclusiva al mejor precio",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${manrope.className} antialiased`} suppressHydrationWarning>
        <noscript>
          <style>{`.material-symbols-outlined { visibility: visible !important; }`}</style>
        </noscript>
        <Providers>{children}</Providers>
        <DeferredVercelInsights />
      </body>
    </html>
  );
}