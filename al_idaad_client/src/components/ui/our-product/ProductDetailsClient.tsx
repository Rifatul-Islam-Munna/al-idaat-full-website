"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ProductType, ProductVariant, AttarSize } from "@/utils/types";
import { useCart } from "@/components/shared/CartContext";
import { buildCartKey } from "@/utils/helper";
import ReturnPolicy from "./ReturnPolicy";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={star <= Math.round(rating) ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        className={
          star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"
        }
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
    <span className="text-xs text-gray-500 ml-1 font-medium">
      {rating.toFixed(1)}
    </span>
  </div>
);

// ─── Variant Selector ─────────────────────────────────────────────────────────

type VariantSelectorProps = {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  setSelectedVariant: (v: ProductVariant | null) => void;
  variantButtonPrice: (v: ProductVariant) => string;
  isInCart: (key: string) => boolean;
  buildCartKeyFn: (v: ProductVariant) => string;
};

const VariantSelector = ({
  variants,
  selectedVariant,
  setSelectedVariant,
  variantButtonPrice,
  isInCart,
  buildCartKeyFn,
}: VariantSelectorProps) => {
  // Group variants by color; no-color variants go into "__others__"
  const colorGroups = variants.reduce<Record<string, ProductVariant[]>>(
    (acc, v) => {
      const key = v.color?.trim() || "__others__";
      if (!acc[key]) acc[key] = [];
      acc[key].push(v);
      return acc;
    },
    {},
  );

  const colorKeys = Object.keys(colorGroups);
  const hasMultipleGroups = colorKeys.length > 1;

  const [activeColor, setActiveColor] = useState<string>(colorKeys[0]);

  const tabVariants = colorGroups[activeColor] ?? [];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-text_normal">
          Select Size
          {selectedVariant && (
            <span className="ml-2 text-brand font-semibold">
              — {selectedVariant.size}
              {selectedVariant.color ? ` · ${selectedVariant.color}` : ""}
            </span>
          )}
        </p>
        {selectedVariant && (
          <button
            onClick={() => setSelectedVariant(null)}
            className="text-xs text-gray-400 hover:text-red-400 transition"
          >
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
              (v) =>
                v.size === selectedVariant?.size &&
                v.color === selectedVariant?.color,
            );

            return (
              <button
                key={key}
                onClick={() => {
                  setActiveColor(key);
                  if (
                    selectedVariant &&
                    selectedVariant.color !==
                      (key === "__others__" ? undefined : key)
                  ) {
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
                {groupHasSelection && !isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Size Chips */}
      <div className="flex flex-wrap gap-2">
        {tabVariants.map((v, i) => {
          const isSelected =
            selectedVariant?.size === v.size &&
            selectedVariant?.color === v.color;
          const variantInCart = isInCart(buildCartKeyFn(v));

          return (
            <button
              key={i}
              onClick={() => setSelectedVariant(isSelected ? null : v)}
              className={`relative flex flex-col items-center justify-center px-4 py-2.5 rounded-xl border-2 transition-all duration-150 min-w-16
                                ${isSelected ? "border-brand bg-brand/5" : "border-gray-100 bg-gray-50 hover:border-gray-300"}`}
            >
              <span
                className={` font-bold leading-tight ${isSelected ? "text-brand" : "text-text_normal"}`}
              >
                {v.size}
              </span>

              {(v.chest || v.length) && (
                <span className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">
                  {v.chest ? `${v.chest}"` : ""}
                  {v.chest && v.length ? " · " : ""}
                  {v.length ? `${v.length}"` : ""}
                </span>
              )}

              <span
                className={`text-sm font-semibold mt-1 ${isSelected ? "text-brand" : "text-gray-500"}`}
              >
                {variantButtonPrice(v)}
              </span>

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

const ProductDetailsClient = ({ product }: { product: ProductType }) => {
  const { addItem, isInCart, items } = useCart();
  const router = useRouter();

  const {
    name,
    shortDescription,
    description,
    brand,
    category,
    price,
    priceRange,
    categoryIdList,
    discountPercentage,
    inStock,
    variants,
    attarSizes,
    thumbnail,
    images,
    ratings,
    deliveryCharge,
  } = product;

  const hasVariants = Array.isArray(variants) && variants.length > 0;
  const hasAttarSizes = Array.isArray(attarSizes) && attarSizes.length > 0;
  const hasPrice = Boolean(price);

  // ── Image gallery state ───────────────────────────────────────────────────
  const allImages = [thumbnail, ...images.filter((img) => img !== thumbnail)];
  const [activeImage, setActiveImage] = useState(0);

  // ── Selection state ───────────────────────────────────────────────────────
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );
  const [selectedAttar, setSelectedAttar] = useState<AttarSize | null>(null);

  // ── Price helpers ─────────────────────────────────────────────────────────

  const applyDiscount = (p: number): number =>
    discountPercentage ? Math.round(p * (1 - discountPercentage / 100)) : p;

  const resolvedSinglePrice: number | null = (() => {
    if (hasVariants && selectedVariant?.price != null)
      return selectedVariant.price;
    if (hasAttarSizes && selectedAttar) return selectedAttar.price;
    if (hasPrice) return price;
    return null;
  })();

  const showRange = resolvedSinglePrice === null;

  const displaySinglePrice =
    resolvedSinglePrice !== null ? applyDiscount(resolvedSinglePrice) : null;
  const hasDiscount = Boolean(discountPercentage);

  const displayRangeMin = applyDiscount(priceRange.min);
  const displayRangeMax = applyDiscount(priceRange.max);

  const cartPrice = displaySinglePrice ?? displayRangeMin;

  const cartKey = buildCartKey(
    product,
    selectedVariant ?? undefined,
    selectedAttar ?? undefined,
  );
  const alreadyInCart = isInCart(cartKey);
  const qtyInCart = items.find((i) => i.cartKey === cartKey)?.quantity ?? 0;

  const canAdd = (() => {
    if (!inStock) return false;
    if (hasVariants) return selectedVariant !== null;
    if (hasAttarSizes) return selectedAttar !== null;
    return true;
  })();

  const handleAddToCart = () => {
    if (!canAdd) {
      if (!inStock) return;
      toast.error(
        hasVariants
          ? "Please select a size first"
          : "Please select an amount first",
      );
      return;
    }
    addItem({
      product,
      selectedVariant: selectedVariant ?? undefined,
      selectedAttarSize: selectedAttar ?? undefined,
      resolvedPrice: cartPrice,
    });
    toast.success("Added to cart 🛒");
  };

  const handleBuyNow = () => {
    if (!canAdd) {
      if (!inStock) return;
      toast.error(
        hasVariants
          ? "Please select a size first"
          : "Please select an amount first",
      );
      return;
    }
    addItem({
      product,
      selectedVariant: selectedVariant ?? undefined,
      selectedAttarSize: selectedAttar ?? undefined,
      resolvedPrice: cartPrice,
    });
    toast.success("Added to cart 🛒");
    router.push("/checkout");
  };

  const variantButtonPrice = (v: ProductVariant): string => {
    if (v.price != null) return `৳ ${applyDiscount(v.price).toLocaleString()}`;
    if (hasPrice) return `৳ ${applyDiscount(price).toLocaleString()}`;
    return `৳ ${displayRangeMin.toLocaleString()} – ৳ ${displayRangeMax.toLocaleString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-4">
        <Link href="/" className="hover:text-text_normal transition">
          Home
        </Link>
        <span>/</span>
        <Link
          href="/all-products"
          className="hover:text-text_normal transition"
        >
          All Products
        </Link>
        <span>/</span>
        <span className="hover:text-text_normal transition">
          {category.name}
        </span>
        <span>/</span>
        <span className="text-text_normal font-medium truncate max-w-50">
          {name}
        </span>
      </nav>

      {/* ── Main grid ── */}
      <div className="flex flex-col sm:flex-row gap-4 lg:gap-8 xl:gap-14">
        {/* ── LEFT: Image Gallery ── */}
        <div className="flex gap-4 flex-col md:flex-row">
          {/* Main image */}
          <div className="relative">
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
              {!inStock && (
                <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Out of Stock
                </span>
              )}
              {hasDiscount && inStock && (
                <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  -{discountPercentage}%
                </span>
              )}
            </div>

            <div className="aspect-2/3 sm:w-[45vw] lg:w-110 xl:w-120 rounded-2xl overflow-hidden bg-gray-100">
              <Image
                src={allImages[activeImage]}
                alt={name}
                width={600}
                height={900}
                className="w-full aspect-2/3"
                priority
              />
            </div>
          </div>

          {/* Thumbnail strip */}
          {allImages.length > 1 && (
            <div className="flex gap-2 flex-wrap md:flex-col">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-150 w-14 h-21 sm:w-16 sm:h-24
                                        ${activeImage === i ? "border-brand" : "border-transparent hover:border-gray-300"}`}
                >
                  <Image
                    src={img}
                    alt={`${name} view ${i + 1}`}
                    width={64}
                    height={96}
                    className="w-14 h-21 sm:w-16 sm:h-24"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Product Info ── */}
        <div className="flex grow flex-col">
          {/* Category + brand */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-brand uppercase tracking-widest">
              {category.name}
            </span>
            {brand && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-400 font-medium">
                  {brand}
                </span>
              </>
            )}
          </div>

          {/* Name */}
          <h1 className="text-2xl md:text-3xl font-bold text-text_normal leading-tight mb-3">
            {name}
          </h1>

          {/* Rating */}
          {/*  <div className="mb-4">
            <StarRating rating={ratings} />
          </div> */}

          {/* ── Price ── */}
          <div className="flex items-baseline gap-3 mb-5 flex-wrap">
            {showRange ? (
              <>
                <span className="text-3xl font-bold text-brand">
                  ৳ {displayRangeMin.toLocaleString()} – ৳{" "}
                  {displayRangeMax.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-gray-400 line-through font-medium">
                    ৳ {priceRange.min.toLocaleString()} – ৳{" "}
                    {priceRange.max.toLocaleString()}
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="text-3xl font-bold text-brand">
                  ৳ {displaySinglePrice!.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-gray-400 line-through font-medium">
                    ৳ {resolvedSinglePrice!.toLocaleString()}
                  </span>
                )}
              </>
            )}
            {(hasVariants && !selectedVariant) ||
            (hasAttarSizes && !selectedAttar) ? (
              <span className="text-xs text-gray-400 italic">
                {hasVariants
                  ? "Select size for exact price"
                  : "Select amount for exact price"}
              </span>
            ) : null}
          </div>

          {/* Divider */}
          <div className="border-t border-border mb-5" />

          {/* ── VARIANT SELECTOR ── */}
          {hasVariants && (
            <VariantSelector
              variants={variants!}
              selectedVariant={selectedVariant}
              setSelectedVariant={setSelectedVariant}
              variantButtonPrice={variantButtonPrice}
              isInCart={isInCart}
              buildCartKeyFn={(v) => buildCartKey(product, v)}
            />
          )}

          {/* ── ATTAR SIZE SELECTOR ── */}
          {hasAttarSizes && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-text_normal">
                  Select Amount
                  {selectedAttar && (
                    <span className="ml-2 text-brand font-semibold">
                      — {selectedAttar.ml} ml
                    </span>
                  )}
                </p>
                {selectedAttar && (
                  <button
                    onClick={() => setSelectedAttar(null)}
                    className="text-xs text-gray-400 hover:text-red-400 transition"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {attarSizes!.map((a, i) => {
                  const isSelected = selectedAttar?.ml === a.ml;
                  const attarInCart = isInCart(
                    buildCartKey(product, undefined, a),
                  );

                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedAttar(isSelected ? null : a)}
                      className={`relative flex flex-col items-center justify-center py-4 px-2 rounded-xl border-2 transition-all duration-150
                                                    ${isSelected ? "border-brand bg-brand/5" : "border-gray-100 hover:border-gray-300 bg-gray-50"}`}
                    >
                      <svg
                        className={`w-5 h-5 mb-1.5 ${isSelected ? "text-brand" : "text-gray-400"}`}
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
                      <p
                        className={`text-sm font-bold ${isSelected ? "text-brand" : "text-text_normal"}`}
                      >
                        {a.ml} ml
                      </p>
                      <p
                        className={`text-xs font-semibold mt-0.5 ${isSelected ? "text-brand" : "text-gray-500"}`}
                      >
                        ৳ {applyDiscount(a.price).toLocaleString()}
                      </p>
                      {attarInCart && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
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
          )}

          {/* ── Add to Cart + Buy Now ── */}
          <div className="flex gap-3 mb-5">
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-sm transition-all duration-150
                                    ${
                                      !inStock
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : alreadyInCart
                                          ? "bg-green-500 hover:bg-green-600 text-white active:scale-95"
                                          : "bg-brand hover:opacity-90 text-white active:scale-95"
                                    }`}
            >
              {!inStock ? (
                <>
                  <svg
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
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                  </svg>
                  Out of Stock
                </>
              ) : (
                <>
                  <svg
                    width="18"
                    height="18"
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
                  {alreadyInCart
                    ? `In Cart (${qtyInCart}) — Add More`
                    : "Add to Cart"}
                </>
              )}
            </button>

            {inStock && !alreadyInCart && (
              <button
                onClick={handleBuyNow}
                className="flex items-center gap-2 px-5 py-4 rounded-2xl bg-text_normal text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all duration-150 shrink-0"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="none"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                Buy Now
              </button>
            )}

            {alreadyInCart && (
              <Link
                href="/checkout"
                className="flex items-center gap-2 px-5 py-4 rounded-2xl border-2 border-brand text-brand font-bold text-sm hover:bg-brand hover:text-white transition-all duration-150 active:scale-95 shrink-0"
              >
                Checkout
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
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Link>
            )}
          </div>

          {/* Selection prompt */}
          {inStock &&
            !alreadyInCart &&
            ((hasVariants && !selectedVariant) ||
              (hasAttarSizes && !selectedAttar)) && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-5">
                ↑{" "}
                {hasVariants ? "Select a size above" : "Select an amount above"}{" "}
                to add to cart
              </p>
            )}

          {shortDescription && (
            <div
              dangerouslySetInnerHTML={{ __html: shortDescription }}
              className="ProseMirror text-sm leading-relaxed text-text_normal"
            />
          )}
          <ReturnPolicy />

          {/* ── Product Meta Info ── */}
          <div className="border-t border-border pt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Category
                </p>
                <p className="text-sm font-semibold text-text_normal">
                  {categoryIdList.map((e) => e.name).join(", ")}
                </p>
              </div>
              {brand && (
                <div className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Brand
                  </p>
                  <p className="text-sm font-semibold text-text_normal">
                    {brand}
                  </p>
                </div>
              )}
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Availability
                </p>
                <p
                  className={`text-sm font-semibold ${inStock ? "text-green-600" : "text-red-500"}`}
                >
                  {inStock ? "In Stock" : "Out of Stock"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Rating
                </p>
                <p className="text-sm font-semibold text-text_normal">
                  {ratings.toFixed(1)} / 5.0
                </p>
              </div>
            </div>
          </div>

          {/* ── Delivery note ── */}
          <div className="mt-5 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <svg
              className="w-5 h-5 text-green-600 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            <div>
              <p className="text-xs font-bold text-green-800">
                Cash on Delivery available
              </p>
              <p className="text-xs text-green-700">
                ৳ {deliveryCharge.special.charge} inside{" "}
                {deliveryCharge.special.city} - ৳{" "}
                {deliveryCharge.regular.charge} outside{" "}
                {deliveryCharge.special.city}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="pt-4">
        <p className="font-bold text-gray-400 uppercase tracking-wider pb-4 mb-4 border-b border-border">
          Description
        </p>
        <div
          dangerouslySetInnerHTML={{ __html: description }}
          className="text-sm text-gray-500 leading-relaxed ProseMirror"
        />
      </div>
    </div>
  );
};

export default ProductDetailsClient;
