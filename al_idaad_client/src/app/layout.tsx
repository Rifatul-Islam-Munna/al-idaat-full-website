import type { Metadata } from "next";
import "./globals.css";
import { DM_Serif_Display, Outfit, Poppins, Proza_Libre } from "next/font/google";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/components/shared/CartContext";
import WhatsApp from "@/components/shared/WhatsApp";

const outfit = Outfit({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800", "900"],
    style: ["normal"],
    variable: "--font-outfit",
    display: "swap",
});

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800", "900"],
    variable: "--font-poppins",
    display: "swap",
});

const proza = Proza_Libre({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-proza-libre",
    display: "swap",
});

// const belanosima = Belanosima({
//     subsets: ["latin"],
//     weight: ["400", "600", "700"],
//     variable: "--font-belanosima",
//     display: "swap",
// });

// const oswald = Oswald({
//     subsets: ["latin"],
//     weight: ["300", "400", "500", "600", "700"],
//     variable: "--font-oswald",
//     display: "swap",
// });

const dmSerif = DM_Serif_Display({
    subsets: ["latin"],
    weight: ["400"], // only available weight
    variable: "--font-dm-serif",
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL("https://alidaad.com"), // 🔁 replace with your real domain

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
        description: "Premium Thobe, Panjabi, Shirts & Attar in Bangladesh. Elevate your modest fashion with Al Idaad.",
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

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${outfit.variable} ${poppins.variable} ${proza.variable} ${dmSerif.variable} antialiased bg-bg_main text-text_dark font-outfit select-none`}
            >
                <CartProvider>
                    <div className="max-w-480 mx-auto pt-18 md:pt-25">
                        <Navbar></Navbar>
                        {children}
                        <Toaster position="bottom-right" reverseOrder={false} />
                        <Footer></Footer>
                    </div>
                </CartProvider>
                <WhatsApp></WhatsApp>
            </body>
        </html>
    );
}
