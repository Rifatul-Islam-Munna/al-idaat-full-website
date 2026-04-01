"use client";

import CategoryImageContainer from "@/components/ui/category_image/CategoryImageContainer";
import ProductContainer from "@/components/ui/product_page/product/ProductContainer";
import ProductList from "@/components/ui/product_page/product/ProductList";
import ProductCategoryContainer from "@/components/ui/product_page/product_category/ProductCategoryContainer";
import { useState } from "react";

type TabType = "category" | "products" | "allProducts" | "categoryImage";

const STORAGE_KEY = "product_active_tab";

const getInitialTab = (): TabType => {
    if (typeof window === "undefined") return "category";

    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "products" || saved === "category" || saved === "allProducts" || saved === "categoryImage" ? saved : "category";
};

const ProductPage = () => {
    const [activeTab, setActiveTab] = useState<TabType>(getInitialTab);

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        localStorage.setItem(STORAGE_KEY, tab);
    };

    const tabs: { key: TabType; label: string }[] = [
        { key: "category", label: "Handle Product Category" },
        { key: "products", label: "Handle Products" },
        { key: "allProducts", label: "All Products" },
        { key: "categoryImage", label: "Category Image" },
    ];

    return (
        <div>
            {/* Tabs Header */}
            <div className="relative border-b border-gray-300 mb-6">
                <div className="flex gap-8">
                    {tabs.map(({ key, label }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => handleTabChange(key)}
                            className={`relative px-6 py-3 text-sm font-medium outline-none transition-all duration-200
                            ${
                                activeTab === key
                                    ? "border border-gray-300 border-b-white bg-white rounded-t-md text-blue-600 -mb-px"
                                    : "border border-transparent text-gray-500 hover:text-blue-500"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="relative">
                <div
                    className={`absolute inset-0 transition-opacity duration-200
                    ${activeTab === "category" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                >
                    <ProductCategoryContainer />
                </div>

                <div
                    className={`absolute inset-0 transition-opacity duration-200
                    ${activeTab === "products" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                >
                    <ProductContainer />
                </div>

                <div
                    className={`absolute inset-0 transition-opacity duration-200
                    ${activeTab === "allProducts" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                >
                    <ProductList />
                </div>

                <div
                    className={`absolute inset-0 transition-opacity duration-200
                    ${activeTab === "categoryImage" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                >
                    <CategoryImageContainer />
                </div>
            </div>
        </div>
    );
};

export default ProductPage;
