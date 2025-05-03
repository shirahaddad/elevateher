import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Elevate(Her) - Empowering Women in Tech",
    template: "%s | Elevate(Her)"
  },
  description: "Empowering women in tech through coaching, mentorship, and leadership development. Join our community of women leaders in technology.",
  keywords: ["women in tech", "tech leadership", "career coaching", "mentorship", "women empowerment", "tech career", "leadership development"],
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
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
