import CustomerReviews from "@/components/shared/CustomerReviews";
import Banner from "@/components/ui/banner/Banner";
import BestSoldProduct from "@/components/ui/best-selling/BestSoldProduct";
import Blog from "@/components/ui/blog/Blog";
import AllCategories from "@/components/ui/categories/AllCategories";
import ChoouseUs from "@/components/ui/choose-us/ChoouseUs";
import FeaturedProduct from "@/components/ui/featured/FeaturedProduct";
import Offer from "@/components/ui/offer/Offer";
import OurProduct from "@/components/ui/our-product/OurProduct";
// import Link from "next/link";

const Homepage = () => {
  return (
    <div>
      <div className="relative">
        <Banner></Banner>
      </div>
      <div className="space-y-2 lg:space-y-5 py-0 lg:py-5 px-4 max-w-7xl mx-auto">
        <div className="-mt-4 lg:-mt-8 ">
          <AllCategories></AllCategories>
        </div>
        <FeaturedProduct></FeaturedProduct>
        <Offer></Offer>
        <BestSoldProduct></BestSoldProduct>
        <OurProduct></OurProduct>
        <CustomerReviews />
        <ChoouseUs></ChoouseUs>
        <Blog></Blog>
      </div>
    </div>
  );
};

export default Homepage;
