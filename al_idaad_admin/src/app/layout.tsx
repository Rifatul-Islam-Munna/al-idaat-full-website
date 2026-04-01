import type { Metadata } from "next";
import "./globals.css";
import { DM_Serif_Display, Outfit, Poppins, Proza_Libre } from "next/font/google";
import { AuthProvider } from "@/components/shared/AuthContext";

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

const dmSerif = DM_Serif_Display({
    subsets: ["latin"],
    weight: ["400"], // only available weight
    variable: "--font-dm-serif",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Al Idaad",
    description: "Al Idaad is a clithing brand mainly sells Thobe and Islamic items",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${outfit.variable} ${poppins.variable} ${proza.variable} ${dmSerif.variable} antialiased bg-bg_main text-text_dark font-outfit`}
            >
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}
