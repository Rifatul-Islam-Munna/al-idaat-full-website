// src/components/ui/banner/Banner.tsx
import { getBanners } from "@/utils/fetchData";
import BannerSlider from "./BannerSlider";
import Image from "next/image";

const Banner = async () => {
    const banners = await getBanners();

    if (!banners || banners.length === 0) return null;
    const desktopUrl = banners[0].desktopUrl || banners[0].url;
    const mobileUrl = banners[0].mobileUrl || desktopUrl;

    if (!desktopUrl) return null;

    return (
        <div className="relative w-full aspect-[4/5] md:aspect-[50/19]">
            {/* Server-rendered static hero image */}
            <div className="absolute inset-0 z-10">
                <Image
                    src={mobileUrl!}
                    alt="al idaad shop mobile banner"
                    fill
                    priority
                    sizes="100vw"
                    className="object-center object-cover md:hidden"
                />
                <Image
                    src={desktopUrl}
                    alt="al idaad shop banner"
                    fill
                    priority
                    sizes="100vw"
                    className="hidden object-center object-cover md:block"
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
