import AddProduct from "./AddProduct";
import GetProduct from "./GetProduct";

const ProductContainer = () => {
    return (
        <div className="flex gap-4">
            <div className="flex-1">
                <AddProduct></AddProduct>
            </div>
            <div className="flex-1">
                <GetProduct></GetProduct>
            </div>
        </div>
    );
};

export default ProductContainer;
