"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Navigation } from "swiper/modules";
import { useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { BlogType } from "@/utils/types";
import BlogCardHome from "./BlogCardHome";

const BlogSlider = ({ data }: { data: BlogType[] }) => {
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
                navigation={false}
                modules={[Navigation]}
                onSwiper={handleSwiper}
                onSlideChange={handleSlideChange}
                onReachBeginning={() => setIsBeginning(true)}
                onReachEnd={() => setIsEnd(true)}
                className="mySwiper"
            >
                {data.map((ele) => (
                    <SwiperSlide key={ele._id} className="w-75!">
                        <BlogCardHome data={ele}></BlogCardHome>
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

export default BlogSlider;
