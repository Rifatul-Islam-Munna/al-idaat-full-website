import facebook from "@/assets/facebook.png";
import whatsapp from "@/assets/whatsapp.png";
import tiktok from "@/assets/tiktok.png";
import instagram from "@/assets/instagram.png";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gray-900 px-4 py-16 text-gray-300">
      <div className="mx-auto max-w-6xl">
        {/* 3-column grid with vertical middle layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 mb-12 border-b border-gray-800">
          {/* Brand - Left */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl md:text-[2.25rem] font-bold tracking-tight font-dm-serif leading-tight">
                Al Idaad
              </h1>
              <p className="text-sm leading-6 text-gray-400 font-proza-libre max-w-[14rem]">
                A symbol of trust, quality & elegance
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <a
                href="https://www.facebook.com/share/187FiqDCFr"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2.5 hover:bg-gray-800/50 hover:scale-[1.05] transition-all duration-200 rounded-xl"
              >
                <Image
                  src={facebook}
                  alt="Facebook"
                  width={24}
                  height={24}
                  className="group-hover:opacity-90"
                />
              </a>
              <a
                href="https://wa.me/8801734874385"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2.5 hover:bg-brand/10 hover:scale-[1.05] transition-all duration-200 rounded-xl"
              >
                <Image
                  src={whatsapp}
                  alt="WhatsApp"
                  width={24}
                  height={24}
                  className="group-hover:opacity-90"
                />
              </a>
              <a
                href="https://www.tiktok.com/@al_idaad?_r=1&_t=ZS-94JLSULG4lI"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2.5 hover:bg-gray-800/50 hover:scale-[1.05] transition-all duration-200 rounded-xl"
              >
                <Image
                  src={tiktok}
                  alt="TikTok"
                  width={24}
                  height={24}
                  className="group-hover:opacity-90"
                />
              </a>
              <a
                href="https://www.instagram.com/al_idaad?igsh=MXA1NmF0Njd2dzN6Nw=="
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2.5 hover:bg-gray-800/50 hover:scale-[1.05] transition-all duration-200 rounded-xl"
              >
                <Image
                  src={instagram}
                  alt="Instagram"
                  width={24}
                  height={24}
                  className="group-hover:opacity-90"
                />
              </a>
            </div>
          </div>

          {/* Contact - Middle (Vertical layout like original) */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white leading-tight">
              Contact Information
            </h3>

            <div className="space-y-4 text-sm">
              <a
                href="mailto:alidaadshop@gmail.com"
                className="group flex items-start gap-3 hover:text-white transition-all duration-200"
              >
                <svg
                  className="mt-1 w-5 h-5 text-brand flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="leading-6 group-hover:underline font-medium">
                  alidaadshop@gmail.com
                </span>
              </a>

              <a
                href="tel:+8801734874385"
                className="group flex items-start gap-3 hover:text-white transition-all duration-200"
              >
                <svg
                  className="mt-1 w-5 h-5 text-brand flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span className="leading-6 group-hover:underline font-medium">
                  +880 1734 874385
                </span>
              </a>

              <div className="flex items-start gap-3">
                <svg
                  className="mt-1 w-5 h-5 text-brand flex-shrink-0 opacity-80"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="leading-6 font-medium">
                  Agrabad, Chittagong
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links - Right */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white leading-tight">
              Quick Links
            </h3>

            <nav className="space-y-3 text-sm">
              <Link
                href="/"
                className="block group hover:text-white transition-all duration-200"
              >
                <span className="group-hover:underline font-medium block">
                  Home
                </span>
              </Link>
              <Link
                href="/all-products"
                className="block group hover:text-white transition-all duration-200"
              >
                <span className="group-hover:underline font-medium block">
                  All Products
                </span>
              </Link>
              <Link
                href="/blog"
                className="block group hover:text-white transition-all duration-200"
              >
                <span className="group-hover:underline font-medium block">
                  Blog
                </span>
              </Link>
              <Link
                href="/contact"
                className="block group hover:text-white transition-all duration-200"
              >
                <span className="group-hover:underline font-medium block">
                  Contact
                </span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom bar - Professional & centered */}
        <div className="pt-8 pb-4 flex flex-col items-center gap-3 text-xs text-gray-500 md:flex-row md:items-center md:justify-between md:gap-0">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-brand"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">Safe Shopping Guaranteed</span>
          </div>
          <p className="font-medium">© 2026 Al Idaad. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
