"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Navigation } from "swiper/modules";
import Image from "next/image";
import { useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { ProductType } from "@/utils/types";
import Link from "next/link";
import { calculateReducedPrice } from "@/utils/helper";
// import ButtonContainer from "../our-product/ButtonContainer";

const FeatureProductSlider = ({ product }: { product: ProductType[] }) => {
    const swiperRef = useRef<SwiperType | null>(null);
    const [isBeginning, setIsBeginning] = useState(true);
    const [isEnd, setIsEnd] = useState(false);

    const handleSwiper = (swiper: SwiperType) => {
        swiperRef.current = swiper;
        setIsBeginning(swiper.isBeginning);
        setIsEnd(swiper.isEnd);
    };

    const handleSlideChange = (swiper: SwiperType) => {
        setIsBeginning(swiper.isBeginning);
        setIsEnd(swiper.isEnd);
    };

    return (
        <div className="feature-slider-wrapper">
            <Swiper
                slidesPerView={"auto"}
                spaceBetween={10}
                breakpoints={{
                    640: {
                        spaceBetween: 20,
                    },
                }}
                navigation={false}
                modules={[Navigation]}
                onSwiper={handleSwiper}
                onSlideChange={handleSlideChange}
                onReachBeginning={() => setIsBeginning(true)}
                onReachEnd={() => setIsEnd(true)}
                className="mySwiper"
            >
                {product.map((ele) => (
                    <SwiperSlide key={ele._id} className="w-50! md:w-62.5! relative">
                        <Link href={`/all-products/details/${ele._id}`}>
                            <Image src={ele.thumbnail} alt={ele.name} width={300} height={450} className="w-50 md:w-62.5 aspect-2/3 rounded" />
                        </Link>
                        <div className="px-1 mt-2">
                            <Link href={`/all-products/details/${ele._id}`}>
                                <p className="font-semibold text-sm line-clamp-1 hover:text-blue-400 transition duration-150">{ele.name}</p>
                            </Link>
                            <div>
                                {Boolean(ele.price) ? (
                                    <div>
                                        {Boolean(ele.discountPercentage) ? (
                                            <div className="flex gap-1 items-baseline">
                                                <span className="text-xl text-text_normal">
                                                    ৳ {calculateReducedPrice(ele.price, ele.discountPercentage as number | string)}
                                                </span>
                                                <span className="text-xs text-red-400">
                                                    <del>{ele.price}</del>
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xl text-text_normal">৳ {ele.price}</span>
                                        )}
                                    </div>
                                ) : Boolean(ele.discountPercentage) ? (
                                    <div className="flex flex-wrap gap-1 items-baseline">
                                        <div className="flex sm:text-xl gap-1 flex-wrap">
                                            <p className=" text-text_normal">
                                                ৳ {calculateReducedPrice(ele.priceRange.min, ele.discountPercentage as number | string)}
                                            </p>
                                            -
                                            <p className=" text-text_normal">
                                                ৳ {calculateReducedPrice(ele.priceRange.max, ele.discountPercentage as number | string)}
                                            </p>
                                        </div>
                                        <span className="text-xs text-red-400">
                                            <del>{ele.priceRange.min}</del> - <del>{ele.priceRange.max}</del>
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-xl text-text_normal">{`৳ ${ele.priceRange.min} - ৳ ${ele.priceRange.max}`}</span>
                                )}
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Navigation buttons below */}
            <div className="feature-slider-controls">
                <button
                    className={`feature-slider-btn feature-slider-btn--prev ${isBeginning ? "feature-slider-btn--disabled" : ""}`}
                    onClick={() => swiperRef.current?.slidePrev()}
                    aria-label="Previous slide"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>

                <button
                    className={`feature-slider-btn feature-slider-btn--next ${isEnd ? "feature-slider-btn--disabled" : ""}`}
                    onClick={() => swiperRef.current?.slideNext()}
                    aria-label="Next slide"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default FeatureProductSlider;
