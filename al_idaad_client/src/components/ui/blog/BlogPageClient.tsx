"use client";

import BlogCard from "@/components/ui/blog/BlogCard";
import { BlogCategoryType, BlogType } from "@/utils/types";
import { useState } from "react";

interface Props {
    blogData: BlogType[];
    blogCategoryData: BlogCategoryType[];
}

const renderCategoryButtons = (categories: BlogCategoryType[], selectedCategory: string, onSelect: (id: string) => void, level: number = 0) => {
    return categories.map((cat) => (
        <div key={cat._id}>
            <button
                onClick={() => onSelect(cat._id)}
                style={{ paddingLeft: `${level * 12}px` }}
                className={`w-full text-left py-1 text-sm transition-colors ${
                    selectedCategory === cat._id ? "text-brand font-semibold" : "text-text_normal hover:text-brand"
                }`}
            >
                {level > 0 && <span className="mr-1 text-border">└</span>}
                {cat.name}
            </button>
            {cat.subCategories?.length > 0 && renderCategoryButtons(cat.subCategories as BlogCategoryType[], selectedCategory, onSelect, level + 1)}
        </div>
    ));
};

const CategoryList = ({
    blogCategoryData,
    selectedCategory,
    onSelect,
}: {
    blogCategoryData: BlogCategoryType[];
    selectedCategory: string;
    onSelect: (id: string) => void;
}) => (
    <>
        <button
            onClick={() => onSelect("all")}
            className={`w-full text-left py-1 text-sm transition-colors ${
                selectedCategory === "all" ? "text-brand font-semibold" : "text-text_normal hover:text-brand"
            }`}
        >
            All Categories
        </button>
        {renderCategoryButtons(blogCategoryData, selectedCategory, onSelect)}
    </>
);

const BlogPageClient = ({ blogData, blogCategoryData }: Props) => {
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [sidebarOpen, setSidebarOpen] = useState(false); // controls mounting
    const [sidebarVisible, setSidebarVisible] = useState(false); // controls CSS transition

    // Open: mount first, then trigger transition on next tick
    const openSidebar = () => {
        setSidebarOpen(true);
        setTimeout(() => setSidebarVisible(true), 10);
    };

    // Close: reverse transition first, then unmount after it finishes
    const closeSidebar = () => {
        setSidebarVisible(false);
        setTimeout(() => setSidebarOpen(false), 300); // match transition duration
    };

    const handleCategorySelect = (id: string) => {
        setSelectedCategory(id);
        closeSidebar();
    };

    const getAllCategoryIds = (category: BlogCategoryType): string[] => {
        let ids = [category._id];
        if (category.subCategories?.length > 0) {
            category.subCategories.forEach((sub) => {
                ids = [...ids, ...getAllCategoryIds(sub as BlogCategoryType)];
            });
        }
        return ids;
    };

    const findCategoryById = (categories: BlogCategoryType[], id: string): BlogCategoryType | undefined => {
        for (const cat of categories) {
            if (cat._id === id) return cat;
            if (cat.subCategories?.length > 0) {
                const found = findCategoryById(cat.subCategories as BlogCategoryType[], id);
                if (found) return found;
            }
        }
        return undefined;
    };

    const getCategoryFilterIds = (): string[] => {
        if (selectedCategory === "all") return [];
        const found = findCategoryById(blogCategoryData, selectedCategory);
        return found ? getAllCategoryIds(found) : [];
    };

    const filteredBlogs = selectedCategory === "all" ? blogData : blogData.filter((blog) => getCategoryFilterIds().includes(blog.category._id));

    return (
        <div className="flex gap-4 border-t border-border w-full lg:w-fit lg:mx-auto">
            {/* ── Desktop sidebar (lg+) ── */}
            <div className="hidden lg:block w-60 shrink-0 border-r border-border pt-4">
                <p className="font-semibold mb-2">Blog Category</p>
                <CategoryList blogCategoryData={blogCategoryData} selectedCategory={selectedCategory} onSelect={(id) => setSelectedCategory(id)} />
            </div>

            {/* ── Mobile: filter button ── */}
            <button
                onClick={openSidebar}
                className="lg:hidden fixed bottom-6 left-6 z-40 flex items-center gap-2 bg-brand text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z" />
                </svg>
                Filter
            </button>

            {/* ── Mobile sidebar overlay ── */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-50 flex"
                    style={{ transition: "background-color 300ms ease", backgroundColor: sidebarVisible ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0)" }}
                    onClick={closeSidebar}
                >
                    {/* Drawer */}
                    <div
                        className="relative z-10 w-64 h-full bg-white dark:bg-bg_secondary shadow-xl pt-6 px-4 pb-4 flex flex-col"
                        style={{ transition: "transform 300ms ease", transform: sidebarVisible ? "translateX(0)" : "translateX(-100%)" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <p className="font-semibold text-base">Blog Category</p>
                            <button onClick={closeSidebar} className="text-text_normal hover:text-brand transition">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M18 6 6 18" />
                                    <path d="m6 6 12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            <CategoryList blogCategoryData={blogCategoryData} selectedCategory={selectedCategory} onSelect={handleCategorySelect} />
                        </div>
                    </div>
                </div>
            )}

            {/* ── Blog grid ── */}
            <div className="flex flex-wrap lg:grid lg:grid-cols-2 xl:grid-cols-3 justify-between md:justify-center lg:justify-between space-y-6 md:space-y-0 md:gap-4 xl:gap-11.5 w-full pt-4">
                {filteredBlogs.length > 0 ? (
                    filteredBlogs.map((ele) => (
                        <div key={ele._id}>
                            <BlogCard data={ele} />
                        </div>
                    ))
                ) : (
                    <div className="lg:min-w-154 xl:min-w-248 text-center text-text_normal py-20">No blogs found in this category.</div>
                )}
            </div>
        </div>
    );
};

export default BlogPageClient;
