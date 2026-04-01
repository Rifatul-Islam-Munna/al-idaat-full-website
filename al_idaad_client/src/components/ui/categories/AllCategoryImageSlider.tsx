"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";

import { CategoryImageType, CategoryType } from "@/utils/types";
import Link from "next/link";
import { getLowestSubCategories } from "@/utils/helper";
import Image from "next/image";

type PropsType = {
    categories: CategoryType[];
    categoryImages: CategoryImageType[];
};

const AllCategoryImageSlider = ({ categories, categoryImages }: PropsType) => {
    const categoryList = getLowestSubCategories(categories);
    const categoryIdList = categoryList.map((ele) => ele._id);
    const categoryImageList = categoryImages.filter((ele) => categoryIdList.includes(ele.categoryId));

    return (
        <div className="relative w-full">
            {/* Fade edges */}
            {/* <div className="pointer-events-none absolute left-0 top-0 h-full w-16 z-10 bg-linear-to-r from-bg_main to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-16 z-10 bg-linear-to-l from-bg_main to-transparent" /> */}

            <Swiper
                slidesPerView={"auto"}
                spaceBetween={12}
                centeredSlides={true}
                loop={true}
                autoplay={{
                    delay: 2500,
                    disableOnInteraction: false,
                }}
                modules={[Autoplay]}
                className="mySwiper"
            >
                {categoryImageList.map((ele) => (
                    <SwiperSlide key={ele._id} className="w-auto!">
                        <Link href={`/all-products?category=${ele.categoryId}`}>
                            <div className="group w-36 md:w-44 border border-border bg-bg_main hover:border-brand hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden cursor-pointer select-none">
                                {/* Square image area */}
                                <div className="relative w-full aspect-square overflow-hidden bg-bg_secondary">
                                    <Image src={ele.url} alt={ele.categoryName} fill className="object-cover aspect-square" />
                                </div>

                                {/* Text content */}
                                <div className="px-3 py-2.5 flex flex-col gap-0.5">
                                    <span className="text-[10px] font-medium text-text_light uppercase tracking-wider font-poppins truncate">
                                        {ele.categoryParentName}
                                    </span>

                                    <div className="flex items-center justify-between gap-1">
                                        <span className="text-sm font-semibold text-text_dark group-hover:text-brand transition-colors duration-300 font-poppins leading-tight truncate">
                                            {ele.categoryName}
                                        </span>
                                        <span className="text-xs text-text_light group-hover:text-brand shrink-0 transition-colors duration-300">
                                            →
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default AllCategoryImageSlider;
