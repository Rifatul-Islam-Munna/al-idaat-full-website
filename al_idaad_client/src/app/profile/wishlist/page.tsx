"use client";

import { useProfileShell } from "@/components/profile/ProfileShell";
import WishlistButton from "@/components/shared/WishlistButton";
import { calculateReducedPrice, getProductDetailsPath } from "@/utils/helper";
import { ProductType } from "@/utils/types";
import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiHeart } from "react-icons/fi";

const getPriceLabel = (product: ProductType) => {
  if (product.price) {
    const amount = product.discountPercentage
      ? calculateReducedPrice(product.price, product.discountPercentage)
      : product.price;
    return `৳ ${Number(amount).toLocaleString()}`;
  }

  const minimum = product.discountPercentage
    ? calculateReducedPrice(product.priceRange.min, product.discountPercentage)
    : product.priceRange.min;
  const maximum = product.discountPercentage
    ? calculateReducedPrice(product.priceRange.max, product.discountPercentage)
    : product.priceRange.max;

  return `৳ ${minimum.toLocaleString()} – ৳ ${maximum.toLocaleString()}`;
};

export default function ProfileWishlistPage() {
  const { user } = useProfileShell();

  // ── Empty state ───────────────────────────────────────────────────────────
  if (user.wishlist.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-white px-6 py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
          <FiHeart size={20} className="text-brand" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-text_dark">
          Your wishlist is empty
        </h3>
        <p className="mt-1.5 text-sm text-gray-400">
          Save products from the shop and they will appear here.
        </p>
        <Link
          href="/all-products"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Explore Products
          <FiArrowRight size={14} />
        </Link>
      </div>
    );
  }

  // ── Wishlist grid ─────────────────────────────────────────────────────────
  return (
    <div className="rounded-3xl border border-border bg-white p-6 sm:p-8">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text_dark">Wishlist</h2>
          <p className="mt-0.5 text-sm text-gray-400">
            {user.wishlist.length} saved{" "}
            {user.wishlist.length === 1 ? "item" : "items"}
          </p>
        </div>
        <Link
          href="/all-products"
          className="inline-flex items-center gap-1.5 rounded-2xl border border-border px-4 py-2 text-xs font-semibold text-text_dark transition hover:border-brand hover:text-brand"
        >
          Browse more
          <FiArrowRight size={13} />
        </Link>
      </div>

      {/* Product list */}
      <div className="space-y-3">
        {user.wishlist.map((product) => (
          <article
            key={product._id}
            className="flex items-center gap-4 rounded-2xl border border-border p-3 transition hover:border-brand/30 hover:bg-gray-50/60"
          >
            {/* Thumbnail */}
            <Link
              href={getProductDetailsPath(product)}
              className="shrink-0 overflow-hidden rounded-xl bg-gray-100"
            >
              <Image
                src={product.thumbnail}
                alt={product.name}
                width={72}
                height={90}
                className="h-[90px] w-[72px] object-cover"
              />
            </Link>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                {product.category.name}
              </p>
              <Link href={getProductDetailsPath(product)}>
                <h3 className="mt-1 line-clamp-1 text-sm font-semibold text-text_dark transition hover:text-brand">
                  {product.name}
                </h3>
              </Link>
              <p className="mt-1 text-sm font-semibold text-brand">
                {getPriceLabel(product)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                href={getProductDetailsPath(product)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-text_dark transition hover:bg-brand/10 hover:text-brand"
              >
                View
                <FiArrowRight size={12} />
              </Link>
              <WishlistButton
                productId={product._id}
                label="Remove"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
