import { getCategories, getCategoryImage } from "@/utils/fetchData";
import AllCategoryImageSlider from "./AllCategoryImageSlider";

const AllCategories = async () => {
  const categoryData = await getCategories();
  const categoryImageData = await getCategoryImage();

  return (
    <section className="py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-brand bg-brand/5 px-4 py-1.5 rounded-full mb-3">
          Our Collection
        </span>
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 leading-tight">
          Browse Categories
        </h2>
        <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
          Discover our diverse collection and find the product that suits you
          best
        </p>
      </div>

      <AllCategoryImageSlider
        categories={categoryData}
        categoryImages={categoryImageData}
      />
    </section>
  );
};

export default AllCategories;
