import AddOfferBanner from "@/components/ui/offer_page/AddOfferBanner";
import GetOfferBanner from "@/components/ui/offer_page/GetOfferBanner";

const OfferBannerPage = () => {
    return (
        <div className="flex gap-4">
            <div className="flex-1 shrink-0">
                <AddOfferBanner></AddOfferBanner>
            </div>
            <div className="flex-1 shrink-0">
                <GetOfferBanner></GetOfferBanner>
            </div>
        </div>
    );
};

export default OfferBannerPage;
