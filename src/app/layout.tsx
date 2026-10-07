import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyTourbee — Discover. Plan. Travel.",
  description:
    "Tour packages, things to do, cruises and custom trips — all in one place. Discover unforgettable places, experiences and journeys with MyTourbee.",
  openGraph: {
    title: "MyTourbee — Discover. Plan. Travel.",
    description: "Your complete travel companion.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col pb-16 md:pb-0">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
