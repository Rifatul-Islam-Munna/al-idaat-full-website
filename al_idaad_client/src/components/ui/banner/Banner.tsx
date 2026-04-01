// src/components/ui/banner/Banner.tsx
import { getBanners } from "@/utils/fetchData";
import BannerSlider from "./BannerSlider";
import Image from "next/image";

const Banner = async () => {
    const banners = await getBanners();

    if (!banners || banners.length === 0) return null;

    return (
        <div className="relative w-full h-70 sm:h-90 md:h-110 lg:h-130 xl:h-auto aspect-50/19">
            {/* Server-rendered static hero image */}
            <div className="absolute inset-0 z-10">
                <Image
                    src={banners[0].url}
                    alt="al idaad shop"
                    fill
                    priority
                    sizes="100vw"
                    className="w-full h-70 sm:h-90 md:h-110 lg:h-130 xl:h-auto aspect-50/19 object-center object-cover"
                />
            </div>

            {/* Server-rendered slider component */}
            <div className="absolute inset-0 z-20">
                <BannerSlider data={banners} />
            </div>
        </div>
    );
};

export default Banner;
