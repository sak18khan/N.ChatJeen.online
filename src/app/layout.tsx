import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChatJeen | Meet New People Safely & Anonymously",
  description: "ChatJeen is a secure, anonymous, and free platform to meet new people. Connect instantly for text chat and high-quality voice calls. Safe, private, and forever free.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "ChatJeen | Meet New People Safely",
    description: "Connect instantly and securely with people around the world. Free anonymous text and voice chats.",
    url: "https://www.chatjeen.online",
    siteName: "ChatJeen",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChatJeen | Meet New People Safely",
    description: "Connect instantly and securely with people around the world. Free anonymous text and voice chats.",
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
    "description": "Secure anonymous platform for connecting with new people safely via text chat and voice calls. Free and private.",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased selection:bg-primary/20">
        {children}
      </body>
    </html>
  );
}
