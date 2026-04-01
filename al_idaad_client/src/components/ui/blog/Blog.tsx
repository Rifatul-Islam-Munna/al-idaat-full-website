import Link from "next/link";

import { getBlogs } from "@/utils/fetchData";
import BlogSlider from "./BlogSlider";
import BlogCardHome from "./BlogCardHome";

const Blog = async () => {
    const blogData = await getBlogs();

    return (
        <div>
            <p className="text-2xl sm:text-3xl font-poppins text-center mb-8">Our Latest News</p>
            <div className="hidden xl:flex justify-between">
                {blogData.slice(0, 4).map((ele) => (
                    <div key={ele._id}>
                        <BlogCardHome data={ele}></BlogCardHome>
                    </div>
                ))}
            </div>

            <div className="hidden lg:flex xl:hidden justify-center gap-4">
                {blogData.slice(0, 3).map((ele) => (
                    <div key={ele._id}>
                        <BlogCardHome data={ele}></BlogCardHome>
                    </div>
                ))}
            </div>

            <div className="lg:hidden">
                <BlogSlider data={blogData}></BlogSlider>
            </div>

            <div className="flex w-full justify-end lg:justify-center xl:justify-end mt-4">
                <Link href="/blog" className="text-text_normal flex items-end gap-1 w-fit">
                    <span className="hover:underline transition duration-150">Explore more</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-arrow-right-icon lucide-arrow-right"
                    >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default Blog;
