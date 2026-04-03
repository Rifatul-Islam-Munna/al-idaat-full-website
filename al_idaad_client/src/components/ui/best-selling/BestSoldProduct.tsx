import { getProducts } from "@/utils/fetchData";
import BestSoldProductSlider from "./BestSellingProductSlider";

const BestSoldProduct = async () => {
  const productData = await getProducts();
  const bestSoldProduct = productData.filter((ele) => ele.isBestSelling);

  return (
    <section className=" py-5">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-brand bg-brand/5 px-4 py-1.5 rounded-full mb-3">
          Top Picks
        </span>
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 leading-tight">
          Best Selling Products
        </h2>
        <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
          Our most loved products — handpicked by thousands of happy customers
        </p>
      </div>

      <BestSoldProductSlider product={bestSoldProduct} />
    </section>
  );
};

export default BestSoldProduct;
