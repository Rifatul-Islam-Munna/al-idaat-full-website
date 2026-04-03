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

  return `৳ ${minimum.toLocaleString()} - ৳ ${maximum.toLocaleString()}`;
};

export default function ProfileWishlistPage() {
  const { user } = useProfileShell();
  const [featuredProduct, ...otherProducts] = user.wishlist;

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-border bg-white p-7 sm:p-9">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-brand/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              Personal Wishlist
            </span>
            <h2 className="mt-5 font-playfair text-3xl font-bold text-text_dark sm:text-4xl">
              Saved pieces worth coming back to.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500">
              This space holds the products you liked enough to save. Keep it as
              a quiet shortlist before your next order.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:w-fit">
            <div className="rounded-2xl border border-border bg-gray-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                Saved Items
              </p>
              <p className="mt-2 text-2xl font-bold text-text_dark">
                {user.wishlist.length}
              </p>
            </div>
            <Link
              href="/all-products"
              className="rounded-2xl border border-border bg-gray-50 px-5 py-4 text-text_dark transition hover:border-brand hover:text-brand"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                Browse More
              </p>
              <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold">
                Shop Now
                <FiArrowRight size={15} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {user.wishlist.length === 0 ? (
        <section className="rounded-[32px] border border-dashed border-border bg-white px-7 py-14 text-center sm:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand/8 text-brand">
            <FiHeart size={26} />
          </div>
          <h3 className="mt-5 font-playfair text-3xl font-bold text-text_dark">
            Your wishlist is still empty.
          </h3>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-gray-500">
            Save products from the shop and they will appear here in your own
            curated shortlist.
          </p>
          <Link
            href="/all-products"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Explore Products
            <FiArrowRight size={15} />
          </Link>
        </section>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          {featuredProduct ? (
            <article className="overflow-hidden rounded-[32px] border border-border bg-white">
              <div className="grid h-full md:grid-cols-[0.85fr_1.15fr]">
                <Link
                  href={getProductDetailsPath(featuredProduct)}
                  className="block bg-gray-100"
                >
                  <Image
                    src={featuredProduct.thumbnail}
                    alt={featuredProduct.name}
                    width={640}
                    height={800}
                    className="h-full min-h-[340px] w-full object-cover"
                  />
                </Link>

                <div className="flex flex-col justify-between p-7 sm:p-9">
                  <div>
                    <span className="inline-flex rounded-full bg-gray-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                      Featured Save
                    </span>
                    <Link href={getProductDetailsPath(featuredProduct)}>
                      <h3 className="mt-5 font-playfair text-3xl font-bold leading-tight text-text_dark transition hover:text-brand">
                        {featuredProduct.name}
                      </h3>
                    </Link>
                    <p className="mt-3 text-sm font-semibold text-brand">
                      {getPriceLabel(featuredProduct)}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      {featuredProduct.category.name}
                    </p>
                    <p className="mt-6 text-sm leading-7 text-gray-500">
                      Keep this one close if it still feels like the next thing
                      you want to order.
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href={getProductDetailsPath(featuredProduct)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      View Product
                      <FiArrowRight size={15} />
                    </Link>
                    <WishlistButton
                      productId={featuredProduct._id}
                      label="Remove"
                      className="inline-flex items-center gap-2 rounded-2xl border border-border px-5 py-3 text-sm font-semibold text-text_dark transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                    />
                  </div>
                </div>
              </div>
            </article>
          ) : null}

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
            {otherProducts.map((product) => (
              <article
                key={product._id}
                className="rounded-[32px] border border-border bg-white p-5"
              >
                <div className="flex gap-4">
                  <Link
                    href={getProductDetailsPath(product)}
                    className="shrink-0 overflow-hidden rounded-2xl bg-gray-100"
                  >
                    <Image
                      src={product.thumbnail}
                      alt={product.name}
                      width={104}
                      height={136}
                      className="h-[136px] w-[104px] object-cover"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                      {product.category.name}
                    </p>
                    <Link href={getProductDetailsPath(product)}>
                      <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-text_dark transition hover:text-brand">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="mt-3 text-sm font-semibold text-brand">
                      {getPriceLabel(product)}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Link
                        href={getProductDetailsPath(product)}
                        className="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-xs font-semibold text-text_dark transition hover:bg-brand/8 hover:text-brand"
                      >
                        Open
                        <FiArrowRight size={14} />
                      </Link>
                      <WishlistButton
                        productId={product._id}
                        label="Remove"
                        className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-text_dark transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
