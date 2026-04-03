import Link from "next/link";
import ProductCard from "./ProductCard";
import { getProducts } from "@/utils/fetchData";
import { FiArrowRight } from "react-icons/fi";

const OurProduct = async () => {
  const productData = await getProducts();

  return (
    <section className="py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-brand bg-brand/5 px-4 py-1.5 rounded-full mb-3">
          Our Store
        </span>
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 leading-tight">
          Our Products
        </h2>
        <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
          Explore our latest collection of quality products at the best prices
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
        {productData.slice(0, 8).map((e) => (
          <ProductCard key={e._id} data={e} />
        ))}
      </div>

      {/* CTA */}
      <div className="flex justify-center mt-10">
        <Link
          href="/all-products"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl
                               border border-brand text-brand font-semibold text-sm
                               hover:bg-brand hover:text-white
                               transition-all duration-200"
        >
          View All Products
          <FiArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
};

export default OurProduct;
