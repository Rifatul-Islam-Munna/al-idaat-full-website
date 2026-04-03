"use client";

import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import { EffectFade, Autoplay, Pagination } from "swiper/modules";
import Image from "next/image";
import { BannerType } from "@/utils/types";

const BannerSlider = ({ data }: { data: BannerType[] }) => {
  return (
    <>
      <style>{`
                .mySwiper .swiper-pagination {
                    position: absolute;
                    bottom: 20px;
                    z-index: 10;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 6px;
                }

                .mySwiper .swiper-pagination-bullet {
                    width: 8px;
                    height: 8px;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.5);
                    opacity: 1;
                    transition: width 0.4s ease, background 0.4s ease, transform 0.3s ease;
                    cursor: pointer;
                }

                .mySwiper .swiper-pagination-bullet-active {
                    width: 28px;           /* expands horizontally */
                    background: white;
                    transform: scale(1.1);
                }
            `}</style>

      <Swiper
        slidesPerView={"auto"}
        spaceBetween={30}
        effect={"fade"}
        centeredSlides={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        loop={true}
        pagination={{ clickable: true }}
        modules={[EffectFade, Autoplay, Pagination]}
        className="mySwiper"
      >
        {data.map((ele) => {
          const desktopUrl = ele.desktopUrl || ele.url;
          const mobileUrl = ele.mobileUrl || desktopUrl;

          if (!desktopUrl) return null;

          return (
            <SwiperSlide key={ele._id}>
              <div className="relative w-screen aspect-[4/5] md:aspect-[50/19]">
                <Image
                  src={mobileUrl!}
                  alt="al idaad mobile banner"
                  fill
                  sizes="100vw"
                  className="object-center object-cover md:hidden"
                />
                <Image
                  src={desktopUrl}
                  alt="al idaad banner"
                  fill
                  sizes="100vw"
                  className="hidden object-center object-cover md:block"
                />
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </>
  );
};

export default BannerSlider;
