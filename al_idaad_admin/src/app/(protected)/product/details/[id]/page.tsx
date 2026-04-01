import ProductDetails from "@/components/ui/product_page/product/ProductDetails";

const ProductDetailsPage = async ({ params }: { params: { id: string } }) => {
    const { id } = await params;
    console.log(id);

    return (
        <div>
            <ProductDetails id={id}></ProductDetails>
        </div>
    );
};

export default ProductDetailsPage;
