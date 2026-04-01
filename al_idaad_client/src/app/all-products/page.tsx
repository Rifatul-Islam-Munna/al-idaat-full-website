import AllProducts from "@/components/ui/our-product/AllProducts";
import { Metadata } from "next";

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const { category } = await searchParams;

    const title = category ? `${category} Collection in Bangladesh` : "All Products";

    const description = category
        ? `Shop ${category} in Bangladesh from Al Idaad. Premium quality Islamic clothing including Thobe, Panjabi, Shirts and more.`
        : "Explore all products from Al Idaad. Buy Thobe, Panjabi, Shirts, Pants and Attar in Bangladesh.";

    return {
        title,
        description,
        keywords: ["Al Idaad products", "Thobe Bangladesh", "Islamic clothing BD", category || ""],

        openGraph: {
            title,
            description,
            type: "website",
        },
    };
}

type Props = {
    searchParams: Promise<{
        category?: string;
    }>;
};

const AllProductPage = async ({ searchParams }: Props) => {
    const { category } = await searchParams;

    return (
        <div className="pb-20 max-w-7xl px-4 mx-auto">
            <AllProducts activeCategory={category || ""}></AllProducts>
        </div>
    );
};

export default AllProductPage;
