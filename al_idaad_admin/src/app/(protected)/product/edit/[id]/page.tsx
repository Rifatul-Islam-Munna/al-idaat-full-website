import EditProduct from "@/components/ui/product_page/product/EditProduct";

const ProductEditPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    return (
        <div>
            <EditProduct id={id}></EditProduct>
        </div>
    );
};

export default ProductEditPage;
