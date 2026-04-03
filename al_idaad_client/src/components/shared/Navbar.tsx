"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CartItem, useCart } from "./CartContext";
import SearchBox from "./SearchBox";
import { FiMenu, FiX, FiSearch, FiShoppingBag } from "react-icons/fi";
import { CategoryType } from "@/utils/types";

type NavbarProps = {
  categories: CategoryType[];
};

const getItemSubtitle = (item: CartItem): string | null => {
  if (item.selectedVariant) {
    const v = item.selectedVariant;
    const parts: string[] = [`Size: ${v.size}`];
    if (v.color) parts.push(`Color: ${v.color}`);
    if (v.chest) parts.push(`Chest: ${v.chest}"`);
    if (v.length) parts.push(`Length: ${v.length}"`);
    return parts.join(" · ");
  }
  if (item.selectedAttarSize) return `${item.selectedAttarSize.ml} ml`;
  return null;
};

const Navbar = ({ categories }: NavbarProps) => {
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { items, totalQty, totalPrice, increaseQty, decreaseQty, removeItem } =
    useCart();

  const links = [
    { href: "/", label: "Home" },
    { href: "/all-products", label: "Product" },
    { href: "/blog", label: "Blog" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ── Main Nav ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm transition-shadow duration-300
          ${
            scrolled
              ? "shadow-[0_1px_14px_rgba(0,0,0,0.06)]"
              : "border-b border-gray-100"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="font-playfair text-2xl md:text-3xl font-bold text-text_dark tracking-tight select-none"
          >
            Al Idaad
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-2">
            {links?.splice(0, 2).map(({ href, label }) => {
              const isActive =
                href === "/" ? pathname === "/" : pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-3 py-2 rounded-full text-sm font-medium tracking-wide
                    transition-colors duration-200
                    ${
                      isActive
                        ? "text-brand bg-brand/8"
                        : "text-text_normal hover:text-text_dark hover:bg-gray-50"
                    }`}
                >
                  {label}
                </Link>
              );
            })}

            {/* Desktop Category Dropdown */}
            <div className="relative group">
              <button
                type="button"
                className={`relative px-3 py-2 rounded-full text-sm font-medium tracking-wide
                  transition-colors duration-200 flex items-center gap-2
                  ${
                    pathname.startsWith("/all-products")
                      ? "text-brand bg-brand/8"
                      : "text-text_normal hover:text-text_dark hover:bg-gray-50"
                  }`}
              >
                Category
                <span className="text-[10px] leading-none mt-[1px]">▼</span>
              </button>

              <div
                className="absolute left-1/2 -translate-x-1/2 top-full pt-3
                  opacity-0 invisible translate-y-1
                  group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
                  transition-all duration-200 z-50"
              >
                <div className="w-[420px] rounded-sm border border-gray-100 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-4">
                  <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                    {categories.map((category) => (
                      <Link
                        key={category._id}
                        href={`/all-products?category=${category._id}`}
                        className="text-sm text-text_normal hover:text-brand transition-colors duration-150 line-clamp-1"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {links?.splice(0, 3).map(({ href, label }) => {
              const isActive =
                href === "/" ? pathname === "/" : pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-3 py-2 rounded-full text-sm font-medium tracking-wide
                    transition-colors duration-200
                    ${
                      isActive
                        ? "text-brand bg-brand/8"
                        : "text-text_normal hover:text-text_dark hover:bg-gray-50"
                    }`}
                >
                  {label}
                </Link>
              );
            })}

            {/* Optional all products direct link */}
            {/*  <Link
              href="/all-products"
              className={`relative px-3 py-2 rounded-full text-sm font-medium tracking-wide
                transition-colors duration-200
                ${
                  pathname === "/all-products"
                    ? "text-brand bg-brand/8"
                    : "text-text_normal hover:text-text_dark hover:bg-gray-50"
                }`}
            >
              Products
            </Link> */}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full text-text_normal hover:text-text_dark hover:bg-gray-100 active:scale-95 transition duration-150"
              aria-label="Search"
            >
              <FiSearch size={19} />
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative w-9 h-9 flex items-center justify-center rounded-full text-text_normal hover:text-text_dark hover:bg-gray-100 active:scale-95 transition duration-150"
              aria-label="Cart"
            >
              <FiShoppingBag size={19} />
              {Boolean(totalQty) && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand text-white text-[10px] font-bold min-w-[18px] min-h-[18px] flex items-center justify-center rounded-full px-1">
                  {totalQty}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full text-text_normal hover:bg-gray-100 active:scale-95 transition duration-150 ml-1"
              aria-label="Open menu"
            >
              <FiMenu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Search */}
      <SearchBox
        key={String(isSearchOpen)}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Overlay */}
      <div
        onClick={() => {
          setIsMenuOpen(false);
          setIsCartOpen(false);
          setIsCategoryOpen(false);
        }}
        className={`fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 transition-opacity duration-300
          ${
            isMenuOpen || isCartOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
      />

      {/* ── Mobile Menu Drawer (RIGHT) ── */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl
          transform transition-transform duration-300 ease-in-out lg:hidden
          ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100">
          <span className="font-playfair text-xl font-bold text-text_dark">
            Al Idaad
          </span>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition duration-150"
            aria-label="Close menu"
          >
            <FiX size={20} className="text-text_normal" />
          </button>
        </div>

        {/* Links */}
        <nav className="flex flex-col px-3 py-4 gap-1.5">
          {links.map(({ href, label }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium
                  transition-colors duration-150
                  ${
                    isActive
                      ? "bg-brand text-white"
                      : "text-text_normal bg-transparent hover:bg-gray-50 hover:text-text_dark"
                  }`}
              >
                <span>{label}</span>
                {isActive && (
                  <span className="text-[10px] uppercase tracking-widest opacity-80">
                    Active
                  </span>
                )}
              </Link>
            );
          })}

          {/* Mobile Category Dropdown */}
          <div className="mt-1 rounded-xl bg-gray-50 overflow-hidden">
            <button
              type="button"
              onClick={() => setIsCategoryOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-text_dark"
            >
              <span>Category</span>
              <span
                className={`text-xs transition-transform duration-200 ${
                  isCategoryOpen ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            <div
              className={`grid transition-all duration-300 ${
                isCategoryOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-4 pb-4 pt-1 grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <Link
                      key={category._id}
                      href={`/all-products?category=${category._id}`}
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsCategoryOpen(false);
                      }}
                      className="text-xs text-text_normal hover:text-brand bg-white border border-gray-100 rounded-full px-3 py-2 text-center transition-colors duration-150"
                    >
                      {category.name}
                    </Link>
                  ))}

                  <Link
                    href="/all-products"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsCategoryOpen(false);
                    }}
                    className="text-xs text-white bg-brand rounded-full px-3 py-2 text-center transition-opacity duration-150 hover:opacity-90 col-span-2"
                  >
                    View All Products
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* ── Cart Drawer ── */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text_dark">Your Cart</span>
            {totalQty > 0 && (
              <span className="bg-brand text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {totalQty}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition duration-150"
            aria-label="Close cart"
          >
            <FiX size={20} className="text-text_normal" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(100%-64px)]">
          <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-300">
                <FiShoppingBag size={48} strokeWidth={1.2} />
                <p className="text-sm font-medium text-gray-400">
                  Your cart is empty
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => {
                  const subtitle = getItemSubtitle(item);

                  return (
                    <div
                      key={item.cartKey}
                      className="flex gap-3 pb-3 border-b border-gray-100 last:border-0"
                    >
                      <Image
                        src={item.thumbnail}
                        width={64}
                        height={80}
                        alt={item.name}
                        className="w-16 h-20 object-cover rounded-xl shrink-0 bg-gray-50"
                      />
                      <div className="flex flex-col justify-between flex-1 min-w-0">
                        <div className="flex justify-between gap-1">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-text_dark truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {item.category.name}
                            </p>
                            {subtitle && (
                              <span className="inline-block mt-1.5 text-[10px] font-semibold bg-brand/8 text-brand px-2 py-0.5 rounded-full">
                                {subtitle}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => removeItem(item.cartKey)}
                            className="text-gray-300 hover:text-red-400 transition-colors shrink-0 mt-0.5"
                            aria-label="Remove item"
                          >
                            <FiX size={15} />
                          </button>
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          <span className="text-brand font-bold text-sm">
                            ৳ {(item.price * item.quantity).toLocaleString()}
                          </span>

                          <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-1 py-0.5">
                            <button
                              onClick={() => decreaseQty(item.cartKey)}
                              className="w-6 h-6 flex items-center justify-center text-text_normal hover:text-brand font-medium transition-colors"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>

                            <span className="text-sm font-semibold w-5 text-center text-text_dark">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() => increaseQty(item.cartKey)}
                              className="w-6 h-6 flex items-center justify-center text-text_normal hover:text-brand font-medium transition-colors"
                              aria-label="Increase quantity"
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
            <div className="border-t border-gray-100 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">
                  Subtotal ({totalQty} item{totalQty > 1 ? "s" : ""})
                </span>
                <span className="font-bold text-text_dark">
                  ৳ {totalPrice.toLocaleString()}
                </span>
              </div>

              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="block w-full bg-brand text-white text-center py-3 rounded-xl font-semibold text-sm
                  hover:opacity-90 active:scale-95 transition duration-150"
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
