import Image from "next/image";
import Link from "next/link";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { ProductType } from "@/utils/types";
import { calculateReducedPrice, getProductDetailsPath } from "@/utils/helper";
import WishlistButton from "@/components/shared/WishlistButton";

const ProductCard = ({ data }: { data: ProductType }) => {
  const { thumbnail, name, price, priceRange, discountPercentage } = data;

  const productPath = getProductDetailsPath(data);

  return (
    <div className="group relative w-[calc(50vw-36px)] md:w-[calc(33vw-28px)] lg:w-[calc(25vw-28px)] xl:w-[255px]">
      <div className="relative overflow-hidden bg-white">
        <WishlistButton
          productId={data._id}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-900 opacity-0 transition-all duration-300 group-hover:opacity-100"
        />

        <Link href={productPath} className="block">
          <div className="relative aspect-[2/3] overflow-hidden bg-white">
            <Image
              src={thumbnail}
              alt={name}
              width={300}
              height={450}
              className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-[1.03]"
            />

            <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/10" />

            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center  opacity-0 translate-y-3 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 w-full  bg-white   justify-center text-sm font-medium text-gray-900 transition hover:bg-gray-50"
              >
                <HiOutlineShoppingBag size={17} />
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </Link>

        {Boolean(discountPercentage) && (
          <span className="absolute left-2 top-2 rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-gray-900">
            {discountPercentage}% Off
          </span>
        )}
      </div>

      <div className="px-1 pt-3">
        <Link href={productPath}>
          <p className="line-clamp-2 text-sm font-semibold text-gray-900 transition hover:text-brand">
            {name}
          </p>
        </Link>

        <div className="mt-1 flex items-end justify-between gap-2">
          {Boolean(price) ? (
            <div>
              {Boolean(discountPercentage) ? (
                <div className="flex flex-wrap items-baseline gap-1">
                  <span className="text-base font-semibold text-text_normal">
                    ৳{" "}
                    {calculateReducedPrice(
                      price,
                      discountPercentage as number | string,
                    )}
                  </span>
                  <span className="text-xs text-red-400">
                    <del>৳ {price}</del>
                  </span>
                </div>
              ) : (
                <span className="text-base font-semibold text-text_normal">
                  ৳ {price}
                </span>
              )}
            </div>
          ) : Boolean(discountPercentage) ? (
            <div className="flex flex-wrap items-baseline gap-1">
              <div className="flex flex-wrap gap-1 text-base font-semibold text-text_normal">
                <p>
                  ৳{" "}
                  {calculateReducedPrice(
                    priceRange.min,
                    discountPercentage as number | string,
                  )}
                </p>
                <span>-</span>
                <p>
                  ৳{" "}
                  {calculateReducedPrice(
                    priceRange.max,
                    discountPercentage as number | string,
                  )}
                </p>
              </div>
              <span className="text-xs text-red-400">
                <del>৳ {priceRange.min}</del> - <del>৳ {priceRange.max}</del>
              </span>
            </div>
          ) : (
            <span className="text-base font-semibold text-text_normal">
              ৳ {priceRange.min} - ৳ {priceRange.max}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
