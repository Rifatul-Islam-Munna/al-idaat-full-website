import { getProducts } from "@/utils/fetchData";
import FeatureProductSlider from "../ui/featured/FeatureProductSlider";

const RelatedProducts = async () => {
  const productData = await getProducts();

  // Just grab first 8–12 products, no filtering needed
  const relatedProducts = productData.slice(0, 12);

  if (!relatedProducts.length) return null;

  return (
    <section className="py-10 md:py-14">
      <div className="mb-8">
        <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.18em] text-brand">
          You may also like
        </span>

        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold leading-tight text-gray-900 sm:text-3xl">
              Related Products
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-400">
              More products you might enjoy
            </p>
          </div>
        </div>
      </div>

      <FeatureProductSlider product={relatedProducts} />
    </section>
  );
};

export default RelatedProducts;
