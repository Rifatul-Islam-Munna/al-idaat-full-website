"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { CartItem, useCart } from "./CartContext";
import SearchBox from "./SearchBox";

// ─── Helper: human-readable subtitle for a cart line item ────────────────────

const getItemSubtitle = (item: CartItem): string | null => {
    if (item.selectedVariant) {
        const v = item.selectedVariant;
        const parts: string[] = [`Size: ${v.size}`];
        if (v.color) parts.push(`Color: ${v.color}`);
        if (v.chest) parts.push(`Chest: ${v.chest}"`);
        if (v.length) parts.push(`Length: ${v.length}"`);
        return parts.join(" · ");
    }
    if (item.selectedAttarSize) {
        return `${item.selectedAttarSize.ml} ml`;
    }
    return null;
};

// ─── Search icon SVG ─────────────────────────────────────────────────────────

const SearchIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="m21 21-4.34-4.34" />
        <circle cx="11" cy="11" r="8" />
    </svg>
);

// ─── Navbar ───────────────────────────────────────────────────────────────────

const Navbar = () => {
    const pathname = usePathname();
    const isHome = pathname === "/";

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const { items, totalQty, totalPrice, increaseQty, decreaseQty, removeItem } = useCart();

    const [visible, setVisible] = useState(true);
    const [animate, setAnimate] = useState(false);
    const [fade, setFade] = useState(false);
    const visibleRef = useRef(visible);
    const animateRef = useRef(animate);
    const fadeRef = useRef(fade);

    const effectiveVisible = isHome ? visible : true;
    const effectiveAnimate = isHome ? animate : false;
    const effectiveFade = isHome ? fade : false;

    const links = [
        { href: "/", label: "Home" },
        { href: "/all-products", label: "All Products" },
        { href: "/blog", label: "Blog" },
        { href: "/faq", label: "FAQ" },
        { href: "/contact", label: "Contact Us" },
    ];

    useEffect(() => {
        if (!isHome) return;

        const handleScroll = () => {
            const scrollY = window.scrollY;
            let newVisible = visibleRef.current;
            let newAnimate = animateRef.current;
            let newFade = fadeRef.current;

            if (scrollY === 0) {
                newVisible = true;
                newAnimate = false;
                newFade = true;
            } else if (scrollY > 500) {
                newVisible = true;
                newAnimate = true;
                newFade = false;
            } else {
                newVisible = false;
                newAnimate = false;
                newFade = false;
            }

            if (newVisible !== visibleRef.current) {
                setVisible(newVisible);
                visibleRef.current = newVisible;
            }
            if (newAnimate !== animateRef.current) {
                setAnimate(newAnimate);
                animateRef.current = newAnimate;
            }
            if (newFade !== fadeRef.current) {
                setFade(newFade);
                fadeRef.current = newFade;
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isHome]);

    // Close search on route change — in-render state adjustment (no useEffect)
    const [prevPathname, setPrevPathname] = useState(pathname);
    if (prevPathname !== pathname) {
        setPrevPathname(pathname);
        setIsSearchOpen(false);
    }

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 border border-border transform
                ${effectiveVisible ? "translate-y-0" : "-translate-y-full"}
                ${effectiveAnimate ? "transition-transform duration-500 ease-in-out" : "transition-none"}
                ${effectiveFade ? "opacity-0 animate-fadeIn" : "opacity-100"}
                ${effectiveAnimate ? "bg-black/70 border-none mx-3 mt-2 rounded-2xl" : "bg-bg_main"}`}
            >
                <div className="h-18 md:h-25 px-4 max-w-7xl mx-auto flex items-center">
                    {/* ── MOBILE ── */}
                    <div className="flex lg:hidden w-full items-center">
                        <div className="flex items-center">
                            <button
                                onClick={() => setIsMenuOpen(true)}
                                className={`w-10 h-10 hover:bg-brand/50 active:scale-95 transition duration-150 flex justify-center items-center rounded-full ${effectiveAnimate ? "text-white" : "text-text_normal"}`}
                                aria-label="Open menu"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="22"
                                    height="22"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="4" y1="6" x2="20" y2="6" />
                                    <line x1="4" y1="12" x2="20" y2="12" />
                                    <line x1="4" y1="18" x2="20" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <h1 className={`flex-1 text-center font-dm-serif text-3xl select-none ${effectiveAnimate ? "text-white" : "text-text_dark"}`}>
                            Al Idaad
                        </h1>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className={`w-10 h-10 hover:bg-brand/50 active:scale-95 transition duration-150 flex justify-center items-center rounded-full ${effectiveAnimate ? "text-white" : "text-text_normal"}`}
                                aria-label="Search"
                            >
                                <SearchIcon />
                            </button>
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className={`relative w-10 h-10 hover:bg-brand/50 active:scale-95 transition duration-150 flex justify-center items-center rounded-full ${effectiveAnimate ? "text-white hover:bg-white/20" : "text-text_normal"}`}
                                aria-label="Cart"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="8" cy="21" r="1" />
                                    <circle cx="19" cy="21" r="1" />
                                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                                </svg>
                                {Boolean(totalQty) && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                        {totalQty}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ── DESKTOP ── */}
                    <div className="hidden lg:flex w-full items-center justify-between">
                        <h1 className={`text-3xl select-none font-dm-serif ${effectiveAnimate ? "text-white" : "text-text_dark"}`}>Al Idaad</h1>
                        <div className="flex gap-4 items-center">
                            {links.map(({ href, label }) => {
                                const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={`relative py-1.5 pb-1 transition-colors duration-200 group font-bold text-sm
                                            ${
                                                effectiveAnimate
                                                    ? isActive
                                                        ? "text-yellow-400"
                                                        : "text-white hover:text-gray-300"
                                                    : isActive
                                                      ? "text-brand"
                                                      : "text-text_normal"
                                            }`}
                                    >
                                        {label}
                                        <span
                                            className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ease-out
                                            ${
                                                effectiveAnimate
                                                    ? isActive
                                                        ? "w-full bg-yellow-400"
                                                        : "w-0 group-hover:w-full bg-white/70"
                                                    : isActive
                                                      ? "w-full bg-brand"
                                                      : "w-0 group-hover:w-full bg-brand"
                                            }`}
                                        />
                                    </Link>
                                );
                            })}
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className={`w-10 h-10 hover:bg-white/20 active:scale-95 transition duration-150 flex justify-center items-center rounded-full ${effectiveAnimate ? "text-white" : "text-text_normal"}`}
                                aria-label="Search"
                            >
                                <SearchIcon />
                            </button>
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className={`relative w-10 h-10 hover:bg-brand/50 active:scale-95 transition duration-150 flex justify-center items-center rounded-full ${effectiveAnimate ? "text-white hover:bg-white/20" : "text-text_normal"}`}
                                aria-label="Cart"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="8" cy="21" r="1" />
                                    <circle cx="19" cy="21" r="1" />
                                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                                </svg>
                                {Boolean(totalQty) && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                        {totalQty}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* key forces a fresh remount each open — state and fetch start clean */}
            <SearchBox key={String(isSearchOpen)} isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            {/* ── Shared Overlay (menu + cart) ── */}
            <div
                onClick={() => {
                    setIsMenuOpen(false);
                    setIsCartOpen(false);
                }}
                className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300
                    ${isMenuOpen || isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            />

            {/* ── Mobile Menu Drawer ── */}
            <div
                className={`fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <span className="font-bold text-lg text-text_normal tracking-tight">Menu</span>
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-95 transition duration-150"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#17313e"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <nav className="flex flex-col px-4 py-4 gap-1">
                    {links.map(({ href, label }) => {
                        const isActive = pathname === href;
                        const iconMap: Record<string, React.ReactNode> = {
                            "/": (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                            ),
                            "/all-products": (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <path d="M16 10a4 4 0 0 1-8 0" />
                                </svg>
                            ),
                            "/blog": (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                    <line x1="10" y1="9" x2="8" y2="9" />
                                </svg>
                            ),
                            "/faq": (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                            ),
                            "/contact": (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.55 5.55l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z" />
                                </svg>
                            ),
                        };
                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`relative flex items-center gap-3 px-3 py-3 transition-colors duration-200 group overflow-hidden ${isActive ? "text-brand" : "text-text_normal"}`}
                            >
                                <span
                                    className={`transition-colors duration-200 ${isActive ? "text-brand" : "text-gray-400 group-hover:text-brand"}`}
                                >
                                    {iconMap[href]}
                                </span>
                                {label}
                                <span
                                    className={`absolute bottom-0 left-0 h-0.5 bg-brand transition-all duration-300 ease-out ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}
                                />
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* ── Cart Drawer ── */}
            <div
                className={`fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-text_normal tracking-tight">Cart</span>
                        {totalQty > 0 && <span className="bg-brand text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalQty}</span>}
                    </div>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-95 transition duration-150"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#17313e"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="flex flex-col h-[calc(100%-73px)]">
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="48"
                                    height="48"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="8" cy="21" r="1" />
                                    <circle cx="19" cy="21" r="1" />
                                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                                </svg>
                                <p className="text-sm font-medium">Your cart is empty</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {items.map((item) => {
                                    const subtitle = getItemSubtitle(item);
                                    return (
                                        <div key={item.cartKey} className="flex gap-3 border-b border-gray-100 pb-3">
                                            <Image
                                                src={item.thumbnail}
                                                width={64}
                                                height={80}
                                                alt={item.name}
                                                className="w-16 h-20 object-cover rounded-lg shrink-0"
                                            />
                                            <div className="flex flex-col justify-between flex-1 min-w-0">
                                                <div className="flex justify-between gap-1">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-text_normal truncate">{item.name}</p>
                                                        <p className="text-xs text-gray-400">{item.category.name}</p>
                                                        {subtitle && (
                                                            <span className="inline-block mt-1 text-[10px] font-semibold bg-brand/10 text-brand px-2 py-0.5 rounded-full">
                                                                {subtitle}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(item.cartKey)}
                                                        className="text-xs text-red-400 hover:text-red-600 shrink-0 transition-colors"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-brand font-bold text-sm">
                                                        ৳ {(item.price * item.quantity).toLocaleString()}
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            onClick={() => decreaseQty(item.cartKey)}
                                                            className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-sm font-medium transition-colors"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                                                        <button
                                                            onClick={() => increaseQty(item.cartKey)}
                                                            className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-sm font-medium transition-colors"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {items.length > 0 && (
                        <div className="border-t border-gray-100 p-4 space-y-3 bg-white">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">
                                    Subtotal ({totalQty} item{totalQty > 1 ? "s" : ""})
                                </span>
                                <span className="font-bold text-text_normal">৳ {totalPrice.toLocaleString()}</span>
                            </div>
                            <Link
                                href="/checkout"
                                onClick={() => setIsCartOpen(false)}
                                className="block w-full bg-brand text-white text-center py-3 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition duration-150"
                            >
                                Proceed to Checkout
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Navbar;
