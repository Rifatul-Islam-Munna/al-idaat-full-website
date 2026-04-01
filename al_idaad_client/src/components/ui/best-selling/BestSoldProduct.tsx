import { getProducts } from "@/utils/fetchData";
import BestSoldProductSlider from "./BestSellingProductSlider";

const BestSoldProduct = async () => {
    const productData = await getProducts();
    const bestSoldProduct = productData.filter((ele) => ele.isBestSelling);
    return (
        <div>
            <p className="heading">Best Selling Product</p>

            <BestSoldProductSlider product={bestSoldProduct}></BestSoldProductSlider>
        </div>
    );
};

export default BestSoldProduct;
