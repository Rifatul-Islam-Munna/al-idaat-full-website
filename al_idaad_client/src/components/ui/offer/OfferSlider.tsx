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
                {offerBanner.map((ele) => {
                    const desktopUrl = ele.desktopUrl || ele.url;
                    const mobileUrl = ele.mobileUrl || desktopUrl;

                    if (!desktopUrl) {
                        return null;
                    }

                    return (
                        <SwiperSlide key={ele._id}>
                            {/* Image */}
                            <div className="flex justify-center relative w-full aspect-[4/5] md:aspect-[5/2]">
                                <Link href={`/all-products/details/${ele.productId}`} className="relative block h-full w-full">
                                    <Image
                                        src={mobileUrl!}
                                        alt="al idaad mobile offer product"
                                        fill
                                        sizes="100vw"
                                        className="rounded object-cover md:hidden"
                                    />
                                    <Image
                                        src={desktopUrl}
                                        alt="al idaad offer product"
                                        fill
                                        sizes="100vw"
                                        className="hidden rounded object-cover md:block"
                                    />
                                </Link>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </>
    );
};
export default OfferSlider;
