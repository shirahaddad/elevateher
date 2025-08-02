import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AnalyticsTracker from "../components/analytics/AnalyticsTracker";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Elevate(Her) - Women in Tech Coaching & Leadership Development",
    template: "%s | Elevate(Her)"
  },
  description: "Expert women in tech coaching, leadership development, and career mentorship. Specialized coaching for women in technology, engineering, and STEM careers. Executive coaching for tech leaders.",
  keywords: ["women in tech coaching", "tech leadership coaching", "women in technology careers", "engineering career coaching", "STEM leadership development", "women tech executives", "tech career mentorship", "software engineering coaching", "women in engineering", "tech industry coaching", "career coaching", "mentorship", "women empowerment", "leadership development"],
  authors: [{ name: "Shira Haddad" }],
  creator: "Elevate(Her)",
  publisher: "Elevate(Her)",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://elevateher.tech'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Elevate(Her) - Empowering Women in Tech",
    description: "Empowering women in tech through coaching, mentorship, and leadership development. Join our community of women leaders in technology.",
    url: 'https://elevateher.tech',
    siteName: 'Elevate(Her)',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Elevate(Her) - Empowering Women in Tech',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Elevate(Her) - Empowering Women in Tech",
    description: "Empowering women in tech through coaching, mentorship, and leadership development.",
    images: ['/images/twitter-image.jpg'],
    creator: '@elevatehertech',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon_2.ico' },
      { url: '/favicon-16x16_2.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32_2.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon_2.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { url: '/android-chrome-192x192_2.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512_2.png', sizes: '512x512', type: 'image/png' }
    ]
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Google Analytics */}
        <Script 
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `}
        </Script>
        
        {/* Global skip link for keyboard users */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-purple-600 text-white px-4 py-2 rounded-md z-50"
        >
          Skip to main content
        </a>
        
        <Header />
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
        <Footer />
        <AnalyticsTracker />
        <SpeedInsights />
      </body>
    </html>
  );
}
