import Link from "next/link";
import { getBlogs } from "@/utils/fetchData";
import BlogSlider from "./BlogSlider";
import BlogCardHome from "./BlogCardHome";
import { FiArrowRight } from "react-icons/fi";

const Blog = async () => {
  const blogData = await getBlogs();

  return (
    <section className="py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-brand bg-brand/5 px-4 py-1.5 rounded-full mb-3">
          Blog & News
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
          Our Latest News
        </h2>
        <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
          Stay up to date with our latest updates, tips, and stories
        </p>
      </div>

      {/* Desktop — 4 cards */}
      <div className="hidden xl:grid xl:grid-cols-4 gap-4">
        {blogData.slice(0, 4).map((ele) => (
          <BlogCardHome key={ele._id} data={ele} />
        ))}
      </div>

      {/* Tablet — 3 cards */}
      <div className="hidden lg:grid lg:grid-cols-3 xl:hidden gap-4">
        {blogData.slice(0, 3).map((ele) => (
          <BlogCardHome key={ele._id} data={ele} />
        ))}
      </div>

      {/* Mobile — slider */}
      <div className="lg:hidden">
        <BlogSlider data={blogData} />
      </div>

      {/* CTA */}
      <div className="flex justify-center mt-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl
                               border border-brand text-brand font-semibold text-sm
                               hover:bg-brand hover:text-white
                               transition-all duration-200"
        >
          Explore All Posts
          <FiArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
};

export default Blog;
