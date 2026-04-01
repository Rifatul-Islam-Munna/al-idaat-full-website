"use client";
import BannerUploader from "@/components/ui/banner_page/Banner";
import GetBanner from "@/components/ui/banner_page/GetBanner";

const BannerPage = () => {
    return (
        <div className="flex gap-2 w-full">
            <div className="flex-1 h-[calc(100vh-132px)] overflow-y-auto custom-scrollbar pr-2">
                <BannerUploader></BannerUploader>
            </div>
            <div className="flex-1 h-[calc(100vh-132px)] overflow-y-auto custom-scrollbar pr-2">
                <GetBanner></GetBanner>
            </div>
        </div>
    );
};

export default BannerPage;
