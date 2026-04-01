import { getProducts } from "@/utils/fetchData";
import FeatureProductSlider from "./FeatureProductSlider";

const FeaturedProduct = async () => {
    const productData = await getProducts();
    const featuredProduct = productData.filter((ele) => ele.isFeatured);
    return (
        <div>
            <p className="heading">Featured Product</p>
            <FeatureProductSlider product={featuredProduct}></FeatureProductSlider>
        </div>
    );
};

export default FeaturedProduct;
