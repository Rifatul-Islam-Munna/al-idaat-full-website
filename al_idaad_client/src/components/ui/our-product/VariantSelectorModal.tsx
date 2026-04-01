"use client";

import { useState } from "react";
import { ProductType, ProductVariant, AttarSize } from "@/utils/types";
import toast from "react-hot-toast";
import { useCart } from "@/components/shared/CartContext";
import { buildCartKey, calculateReducedPrice } from "@/utils/helper";

interface Props {
    product: ProductType;
    isOpen: boolean;
    onClose: () => void;
    onAfterAdd?: () => void;
    text: string;
}

// ─── Variant Selector Sub-component ──────────────────────────────────────────

type VariantSelectorProps = {
    variants: ProductVariant[];
    selectedVariant: ProductVariant | null;
    setSelectedVariant: (v: ProductVariant | null) => void;
    isInCart: (key: string) => boolean;
    buildCartKeyFn: (v: ProductVariant) => string;
    applyDiscount: (p: number) => number;
    basePrice: number;
    hasPrice: boolean;
};

const VariantSelector = ({
    variants,
    selectedVariant,
    setSelectedVariant,
    isInCart,
    buildCartKeyFn,
    applyDiscount,
    basePrice,
    hasPrice,
}: VariantSelectorProps) => {
    const colorGroups = variants.reduce<Record<string, ProductVariant[]>>((acc, v) => {
        const key = v.color?.trim() || "__others__";
        if (!acc[key]) acc[key] = [];
        acc[key].push(v);
        return acc;
    }, {});

    const colorKeys = Object.keys(colorGroups);
    const hasMultipleGroups = colorKeys.length > 1;

    const [activeColor, setActiveColor] = useState<string>(colorKeys[0]);

    const tabVariants = colorGroups[activeColor] ?? [];

    const variantPrice = (v: ProductVariant): string => {
        if (v.price != null) return `৳ ${applyDiscount(v.price).toLocaleString()}`;
        if (hasPrice) return `৳ ${applyDiscount(basePrice).toLocaleString()}`;
        return "Base price";
    };

    return (
        <div className="pt-5">
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500">
                    Available Sizes
                    {selectedVariant && (
                        <span className="ml-2 text-brand">
                            — {selectedVariant.size}
                            {selectedVariant.color ? ` · ${selectedVariant.color}` : ""}
                        </span>
                    )}
                </p>
                {selectedVariant && (
                    <button onClick={() => setSelectedVariant(null)} className="text-xs text-gray-400 hover:text-red-400 transition">
                        Clear
                    </button>
                )}
            </div>

            {/* Color Tabs */}
            {hasMultipleGroups && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {colorKeys.map((key) => {
                        const label = key === "__others__" ? "Others" : key;
                        const isActive = activeColor === key;
                        const groupHasSelection = colorGroups[key].some(
                            (v) => v.size === selectedVariant?.size && v.color === selectedVariant?.color,
                        );

                        return (
                            <button
                                key={key}
                                onClick={() => {
                                    setActiveColor(key);
                                    if (selectedVariant && selectedVariant.color !== (key === "__others__" ? undefined : key)) {
                                        setSelectedVariant(null);
                                    }
                                }}
                                className={`relative px-4 py-1.5 rounded-full text-xs font-semibold border-2 transition-all duration-150
                                    ${
                                        isActive
                                            ? "border-brand bg-brand/5 text-brand"
                                            : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
                                    }`}
                            >
                                {label}
                                {groupHasSelection && !isActive && <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand rounded-full" />}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Size Chips */}
            <div className="flex flex-wrap gap-2">
                {tabVariants.map((v, i) => {
                    const isSelected = selectedVariant?.size === v.size && selectedVariant?.color === v.color;
                    const variantInCart = isInCart(buildCartKeyFn(v));

                    return (
                        <button
                            key={i}
                            onClick={() => setSelectedVariant(isSelected ? null : v)}
                            className={`relative flex flex-col items-center justify-center px-4 py-2.5 rounded-xl border-2 transition-all duration-150 min-w-16
                                ${isSelected ? "border-brand bg-brand/5" : "border-gray-100 bg-gray-50 hover:border-gray-300"}`}
                        >
                            <span className={`text-sm font-bold leading-tight ${isSelected ? "text-brand" : "text-text_normal"}`}>{v.size}</span>

                            {(v.chest || v.length) && (
                                <span className="text-[10px] text-gray-400 mt-0.5 whitespace-nowrap">
                                    {v.chest ? `${v.chest}"` : ""}
                                    {v.chest && v.length ? " · " : ""}
                                    {v.length ? `${v.length}"` : ""}
                                </span>
                            )}

                            <span className={`text-[11px] font-semibold mt-1 ${isSelected ? "text-brand" : "text-gray-500"}`}>{variantPrice(v)}</span>

                            {variantInCart && (
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <svg
                                        width="8"
                                        height="8"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const VariantSelectorModal = ({ product, isOpen, onClose, onAfterAdd, text }: Props) => {
    const { addItem, isInCart } = useCart();

    const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
    const hasAttarSizes = Array.isArray(product.attarSizes) && product.attarSizes.length > 0;

    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [selectedAttar, setSelectedAttar] = useState<AttarSize | null>(null);

    const applyDiscount = (p: number): number => (product.discountPercentage ? Math.round(p * (1 - product.discountPercentage / 100)) : p);

    const resolvedPrice = (() => {
        if (hasVariants && selectedVariant?.price != null) return applyDiscount(selectedVariant.price);
        if (hasAttarSizes && selectedAttar) return applyDiscount(selectedAttar.price);
        return product.discountPercentage ? calculateReducedPrice(product.price, product.discountPercentage) : product.price;
    })();

    const cartKey = buildCartKey(product, selectedVariant ?? undefined, selectedAttar ?? undefined);
    const alreadyInCart = isInCart(cartKey);

    const canAdd = hasVariants ? selectedVariant !== null : hasAttarSizes ? selectedAttar !== null : true;

    const handleAdd = () => {
        if (!canAdd) {
            toast.error(hasVariants ? "Please select a size" : "Please select an amount");
            return;
        }
        addItem({
            product,
            selectedVariant: selectedVariant ?? undefined,
            selectedAttarSize: selectedAttar ?? undefined,
            resolvedPrice,
        });
        toast.success("Added to cart 🛒", { position: "bottom-center", duration: 500 });
        onAfterAdd?.();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300
                    ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            />

            {/* Bottom sheet */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl
                    transform transition-all duration-300 ease-out
                    ${isOpen ? "translate-y-0" : "translate-y-full"}`}
            >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 bg-gray-200 rounded-full" />
                </div>

                <div className="px-5 pb-8 max-h-[85vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-start justify-between pt-3 pb-4 border-b border-gray-100">
                        <div className="flex-1 min-w-0 pr-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                {hasVariants ? "Select Size & Color" : hasAttarSizes ? "Select Amount" : "Add to Cart"}
                            </p>
                            <h3 className="font-bold text-text_normal text-base leading-snug">{product.name}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">{product.category.name}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 hover:bg-gray-200 transition"
                            aria-label="Close"
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    {/* ── THOBE VARIANTS ── */}
                    {hasVariants && (
                        <VariantSelector
                            variants={product.variants!}
                            selectedVariant={selectedVariant}
                            setSelectedVariant={setSelectedVariant}
                            isInCart={isInCart}
                            buildCartKeyFn={(v) => buildCartKey(product, v)}
                            applyDiscount={applyDiscount}
                            basePrice={product.price}
                            hasPrice={Boolean(product.price)}
                        />
                    )}

                    {/* ── ATTAR SIZES ── */}
                    {hasAttarSizes && (
                        <div className="pt-5">
                            <p className="text-xs font-semibold text-gray-500 mb-3">Available Sizes</p>
                            <div className="grid grid-cols-2 gap-2">
                                {product.attarSizes!.map((a, i) => {
                                    const isSelected = selectedAttar?.ml === a.ml;
                                    const inCartAlready = isInCart(buildCartKey(product, undefined, a));

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedAttar(isSelected ? null : a)}
                                            className={`relative flex flex-col items-center justify-center py-4 px-3 rounded-xl border-2 transition-all duration-150
                                                ${isSelected ? "border-brand bg-brand/5" : "border-gray-100 hover:border-gray-300 bg-gray-50"}`}
                                        >
                                            <svg
                                                className={`w-6 h-6 mb-2 ${isSelected ? "text-brand" : "text-gray-400"}`}
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M9 3h6l1 4H8z" />
                                                <rect x="6" y="7" width="12" height="14" rx="3" />
                                                <path d="M12 11v4M10 13h4" />
                                            </svg>
                                            <p className={`text-sm font-bold ${isSelected ? "text-brand" : "text-text_normal"}`}>{a.ml} ml</p>
                                            <p className={`text-sm font-semibold mt-0.5 ${isSelected ? "text-brand" : "text-gray-600"}`}>
                                                ৳ {applyDiscount(a.price).toLocaleString()}
                                            </p>
                                            {inCartAlready && (
                                                <span className="absolute top-1.5 right-1.5 text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">
                                                    In cart
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── Price + Add button ── */}
                    <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-4 sm:gap-0 justify-between">
                        <div>
                            <p className="text-xs text-gray-400 text-center sm:text-start">
                                {hasVariants && !selectedVariant && "Select a size to see price"}
                                {hasAttarSizes && !selectedAttar && "Select an amount to see price"}
                                {((!hasVariants && !hasAttarSizes) || selectedVariant || selectedAttar) && "Unit price"}
                            </p>
                            <p className="text-xl font-bold text-brand">৳ {resolvedPrice.toLocaleString()}</p>
                        </div>

                        <button
                            onClick={handleAdd}
                            disabled={!canAdd}
                            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition duration-150 active:scale-95 w-full sm:w-fit
                                ${
                                    canAdd
                                        ? alreadyInCart
                                            ? "bg-green-500 text-white hover:bg-green-600"
                                            : "bg-brand text-white hover:opacity-90"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                }`}
                        >
                            {text === "Add to Cart" && (
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="8" cy="21" r="1" />
                                    <circle cx="19" cy="21" r="1" />
                                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                                </svg>
                            )}
                            {text === "Add to Cart" ? (alreadyInCart ? "Click to Add One More" : text) : "Check Out"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VariantSelectorModal;
