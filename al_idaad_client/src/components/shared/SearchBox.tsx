"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { ProductType, GetAllProductsResponseType } from "@/utils/types";
import Image from "next/image";

interface SearchBoxProps {
    isOpen: boolean;
    onClose: () => void;
}

const highlightMatch = (text: string, searchTerm: string): React.ReactNode => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, index) =>
        regex.test(part) ? (
            <span key={index} className="bg-yellow-200 text-gray-900 font-semibold">
                {part}
            </span>
        ) : (
            part
        ),
    );
};

const SearchBox: React.FC<SearchBoxProps> = ({ isOpen, onClose }) => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const [products, setProducts] = useState<ProductType[]>([]);
    const [loading, setLoading] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Fetch products once on mount, focus input after
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
                const data: GetAllProductsResponseType = await res.json();
                if (data.success) setProducts(data.data);
            } catch {
                throw new Error("SearchBox: failed to fetch products");
                // console.log("error");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
        const id = setTimeout(() => inputRef.current?.focus(), 50);
        return () => clearTimeout(id);
    }, []);

    // Derive filtered results synchronously — no setState needed
    const filteredResults = useMemo<ProductType[]>(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term || !products.length) return [];

        const filtered = products.filter((p) => p.name.toLowerCase().includes(term));

        filtered.sort((a, b) => {
            const aL = a.name.toLowerCase();
            const bL = b.name.toLowerCase();
            if (aL === term) return -1;
            if (bL === term) return 1;
            if (aL.startsWith(term) && !bL.startsWith(term)) return -1;
            if (bL.startsWith(term) && !aL.startsWith(term)) return 1;
            return aL.localeCompare(bL);
        });

        return filtered.slice(0, 8);
    }, [searchTerm, products]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setSelectedIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) => (filteredResults.length === 0 ? -1 : prev < filteredResults.length - 1 ? prev + 1 : 0));
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) => (filteredResults.length === 0 ? -1 : prev > 0 ? prev - 1 : filteredResults.length - 1));
                break;
            case "Enter":
                e.preventDefault();
                if (selectedIndex >= 0 && filteredResults[selectedIndex]) {
                    handleResultClick(filteredResults[selectedIndex]);
                }
                break;
            case "Escape":
                onClose();
                break;
        }
    };

    const handleResultClick = (product: ProductType) => {
        onClose();
        router.push(`/all-products/details/${product._id}`);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/40 z-60 backdrop-blur-sm" onClick={onClose} />

            {/* Search Panel */}
            <div className="fixed top-0 left-0 right-0 z-70 flex justify-center px-4 pt-6 sm:pt-16 animate-slideDown">
                <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Input row */}
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-400 shrink-0"
                        >
                            <path d="m21 21-4.34-4.34" />
                            <circle cx="11" cy="11" r="8" />
                        </svg>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search products..."
                            className="flex-1 text-base text-gray-800 placeholder:text-gray-400 outline-none bg-transparent"
                            value={searchTerm}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                        />
                        {searchTerm ? (
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setSelectedIndex(-1);
                                    inputRef.current?.focus();
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                                aria-label="Clear"
                            >
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
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        ) : (
                            <button
                                onClick={onClose}
                                className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors shrink-0 border border-gray-200 rounded px-2 py-0.5"
                                aria-label="Close"
                            >
                                ESC
                            </button>
                        )}
                    </div>

                    {/* Loading state */}
                    {loading && (
                        <div className="py-8 text-center text-gray-300">
                            <div className="inline-block w-5 h-5 border-2 border-gray-200 border-t-brand rounded-full animate-spin mb-2" />
                            <p className="text-sm">Loading products…</p>
                        </div>
                    )}

                    {/* Results */}
                    {!loading && searchTerm.trim() !== "" && (
                        <div className="max-h-[60vh] overflow-y-auto">
                            {filteredResults.length > 0 ? (
                                <>
                                    <div className="px-5 pt-3 pb-1 text-xs text-gray-400 font-medium tracking-wide uppercase">
                                        {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""}
                                    </div>
                                    <ul className="pb-2">
                                        {filteredResults.map((product, index) => (
                                            <li key={product._id}>
                                                <button
                                                    className={`w-full text-left flex items-center gap-4 px-5 py-3 transition-colors ${
                                                        index === selectedIndex ? "bg-brand text-white" : "hover:bg-gray-50 text-gray-800"
                                                    }`}
                                                    onClick={() => handleResultClick(product)}
                                                    onMouseEnter={() => setSelectedIndex(index)}
                                                >
                                                    {product.thumbnail && (
                                                        <Image
                                                            src={product.thumbnail}
                                                            alt={product.name}
                                                            width={40}
                                                            height={48}
                                                            className="w-10 h-12 object-cover rounded-lg shrink-0"
                                                        />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p
                                                            className={`text-sm font-semibold truncate ${index === selectedIndex ? "text-white" : "text-gray-900"}`}
                                                        >
                                                            {highlightMatch(product.name, searchTerm)}
                                                        </p>
                                                        <p
                                                            className={`text-xs mt-0.5 ${index === selectedIndex ? "text-white/75" : "text-gray-400"}`}
                                                        >
                                                            {product.category?.name}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={`text-sm font-bold shrink-0 ${index === selectedIndex ? "text-white" : "text-brand"}`}
                                                    >
                                                        ৳ {product.price.toLocaleString()}
                                                    </span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <div className="py-12 text-center text-gray-400">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="40"
                                        height="40"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="mx-auto mb-3 opacity-50"
                                    >
                                        <path d="m21 21-4.34-4.34" />
                                        <circle cx="11" cy="11" r="8" />
                                    </svg>
                                    <p className="text-sm font-medium">No products found for &quot;{searchTerm}&quot;</p>
                                    <p className="text-xs mt-1">Try a different keyword</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Hint when empty and not loading */}
                    {!loading && searchTerm.trim() === "" && (
                        <div className="py-8 text-center text-gray-300">
                            <p className="text-sm">Start typing to search products…</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-12px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slideDown {
                    animation: slideDown 0.2s ease-out both;
                }
            `}</style>
        </>
    );
};

export default SearchBox;
