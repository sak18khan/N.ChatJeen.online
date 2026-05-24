import type { Metadata } from 'next';
import HomeClient from '@/components/HomeClient';

export const metadata: Metadata = {
  title: "ChatJeen | Meet New People Safely & Anonymously",
  description: "ChatJeen is a free, anonymous text chat platform. Connect instantly with strangers worldwide. No registration. 100% private.",
  alternates: {
    canonical: 'https://www.chatjeen.online'
  },
  openGraph: {
    title: "ChatJeen | Meet New People Safely & Anonymously",
    description: "ChatJeen is a free, anonymous text chat platform. Connect instantly with strangers worldwide. No registration. 100% private.",
    url: "https://www.chatjeen.online",
    siteName: "ChatJeen",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "ChatJeen | Meet New People Safely & Anonymously",
    description: "ChatJeen is a free, anonymous text chat platform. Connect instantly with strangers worldwide. No registration. 100% private."
  }
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ChatJeen",
    "applicationCategory": "SocialNetworkingApplication",
    "operatingSystem": "Web",
    "offers": { 
      "@type": "Offer", 
      "price": "0", 
      "priceCurrency": "USD" 
    },
    "url": "https://www.chatjeen.online",
    "description": "Free anonymous text chat. Meet new people instantly."
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}
