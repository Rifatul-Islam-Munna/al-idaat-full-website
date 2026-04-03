"use client";

import Image from "next/image";
import {
  HiOutlinePhone,
  HiOutlineMapPin,
  HiOutlineEnvelope,
  HiArrowRight,
} from "react-icons/hi2";
import { FaWhatsapp } from "react-icons/fa";

interface ContactCard {
  label: string;
  value: string;
  sub: string;
  href: string;
  icon: React.ReactNode;
}

interface SocialLink {
  name: string;
  handle: string;
  href: string;
  icon: string;
}

const contactCards: ContactCard[] = [
  {
    label: "WhatsApp",
    value: "+8801734874385",
    sub: "Chat with us directly",
    href: "https://wa.me/8801734874385",
    icon: <HiOutlinePhone size={20} />,
  },
  {
    label: "Our Location",
    value: "Lucky Plaza, Agrabad",
    sub: "Chittagong, Bangladesh",
    href: "https://maps.app.goo.gl/r2RjpQCgdSoF3TxPA",
    icon: <HiOutlineMapPin size={20} />,
  },
  {
    label: "Email Us",
    value: "alidaadshop@gmail.com",
    sub: "Reply within 24 hours",
    href: "mailto:alidaadshop@gmail.com",
    icon: <HiOutlineEnvelope size={20} />,
  },
];

const socialLinks: SocialLink[] = [
  {
    name: "Facebook",
    handle: "@Al Idaad",
    href: "https://www.facebook.com/share/187FiqDCFr",
    icon: "https://res.cloudinary.com/durvy5ois/image/upload/v1772582111/facebook_dqdr7j.png",
  },
  {
    name: "Instagram",
    handle: "@al_idaad",
    href: "https://www.instagram.com/al_idaad?igsh=MXA1NmF0Njd2dzN6Nw==",
    icon: "https://res.cloudinary.com/durvy5ois/image/upload/v1772582115/instagram_wgifjn.png",
  },
  {
    name: "TikTok",
    handle: "@al_idaad",
    href: "https://www.tiktok.com/@al_idaad?_r=1&_t=ZS-94JLSULG4lI",
    icon: "https://res.cloudinary.com/durvy5ois/image/upload/v1772582112/tik-tok_ygyaa5.png",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-bg_main text-gray-900">
      <main className="mx-auto max-w-5xl px-4 py-16">
        {/* HEADING */}
        <div className="mb-12 border-b border-gray-200 pb-10">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            Contact
          </p>
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            We&apos;re here to help
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-gray-500">
            Reach out through WhatsApp, email, or visit us in store — we&apos;re
            always happy to hear from you.
          </p>
        </div>

        {/* CONTACT CARDS */}
        <div className="mb-10 grid gap-px bg-gray-200 md:grid-cols-3">
          {contactCards.map((card) => (
            <a
              key={card.label}
              href={card.href}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col gap-3 bg-bg_main px-6 py-7 transition-colors duration-200 hover:bg-gray-50"
            >
              <span className="text-brand">{card.icon}</span>

              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                  {card.label}
                </p>
                <p className="text-sm font-semibold text-gray-900 md:text-base">
                  {card.value}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">{card.sub}</p>
              </div>

              <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-brand opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                Open <HiArrowRight size={13} />
              </span>
            </a>
          ))}
        </div>

        {/* MAP + SOCIAL */}
        <div className="mb-10 grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* MAP */}
          <div className="border border-gray-200 bg-bg_main">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                  Find us here
                </p>
                <h2 className="text-base font-bold text-gray-900">
                  Store Location
                </h2>
              </div>
              <a
                href="https://maps.app.goo.gl/r2RjpQCgdSoF3TxPA"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-opacity hover:opacity-75"
              >
                Get Directions <HiArrowRight size={14} />
              </a>
            </div>

            <div className="h-64 overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1845.348973029149!2d91.8096215!3d22.3272605!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30acd8ca508ffad1%3A0xb39d3f40b620b26b!2sLucky%20Plaza!5e0!3m2!1sen!2sbd!4v1772893809822!5m2!1sen!2sbd"
                loading="lazy"
                title="Shop Location"
                className="h-full w-full border-0"
              />
            </div>

            <div className="border-t border-gray-200 px-6 py-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400">
                Wednesday – Friday
              </p>
              <p className="mt-0.5 text-sm font-semibold text-gray-900">
                10:00 am – 11:00 pm
              </p>
            </div>
          </div>

          {/* SOCIAL */}
          <div className="border border-gray-200 bg-bg_main">
            <div className="border-b border-gray-200 px-6 py-5">
              <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                Follow along
              </p>
              <h2 className="text-base font-bold text-gray-900">
                Social Media
              </h2>
            </div>

            <div className="flex flex-col divide-y divide-gray-200">
              {socialLinks.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden bg-gray-100">
                      <Image
                        src={s.icon}
                        alt={s.name}
                        width={22}
                        height={22}
                        unoptimized
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {s.name}
                      </p>
                      <p className="text-xs text-gray-400">{s.handle}</p>
                    </div>
                  </div>
                  <HiArrowRight
                    size={16}
                    className="text-gray-300 transition-colors group-hover:text-brand"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-wrap items-center justify-between gap-5 border border-gray-200 bg-gray-50 px-8 py-8">
          <div>
            <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
              Fastest response
            </p>
            <h2 className="text-xl font-bold text-gray-900">
              Ready to place an order?
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Message us on WhatsApp — we reply fast.
            </p>
          </div>
          <a
            href="https://wa.me/8801734874385"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-brand px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-85"
          >
            <FaWhatsapp size={18} />
            Chat on WhatsApp
          </a>
        </div>
      </main>
    </div>
  );
}
