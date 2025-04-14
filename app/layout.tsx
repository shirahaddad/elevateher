import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Elevate(Her)",
    template: "Elevate(Her)"
  },
  description: "Empowering women in tech through coaching and mentorship",
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
