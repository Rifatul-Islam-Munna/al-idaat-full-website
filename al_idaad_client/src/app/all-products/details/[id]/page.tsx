import ProductDetailsClient from "@/components/ui/our-product/ProductDetailsClient";
import { getSingleProduct } from "@/utils/fetchData";
import { Metadata } from "next";

const stripHtml = (html?: string) => html?.replace(/<[^>]*>?/gm, "").trim();

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const product = await getSingleProduct(id);

    if (!product) {
        return {
            title: "Product Not Found",
        };
    }

    return {
        title: product.name,
        description: stripHtml(product.shortDescription || product.description)?.slice(0, 150) || "Buy premium Islamic clothing from Al Idaad",

        keywords: [product.name, product.category?.name, "Thobe Bangladesh", "Islamic clothing", "Attar BD"],

        openGraph: {
            title: product.name,
            description: stripHtml(product.shortDescription || product.description) || "Buy premium Islamic clothing from Al Idaad",
            images: [
                {
                    url: product.thumbnail,
                },
            ],
        },
    };
}

const ProductDetailsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const singleProductData = await getSingleProduct(id);

    // return <div className="py-20 max-w-7xl mx-auto"></div>;
    return (
        <div className="max-w-7xl mx-auto px-4 pt-4 pb-20">
            <ProductDetailsClient product={singleProductData}></ProductDetailsClient>
        </div>
    );
};

export default ProductDetailsPage;
