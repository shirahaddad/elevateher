import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ElevateHer - Empowering Women in Leadership",
  description: "Professional development and leadership coaching for women",
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
        <main className="pt-14 min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
