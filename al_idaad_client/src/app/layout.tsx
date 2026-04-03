import type { Metadata } from "next";
import "./globals.css";
import { Playfair_Display } from "next/font/google";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/components/shared/CartContext";
import WhatsApp from "@/components/shared/WhatsApp";
import { getCategories } from "@/utils/fetchData";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://alidaad.com"),

  title: {
    default: "Al Idaad | Premium Clothing & Attar in Bangladesh",
    template: "%s | Al Idaad",
  },

  description:
    "Shop premium Islamic clothing in Bangladesh. Buy Thobe, Panjabi, Shirts, Pants and Attar from Al Idaad. جودة, style, and modest fashion in one place.",

  keywords: [
    "Al Idaad",
    "clothing Bangladesh",
    "Thobe Bangladesh",
    "Panjabi Bangladesh",
    "Attar Bangladesh",
    "Modest fashion BD",
    "Islamic dress for men",
    "Arabic thobe BD",
    "perfume attar Bangladesh",
  ],

  authors: [{ name: "Al Idaad" }],
  creator: "Al Idaad",

  openGraph: {
    title: "Al Idaad | Clothing & Attar",
    description:
      "Premium Thobe, Panjabi, Shirts & Attar in Bangladesh. Elevate your modest fashion with Al Idaad.",
    url: "https://alidaad.com",
    siteName: "Al Idaad",
    locale: "en_BD",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Al Idaad | Clothing Bangladesh",
    description: "Buy Thobe, Panjabi & Attar online in Bangladesh.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories();
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} antialiased bg-bg_main text-text_dark font-inter select-none`}
      >
        <CartProvider>
          <div className="max-w-480 mx-auto pt-18 md:pt-25">
            <Navbar categories={categories} />
            {children}
            <Toaster position="bottom-right" reverseOrder={false} />
            <Footer />
          </div>
        </CartProvider>
        <WhatsApp />
      </body>
    </html>
  );
}
