import Link from "next/link";
import ProductCard from "./ProductCard";
import { getProducts } from "@/utils/fetchData";

const OurProduct = async () => {
    const productData = await getProducts();
    return (
        <div>
            <p className="heading">Our Product</p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 space-y-6 gap-4 w-full">
                {productData.slice(0, 8).map((e) => (
                    <div key={e._id}>
                        <ProductCard data={e}></ProductCard>
                    </div>
                ))}
            </div>

            <div className="flex justify-center mt-10">
                <Link
                    href="/all-products"
                    className="bg-brand px-4 py-2 rounded w-fit border border-brand hover:bg-transparent hover:text-brand transition duration-150 ease-in-out font-semibold"
                >
                    View All Products
                </Link>
            </div>
        </div>
    );
};

export default OurProduct;
