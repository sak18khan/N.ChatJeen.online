import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import PwaBanner from "@/components/PwaBanner";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ChatJeen | Meet New People Safely & Anonymously",
  description: "ChatJeen is a secure, anonymous, and free platform to meet new people. Connect instantly for private text chat. Safe, private, and forever free.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg?v=2",
    shortcut: "/favicon.svg?v=2",
    apple: "/favicon.svg?v=2",
  },
  openGraph: {
    title: "ChatJeen | Meet New People Safely",
    description: "Connect instantly and securely with people around the world for private text-only chat.",
    url: "https://www.chatjeen.online",
    siteName: "ChatJeen",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChatJeen | Meet New People Safely",
    description: "Connect instantly and securely with people around the world for private text-only chat.",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "ChatJeen",
    "url": "https://www.chatjeen.online",
    "description": "Secure anonymous platform for connecting with new people safely via private text chat. Free and private.",
    "applicationCategory": "SocialNetworkingApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <html lang="en" className="dark">
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-FEFVX6XJY6" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-FEFVX6XJY6');
            `,
          }}
        />
        <meta name="google-adsense-account" content="ca-pub-6764669459611839" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${plusJakarta.variable} ${outfit.variable} antialiased selection:bg-primary/20 font-sans`}>
        {children}
        <PwaBanner />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6764669459611839"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
