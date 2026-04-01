"use client";
// import fb from "@/assets/facebook.png";
// import instagram from "@/assets/instagram.png";
// import tiktok from "@/assets/tiktok.png";

// import Image, { StaticImageData } from "next/image";
import Image from "next/image";
import { useState } from "react";

interface ContactCard {
    label: string;
    value: string;
    sub: string;
    gradient: string;
    shadow: string;
    href: string;
}

interface SocialLink {
    name: string;
    handle: string;
    href: string;
    // icon: StaticImageData;
    icon: string;
}

const contactCards: ContactCard[] = [
    {
        label: "WhatsApp",
        value: "+8801734874385",
        sub: "Chat with us directly",
        gradient: "from-[#25D366] to-[#128C7E]",
        shadow: "shadow-green-300/40",
        href: "https://wa.me/8801734874385",
    },
    {
        label: "Our Location",
        value: "Lucky Plaza, Agrabad",
        sub: "Chittagong, Bangladesh",
        gradient: "from-[#FF6B6B] to-[#FF3CAC]",
        shadow: "shadow-pink-300/40",
        href: "https://maps.app.goo.gl/r2RjpQCgdSoF3TxPA",
    },
    {
        label: "Email Us",
        value: "alidaadshop@gmail.com",
        sub: "Reply within 24 hours",
        gradient: "from-[#6C63FF] to-[#3B82F6]",
        shadow: "shadow-violet-300/40",
        href: "mailto:alidaadshop@gmail.com",
    },
];

const socialLinks: SocialLink[] = [
    {
        name: "Facebook",
        handle: "Al Idaad",
        href: "https://www.facebook.com/share/187FiqDCFr",
        icon: "https://res.cloudinary.com/durvy5ois/image/upload/v1772582111/facebook_dqdr7j.png",
    },
    {
        name: "Instagram",
        handle: "Al Idaad",
        href: "https://www.instagram.com/al_idaad?igsh=MXA1NmF0Njd2dzN6Nw==",
        icon: "https://res.cloudinary.com/durvy5ois/image/upload/v1772582115/instagram_wgifjn.png",
    },
    {
        name: "TikTok",
        handle: "Al Idaad",
        href: "https://www.tiktok.com/@al_idaad?_r=1&_t=ZS-94JLSULG4lI",
        icon: "https://res.cloudinary.com/durvy5ois/image/upload/v1772582112/tik-tok_ygyaa5.png",
    },
];

export default function ContactPage() {
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-[#F4F6FB] text-[#1a1a2e]">
            <main className="max-w-7xl mx-auto py-20 px-4">
                {/* HEADING */}
                <div className="mb-11">
                    <p className="text-[11px] font-bold tracking-widest uppercase text-violet-500 mb-2">✦ Get in touch</p>
                    <h1 className="font-extrabold text-4xl mb-3">We&apos;re here to help you</h1>
                    <p className="text-[#7c82a0] max-w-md">
                        Reach out through WhatsApp, email, or visit us in store — we&apos;re always happy to hear from you.
                    </p>
                </div>

                {/* CONTACT CARDS */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                    {contactCards.map((card, i) => (
                        <a
                            key={card.label}
                            href={card.href}
                            target="_blank"
                            rel="noreferrer"
                            onMouseEnter={() => setHovered(i)}
                            onMouseLeave={() => setHovered(null)}
                            className={[
                                "relative overflow-hidden rounded-2xl p-7 block text-white",
                                "bg-linear-to-br",
                                card.gradient,
                                "shadow-lg",
                                card.shadow,
                                "transition-transform duration-300 hover:-translate-y-2",
                            ].join(" ")}
                        >
                            {/* Blob effect */}
                            <div
                                className={[
                                    "absolute -top-7 -right-7 size-28 rounded-full bg-white/10 transition-transform duration-500",
                                    hovered === i ? "scale-150" : "scale-100",
                                ].join(" ")}
                            />

                            <div className="relative z-10">
                                <p className="text-[10px] uppercase tracking-widest text-white/70 mb-1">{card.label}</p>
                                <p className="font-bold text-base mb-1">{card.value}</p>
                                <p className="text-sm text-white/75">{card.sub}</p>
                            </div>
                        </a>
                    ))}
                </div>

                {/* MAP + SOCIAL */}
                <div className="grid lg:grid-cols-[1fr_355px] gap-6 mb-6">
                    {/* MAP */}
                    <div className="bg-white rounded-2xl p-6 border-border border shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p className="text-xs uppercase text-gray-400 mb-1">Find us here</p>
                                <h2 className="font-bold text-lg">Our Store Location</h2>
                            </div>
                            <a
                                href="https://maps.app.goo.gl/r2RjpQCgdSoF3TxPA"
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2 bg-pink-50 text-pink-500 rounded-lg text-sm font-semibold border-border border"
                            >
                                Get Directions →
                            </a>
                        </div>

                        <div className="h-64 rounded-xl overflow-hidden border-border border">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1845.348973029149!2d91.8096215!3d22.3272605!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30acd8ca508ffad1%3A0xb39d3f40b620b26b!2sLucky%20Plaza!5e0!3m2!1sen!2sbd!4v1772893809822!5m2!1sen!2sbd"
                                loading="lazy"
                                title="Shop Location"
                                className="w-full h-full border-border border-0"
                            />
                        </div>

                        <div className="flex mt-4">
                            <div className="flex-1 p-3 bg-gray-50 rounded-lg border-border border">
                                <p className="text-xs text-gray-400 mb-1">Wednesday - Friday</p>
                                <p className="font-semibold text-sm">10.00 am - 11.00 pm</p>
                            </div>
                        </div>
                    </div>

                    {/* SOCIAL */}
                    <div className="bg-white rounded-2xl p-6 border-border border shadow-sm flex flex-col">
                        <p className="text-xs uppercase text-gray-400 mb-1">Follow along</p>
                        <h2 className="font-bold text-lg mb-4">Social Media</h2>

                        <div className="flex flex-col gap-3">
                            {socialLinks.map((s) => (
                                <a
                                    key={s.name}
                                    href={s.href}
                                    className="flex justify-between items-center px-4 py-3 rounded-lg border-border border bg-gray-50 hover:bg-white transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="size-9 rounded-lg overflow-hidden flex items-center justify-center bg-white  shrink-0">
                                            <Image src={s.icon} alt={s.name} width={28} height={28} className="object-contain" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{s.name}</p>
                                            <p className="text-xs text-gray-400">{s.handle}</p>
                                        </div>
                                    </div>
                                    <span className="text-gray-400">→</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="rounded-2xl bg-linear-to-br from-[#25D366] to-[#128C7E] p-8 flex flex-wrap justify-between items-center gap-4 text-white shadow-xl">
                    <div>
                        <h2 className="font-bold text-xl mb-1">Ready to place an order?</h2>
                        <p className="text-white/80 text-sm">Message us on WhatsApp — fastest response guaranteed.</p>
                    </div>
                    <a href="https://wa.me/8801734874385" className="bg-white text-[#128C7E] font-bold px-6 py-3 rounded-lg">
                        Chat on WhatsApp
                    </a>
                </div>
            </main>
        </div>
    );
}
