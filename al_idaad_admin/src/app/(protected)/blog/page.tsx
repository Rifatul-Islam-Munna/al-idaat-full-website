"use client";

import BlogContainer from "@/components/ui/blog_page/blog/BlogContainer";
import BlogCategoryContainer from "@/components/ui/blog_page/blog_category/BlogCategoryContainer";
import { useState } from "react";

type TabType = "category" | "blogs";

const STORAGE_KEY = "blog_active_tab";

const getInitialTab = (): TabType => {
    if (typeof window === "undefined") return "category";

    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "blogs" || saved === "category" ? saved : "category";
};

const BlogPage = () => {
    const [activeTab, setActiveTab] = useState<TabType>(getInitialTab);

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        localStorage.setItem(STORAGE_KEY, tab);
    };

    return (
        <div>
            {/* Tabs Header */}
            <div className="relative border-b border-gray-300 mb-6">
                <div className="flex gap-8">
                    <button
                        type="button"
                        onClick={() => handleTabChange("category")}
                        className={`relative px-6 py-3 text-sm font-medium outline-none transition-all duration-200
                        ${
                            activeTab === "category"
                                ? "border border-gray-300 border-b-white bg-white rounded-t-md text-blue-600 -mb-px"
                                : "border border-transparent text-gray-500 hover:text-blue-500"
                        }`}
                    >
                        Handle Blog Category
                    </button>

                    <button
                        type="button"
                        onClick={() => handleTabChange("blogs")}
                        className={`relative px-6 py-3 text-sm font-medium outline-none transition-all duration-200
                        ${
                            activeTab === "blogs"
                                ? "border border-gray-300 border-b-white bg-white rounded-t-md text-blue-600 -mb-px"
                                : "border border-transparent text-gray-500 hover:text-blue-500"
                        }`}
                    >
                        Handle Blogs
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="relative">
                <div
                    className={`absolute inset-0 transition-opacity duration-200
                    ${activeTab === "category" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                >
                    <BlogCategoryContainer />
                </div>

                <div
                    className={`absolute inset-0 transition-opacity duration-200
                    ${activeTab === "blogs" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                >
                    <BlogContainer />
                </div>
            </div>
        </div>
    );
};

export default BlogPage;
