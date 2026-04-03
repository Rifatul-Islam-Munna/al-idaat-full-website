"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Navigation } from "swiper/modules";
import { useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import { ProductType } from "@/utils/types";
import ProductCard from "../our-product/ProductCard";

const BestSoldProductSlider = ({ product }: { product: ProductType[] }) => {
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
        slidesPerView="auto"
        spaceBetween={12}
        breakpoints={{
          640: {
            spaceBetween: 16,
          },
          1024: {
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
          <SwiperSlide
            key={ele._id}
            className="!w-[calc(50vw-36px)] md:!w-[255px] lg:!w-[255px]"
          >
            <ProductCard data={ele} />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="feature-slider-controls mt-6 flex items-center justify-center gap-3">
        <button
          className={`flex h-10 w-10 items-center justify-center border border-gray-300 bg-white text-gray-900 transition ${
            isBeginning ? "cursor-not-allowed opacity-40" : "hover:bg-gray-50"
          }`}
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
            className="h-5 w-5"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button
          className={`flex h-10 w-10 items-center justify-center border border-gray-300 bg-white text-gray-900 transition ${
            isEnd ? "cursor-not-allowed opacity-40" : "hover:bg-gray-50"
          }`}
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
            className="h-5 w-5"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default BestSoldProductSlider;
