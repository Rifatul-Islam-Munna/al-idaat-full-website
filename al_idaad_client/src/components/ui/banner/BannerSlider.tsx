"use client";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

// import "./style.css";

// import required modules
import { EffectFade, Autoplay } from "swiper/modules";
import Image from "next/image";
import { BannerType } from "@/utils/types";

const BannerSlider = ({ data }: { data: BannerType[] }) => {
    return (
        <>
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
                // pagination={{
                //     clickable: true,
                // }}
                modules={[EffectFade, Autoplay]}
                className="mySwiper"
            >
                {data.map((ele) => (
                    <SwiperSlide key={ele._id}>
                        {/* Image */}
                        <div className="w-screen h-70 sm:h-90 md:h-110 lg:h-130 xl:h-auto aspect-50/19">
                            <Image
                                src={ele.url}
                                alt="al idaad banner"
                                width={1920}
                                height={640}
                                // className="w-screen h-50 banner sm:h-75! md:h-90! lg:h-120! xl:h-150!"
                                className="w-screen h-70 sm:h-90 md:h-110 lg:h-130 xl:h-auto aspect-50/19 object-center object-cover"
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </>
    );
};
export default BannerSlider;
