import { getOfferBanner } from "@/utils/fetchData";
import OfferSlider from "./OfferSlider";

const Offer = async () => {
    const offerData = await getOfferBanner();
    return (
        <div>
            {/* <p className="text-3xl font-poppins text-center font-semibold mb-8">On Going Offer</p> */}
            <OfferSlider offerBanner={offerData}></OfferSlider>
        </div>
    );
};

export default Offer;
