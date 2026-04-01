import { getCategories, getCategoryImage } from "@/utils/fetchData";
// import AllCategoriesClient from "./AllCategoriesClient";
// import AllCategorySlider from "./AllCategorySlider";
import AllCategoryImageSlider from "./AllCategoryImageSlider";

const AllCategories = async () => {
    const categoryData = await getCategories();
    const categoryImageData = await getCategoryImage();
    return (
        <div>
            <p className="font-poppins text-2xl sm:text-3xl leading-0 text-center">Browse Catagories</p>
            <p className="text-text_normal text-center my-6">
                Discover our diverse collection of categories and find the product that suits you best
            </p>
            {/* <AllCategoriesClient categories={categoryData}></AllCategoriesClient> */}
            {/* <AllCategorySlider categories={categoryData}></AllCategorySlider> */}
            <AllCategoryImageSlider categories={categoryData} categoryImages={categoryImageData}></AllCategoryImageSlider>
        </div>
    );
};

export default AllCategories;
