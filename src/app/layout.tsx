import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "ChatJeen | Anonymous, Secure & Free Chat",
  description: "ChatJeen is the world's most secure and anonymous chat experiment. Connect for text chat and encrypted voice calls with zero sign-up required. Secure, private, and forever free.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "ChatJeen | Anonymous & Secure Chat",
    description: "Secure, high-contrast, and private anonymous chat and voice experiment.",
    url: "https://www.chatjeen.online",
    siteName: "ChatJeen",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChatJeen | Anonymous & Secure Chat",
    description: "Connect anonymously with people around the world for text and voice. Secure, private, and free.",
  },
};

export const viewport: Viewport = {
  themeColor: "#5CE65C",
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
    "description": "Secure anonymous chat platform for text chat and voice calls. Forever free and private.",
    "applicationCategory": "SocialNetworkingApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased selection:bg-primary/20">
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
