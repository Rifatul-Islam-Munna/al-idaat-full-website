import { getProducts } from "@/utils/fetchData";
import FeatureProductSlider from "./FeatureProductSlider";

const FeaturedProduct = async () => {
  const productData = await getProducts();
  const featuredProduct = productData.filter((ele) => ele.isFeatured);

  return (
    <section className="py-2">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-brand bg-brand/5 px-4 py-1.5 rounded-full mb-3">
          Hand Picked
        </span>
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 leading-tight">
          Featured Products
        </h2>
        <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
          Carefully selected products that stand out for quality and value
        </p>
      </div>

      <FeatureProductSlider product={featuredProduct} />
    </section>
  );
};

export default FeaturedProduct;
