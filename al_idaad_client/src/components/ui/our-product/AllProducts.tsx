import { getCategories, getProducts } from "@/utils/fetchData";
import AllProductsClient from "./AllProductsClient";

const AllProducts = async ({ activeCategory }: { activeCategory: string }) => {
    const productData = await getProducts();
    const productCategories = await getCategories();

    return <AllProductsClient products={productData} categories={productCategories} activeCategory={activeCategory} />;
};

export default AllProducts;
