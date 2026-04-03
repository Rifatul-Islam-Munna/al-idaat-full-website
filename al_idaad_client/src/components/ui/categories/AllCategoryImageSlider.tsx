"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";
import { CategoryImageType, CategoryType } from "@/utils/types";
import Link from "next/link";
import Image from "next/image";
import { HiArrowRight } from "react-icons/hi2";

type PropsType = {
  categories: CategoryType[];
  categoryImages: CategoryImageType[];
};

const AllCategoryImageSlider = ({ categories, categoryImages }: PropsType) => {
  const categoryMap = new Map(categories.map((item) => [item._id, item]));

  const categoryImageList = categoryImages.filter((item) =>
    categoryMap.has(item.categoryId),
  );

  return (
    <div className="relative w-full">
      <Swiper
        slidesPerView="auto"
        spaceBetween={16}
        loop
        autoplay={{
          delay: 2600,
          disableOnInteraction: false,
        }}
        modules={[Autoplay]}
        className="mySwiper"
      >
        {categoryImageList.map((item) => {
          const matchedCategory = categoryMap.get(item.categoryId);

          return (
            <SwiperSlide key={item._id} className="!w-auto">
              <Link href={`/all-products?category=${item.categoryId}`}>
                <div className="group w-[148px] md:w-[180px]">
                  <div className="bg-transparent">
                    <div className="relative aspect-square w-full overflow-hidden bg-[#f7f7f7]">
                      <Image
                        src={item.url}
                        alt={
                          matchedCategory?.name ||
                          item.categoryName ||
                          "Category"
                        }
                        width={500}
                        height={500}
                        className="h-full w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>

                    <div className="pt-3">
                      <p className="mb-1 line-clamp-1 text-[10px] font-medium uppercase tracking-[0.16em] text-black/40">
                        {item.categoryParentName || "Category"}
                      </p>

                      <div className="flex items-center justify-between gap-2">
                        <h3 className="line-clamp-1 text-sm font-medium text-black md:text-[15px]">
                          {matchedCategory?.name || item.categoryName}
                        </h3>

                        <span className="text-black/50 transition-all duration-300 group-hover:translate-x-1 group-hover:text-black">
                          <HiArrowRight size={16} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default AllCategoryImageSlider;
