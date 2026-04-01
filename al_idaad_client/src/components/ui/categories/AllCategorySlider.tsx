"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";

import { CategoryType } from "@/utils/types";
import Link from "next/link";
import { findMainParentById, getLowestSubCategories } from "@/utils/helper";

const AllCategorySlider = ({ categories }: { categories: CategoryType[] }) => {
    const categoryList = getLowestSubCategories(categories);

    return (
        <div className="relative w-full py-2">
            {/* Fade edges */}
            <div className="pointer-events-none absolute left-0 top-0 h-full w-16 z-10 bg-linear-to-r from-bg_main to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-16 z-10 bg-linear-to-l from-bg_main to-transparent" />

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
                {categoryList.map((ele) => {
                    const parent = findMainParentById(categories, ele._id);
                    return (
                        <SwiperSlide key={ele._id} className="w-auto! py-1">
                            <Link href={`/all-products?category=${ele._id}`}>
                                <div className="group w-36 md:w-44 border border-border bg-bg_main hover:border-brand hover:shadow-lg hover:shadow-brand/10 hover:-translate-y-0.5 transition-all duration-300 rounded-xl overflow-hidden cursor-pointer select-none">
                                    <div className="p-3 md:p-4 flex flex-col gap-1.5">
                                        {/* Parent label */}
                                        {parent && (
                                            <span className="text-[10px] font-medium text-text_light uppercase tracking-wider font-poppins truncate">
                                                {parent.name}
                                            </span>
                                        )}

                                        {/* Sub-category name */}
                                        <span className="text-sm font-semibold text-text_dark group-hover:text-brand transition-colors duration-300 font-poppins leading-tight truncate">
                                            {ele.name}
                                        </span>

                                        {/* Bottom arrow indicator */}
                                        <div className="flex items-center justify-end mt-1">
                                            <span className="text-[10px] text-text_light group-hover:text-brand transition-colors translate-x-0 group-hover:translate-x-1 duration-300">
                                                →
                                            </span>
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

export default AllCategorySlider;
