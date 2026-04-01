"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlinePlus, AiOutlineMinus, AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";

import { AxiosError } from "axios";
import Swal from "sweetalert2";

import UpdateBlogCategoryModal from "./UpdateBlogCategoryModal";
import { useAuth } from "@/components/shared/AuthContext";
import { Category } from "@/libs/types";
import { api } from "@/libs/axios";

const BlogCategoryDropdown: React.FC = () => {
    const [openIds, setOpenIds] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { blogCategories, blogCategoriesLoading, changeBlogCategoryKey } = useAuth();

    const toggleOpen = (id: string) => {
        setOpenIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };

    const handleEditClick = (cat: Category) => {
        setSelectedCategory(cat);
    };

    const closeModal = () => setSelectedCategory(null);

    const handleDeleteClick = async (cat: Category) => {
        Swal.fire({
            title: "Are you sure?",
            text: `Delete blog category "${cat.name}"? This cannot be undone.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    setDeletingId(cat._id);
                    await api.delete(`/blog-categories/${cat._id}`);
                    Swal.fire("Deleted!", "Blog category has been deleted.", "success");
                    changeBlogCategoryKey();
                } catch (err) {
                    const error = err as AxiosError<{ message?: string }>;
                    Swal.fire("Error!", error.response?.data?.message || "Failed to delete blog category.", "error");
                } finally {
                    setDeletingId(null);
                }
            }
        });
    };

    const renderCategories = (cats: Category[], level = 0, path: number[] = []) =>
        cats.map((cat, index) => {
            const isOpen = openIds.includes(cat._id);
            const currentPath = [...path, index]; // use path for unique key

            return (
                <div key={currentPath.join("-")} style={{ marginLeft: 20 }} className="mb-1">
                    <div className="flex items-center space-x-2">
                        {/* Toggle Button or Placeholder */}
                        {cat.subCategories.length > 0 ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleOpen(cat._id);
                                }}
                                className="flex items-center justify-center w-5 h-5 text-main bg-primary text-text_light rounded hover:bg-primary/50 transition"
                            >
                                {isOpen ? <AiOutlineMinus /> : <AiOutlinePlus />}
                            </button>
                        ) : (
                            <div className="w-5 h-5 bg-primary rounded"></div>
                        )}

                        {/* Category Name */}
                        <span>{cat.name}</span>

                        {/* Edit/Delete buttons (only for root categories) */}
                        {level === 0 && (
                            <div className="flex items-center space-x-1">
                                <button onClick={() => handleEditClick(cat)} className="text-main hover:bg-brand-soft p-1 rounded transition">
                                    <AiOutlineEdit />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(cat)}
                                    className={`p-1 rounded transition ${
                                        deletingId === cat._id ? "text-gray-400 cursor-not-allowed" : "text-red-500 hover:bg-red-100"
                                    }`}
                                    disabled={deletingId === cat._id}
                                >
                                    {deletingId === cat._id ? (
                                        <span className="animate-spin border-2 border-red-500 border-t-transparent rounded-full w-4 h-4 inline-block"></span>
                                    ) : (
                                        <AiOutlineDelete />
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    <AnimatePresence initial={false}>
                        {isOpen && cat.subCategories.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                                className="border-l border-main pl-6"
                            >
                                {renderCategories(cat.subCategories, level + 1, currentPath)}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            );
        });

    if (blogCategoriesLoading) return <div>Loading categories...</div>;
    if (!blogCategories.length) return <div>No categories found</div>;

    return (
        <div>
            <p className="text-xl font-bold mb-4">Created Categories</p>
            {renderCategories(blogCategories)}

            <AnimatePresence mode="wait">
                {selectedCategory && <UpdateBlogCategoryModal key="update-modal" category={selectedCategory} onClose={closeModal} />}
            </AnimatePresence>
        </div>
    );
};

export default BlogCategoryDropdown;
