import { useAuth } from "@/components/shared/AuthContext";
import { api } from "@/libs/axios";
import { AxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, JSX } from "react";
import { LuSquarePen, LuTrash2 } from "react-icons/lu";
import Swal from "sweetalert2";

interface Category {
    _id: string;
    name: string;
    subCategories: Category[];
}

const ProductList = () => {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    // const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    // const [categoryLoading, setCategoryLoading] = useState<boolean>(true);

    const router = useRouter();

    const { products, productsLoading, changeProductKey, changeUploedFilesKey, productCategories, productCategoriesLoading } = useAuth();

    const handleDelete = async (id: string) => {
        Swal.fire({
            title: "Are you sure?",
            text: `Delete this item? This cannot be undone.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                setDeletingId(id);
                try {
                    await api.delete(`/products/${id}`);
                    Swal.fire("Deleted!", "Product has been deleted.", "success");
                    changeProductKey();
                    changeUploedFilesKey();
                } catch (err) {
                    const error = err as AxiosError<{ message?: string }>;
                    Swal.fire("Error!", error.response?.data?.message || "Failed to delete Product.", "error");
                } finally {
                    setDeletingId(null);
                }
            }
        });
    };

    // Function to get all category IDs including subcategories
    const getAllCategoryIds = (category: Category): string[] => {
        let ids = [category._id];
        if (category.subCategories && category.subCategories.length > 0) {
            category.subCategories.forEach((subCat) => {
                ids = [...ids, ...getAllCategoryIds(subCat)];
            });
        }
        return ids;
    };

    // Recursively search for a category by ID
    const findCategoryById = (categories: Category[], id: string): Category | undefined => {
        for (const category of categories) {
            if (category._id === id) {
                return category;
            }
            if (category.subCategories.length > 0) {
                const found = findCategoryById(category.subCategories, id);
                if (found) {
                    return found;
                }
            }
        }
        return undefined;
    };

    // Get all category IDs for filtering
    const getCategoryFilterIds = () => {
        if (selectedCategory === "all") return [];
        const selectedCat = findCategoryById(productCategories, selectedCategory);
        return selectedCat ? getAllCategoryIds(selectedCat) : [];
    };

    // Filter products based on selected category
    const filteredProducts =
        selectedCategory === "all"
            ? products?.data || []
            : products?.data.filter((prod) => prod.categoryIdListFilter.some((id) => getCategoryFilterIds().includes(id))) || [];

    // Generate options for the category dropdown with explicit return type
    const renderCategoryOptions = (categories: Category[], level: number = 0): JSX.Element[] => {
        return categories.map((category) => (
            <React.Fragment key={category._id}>
                <option value={category._id}>
                    {"\u00A0".repeat(level * 5)} {category.name}
                </option>
                {category.subCategories.length > 0 && renderCategoryOptions(category.subCategories, level + 1)}
            </React.Fragment>
        ));
    };

    if (productsLoading || productCategoriesLoading) {
        return (
            <div className="bg-main h-[calc(100vh-100px)] flex items-center justify-center">
                <div className="flex items-center justify-center gap-2">
                    <span className="animate-spin border-6 border-blue-400 border-t-transparent rounded-full w-8 h-8 inline-block"></span>
                    <p>Loading {productsLoading ? "Products..." : "Categories..."}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="text-sm 2xl:text-[16px]">
            {/* Category Filter */}
            <div className="mb-4">
                <label htmlFor="categoryFilter" className="mr-2 font-bold text-main">
                    Filter by Category:
                </label>
                <select
                    id="categoryFilter"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="p-2 border border-main rounded bg-bg_secondary text-main custom-scrollbar"
                >
                    <option value="all">All Categories</option>
                    {renderCategoryOptions(productCategories)}
                </select>
            </div>

            <div>
                {filteredProducts.length ? (
                    <div className="pr-2 space-y-0.5 max-h-[calc(100vh-258px)] overflow-y-auto custom-scrollbar relative">
                        {/* ------------table heading----------------- */}
                        <div className="flex sticky top-0 shadow">
                            <div className="bg-bg_secondary px-2 flex-1/21 py-4 font-bold text-main">No.</div>
                            <div className="bg-bg_secondary px-2 flex-2/21 py-4 font-bold text-main">Image</div>
                            <div className="bg-bg_secondary px-2 flex-4/21 py-4 font-bold text-main">Product Name</div>
                            <div className="bg-bg_secondary px-2 flex-2/21 py-4 font-bold text-main">In Stock</div>
                            <div className="bg-bg_secondary px-2 flex-2/21 py-4 font-bold text-main">Category</div>
                            <div className="bg-bg_secondary px-2 flex-2/21 py-4 font-bold text-main">Brand</div>
                            <div className="bg-bg_secondary px-2 flex-2/21 py-4 font-bold text-main">Price</div>
                            <div className="bg-bg_secondary px-2 flex-2/21 py-4 font-bold text-main">Discount Percentage</div>
                            <div className="bg-bg_secondary px-2 flex-2/21 py-4 font-bold text-main">Final Price</div>
                            <div className="bg-bg_secondary px-2 flex-1/21 py-4 font-bold text-main"></div>
                        </div>
                        {/* -------------table content---------------- */}
                        {filteredProducts.map((ele, i) => (
                            <div key={ele._id} className="flex">
                                <div className="bg-bg_secondary px-2 flex-1/21 py-4 font-bold text-main">{i + 1}.</div>
                                <div className="bg-bg_secondary px-2 py-2 flex-2/21 flex items-center text-soft">
                                    <Image src={ele.thumbnail} width={53} height={80} alt="product image" className="h-20 w-13.25" />
                                </div>
                                <div className="bg-bg_secondary px-2 py-2 flex-4/21 flex items-center text-soft">
                                    <Link href={`/product/details/${ele._id}`}>
                                        <span className="hover:text-blue-500 transition">{ele.name}</span>
                                    </Link>
                                </div>
                                <div className="bg-bg_secondary px-2 py-2 flex-2/21 flex items-center text-soft">
                                    {ele.inStock ? <span className="text-green-700">Yes</span> : <span className="text-red-400">No</span>}
                                </div>
                                <div className="bg-bg_secondary px-2 py-2 flex-2/21 flex items-center text-soft">{ele.category.name}</div>
                                <div className="bg-bg_secondary px-2 py-2 flex-2/21 flex items-center text-soft">{ele.brand ? ele.brand : "-"}</div>
                                <div className="bg-bg_secondary px-2 py-2 flex-2/21 flex items-center text-soft">{ele.price}</div>
                                <div className="bg-bg_secondary px-2 py-2 flex-2/21 flex items-center text-soft">
                                    {ele.discountPercentage ? <span className="text-red-400">{ele.discountPercentage}%</span> : "No discount"}
                                </div>
                                <div className="bg-bg_secondary px-2 py-2 flex-2/21 flex items-center text-soft">
                                    {ele.discountPercentage ? Math.round(ele.price - ele.price * (ele.discountPercentage / 100)) : ele.price}
                                </div>
                                <div className="bg-bg_secondary px-2 py-2 flex-1/21 flex items-center text-soft">
                                    <div className="flex flex-col justify-between gap-3 items-center w-full">
                                        <button
                                            className="text-brand hover:text-blue-500 transition active:scale-90"
                                            onClick={() => router.push(`/product/edit/${ele._id}`)}
                                        >
                                            <LuSquarePen size={16} />
                                        </button>
                                        <button
                                            disabled={deletingId === ele._id}
                                            onClick={() => handleDelete(ele._id)}
                                            className="text-red-400 hover:text-red-800 transition"
                                        >
                                            {deletingId === ele._id ? (
                                                <span className="animate-spin border-2 border-red-500 border-t-transparent rounded-full w-4 h-4 inline-block"></span>
                                            ) : (
                                                <LuTrash2 />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col justify-center items-center mx-auto w-full h-[calc(100vh-132px)]">
                        <Image src="/empty.png" width={200} height={200} alt="empty" />
                        <p className="text-3xl font-bold text-soft mt-2">No product found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductList;
