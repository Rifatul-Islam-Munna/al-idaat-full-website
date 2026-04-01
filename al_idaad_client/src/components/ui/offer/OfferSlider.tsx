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
import Link from "next/link";
import { OfferType } from "@/utils/types";

const OfferSlider = ({ offerBanner }: { offerBanner: OfferType[] }) => {
    return (
        <>
            <Swiper
                slidesPerView={"auto"}
                // spaceBetween={0}
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
                {offerBanner.map((ele) => (
                    <SwiperSlide key={ele._id}>
                        {/* Image */}
                        <div className="flex justify-center relative w-full aspect-5/3 lg:aspect-5/2">
                            <Link href={`/all-products/details/${ele.productId}`}>
                                <Image
                                    src={ele.url}
                                    alt="al idaad offer product"
                                    width={1920}
                                    height={1068}
                                    className="absolute left-0 right-0 w-full aspect-5/3 lg:aspect-5/2 rounded"
                                />
                            </Link>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </>
    );
};
export default OfferSlider;
