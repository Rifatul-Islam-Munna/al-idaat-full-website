"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";
import Image from "next/image";
import SingleImageUploader from "@/components/shared/SingleImageUploader";
import { FaCircleXmark } from "react-icons/fa6";
import { useAuth } from "@/components/shared/AuthContext";
import { api } from "@/libs/axios";
import { findMainParentById, getLowestLevelCategories } from "@/libs/utils";

const AddCategoryImage = () => {
    const [url, setUrl] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [categoryName, setCategoryName] = useState("");
    const [categoryParentName, setCategoryParentName] = useState("");

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [deleting, setDeleting] = useState(false);

    const { changeCategoryImagesKey, changeUploedFilesKey, productCategories } = useAuth();

    const lowestLevelcategories = getLowestLevelCategories(productCategories);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            url,
            categoryId,
            categoryName,
            categoryParentName,
        };
        console.log(payload);
        try {
            const res = await api.post("/category-images", payload);

            if (res.data.success) {
                Swal.fire("Success", "Category image added", "success");

                setUrl("");
                setCategoryId("");
                setCategoryName("");
                setCategoryParentName("");

                changeCategoryImagesKey();
            }
        } catch (error) {
            console.log(error);
            Swal.fire("Error", "Failed to add category image", "error");
        }
    };

    const handleDeleteImage = async () => {
        if (!selectedIds.length) return;

        setDeleting(true);

        try {
            const res = await api.delete("/uploads/multiple", {
                data: { ids: selectedIds },
            });

            if (res.data.success) {
                Swal.fire("Deleted", "Image removed", "success");
                setSelectedIds([]);
                setUrl("");
                changeUploedFilesKey();
            }
        } catch {
            Swal.fire("Error", "Failed to delete image", "error");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="h-[calc(100vh-202px)] overflow-y-auto px-4 custom-scrollbar">
            <div className="max-w-4xl mx-auto bg-bg_main border border-border rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-text_dark mb-6">Add Category Image</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Category Dropdown */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-text_normal">Category</label>

                        <select
                            value={categoryId}
                            onChange={(e) => {
                                const selectedId = e.target.value;

                                setCategoryId(selectedId);

                                const selectedCategory = lowestLevelcategories.find((c) => c._id === selectedId);

                                if (selectedCategory) {
                                    setCategoryName(selectedCategory.name);
                                }

                                const parent = findMainParentById(productCategories, selectedId);

                                if (parent) {
                                    setCategoryParentName(parent.name);
                                }
                            }}
                            className="w-full px-3 py-2 rounded border border-border bg-slate-100"
                        >
                            <option value="">Select Category</option>

                            {lowestLevelcategories.map((ele) => (
                                <option key={ele._id} value={ele._id}>
                                    {ele.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Category Name */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-text_normal">Category Name</label>

                        <input type="text" value={categoryName} readOnly className="w-full px-3 py-2 rounded border border-border bg-slate-100" />
                    </div>

                    {/* Parent Category Name */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-text_normal">Parent Category Name</label>

                        <input
                            type="text"
                            value={categoryParentName}
                            readOnly
                            className="w-full px-3 py-2 rounded border border-border bg-slate-100"
                        />
                    </div>

                    {/* Upload */}
                    <div>
                        <label className="block text-sm font-medium text-text_normal">
                            Upload Category Image <span className="text-green-600 font-normal">( aspect ratio - 1:1 )</span>
                        </label>

                        <SingleImageUploader
                            onImageUpload={(props) => {
                                setUrl(props.url);
                                setSelectedIds([props._id]);
                            }}
                        />
                    </div>

                    {/* Preview */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-text_normal">Image Preview</label>

                        <div className="relative border border-border rounded-lg overflow-hidden bg-slate-100 h-40 w-40 flex items-center justify-center">
                            {!url && <span className="text-sm text-text_normal">No image selected</span>}

                            {url && !deleting && <Image src={url} alt="Category Image" width={120} height={120} className="w-full h-full" />}

                            {url && (
                                <button
                                    type="button"
                                    onClick={handleDeleteImage}
                                    className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow text-red-500"
                                >
                                    <FaCircleXmark size={18} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Image URL */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-text_normal">Image URL</label>

                        <input type="text" value={url} readOnly className="w-full px-3 py-2 rounded border border-border bg-slate-100 text-sm" />
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end pt-4 border-t border-border">
                        <button type="submit" className="px-6 py-2.5 bg-primary text-text_light rounded-lg hover:bg-selected transition">
                            Save Category Image
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCategoryImage;
