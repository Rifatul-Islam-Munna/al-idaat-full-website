"use client";

import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FaTrash } from "react-icons/fa";
import { IoMdAddCircle } from "react-icons/io";
import { useAuth } from "@/components/shared/AuthContext";
import { api } from "@/libs/axios";

// -----------------
// Types
// -----------------
interface Category {
    name: string;
    subCategories: Category[];
}

// -----------------
// Component
// -----------------
const AddProductCategory = () => {
    const { changeProductCategoryKey } = useAuth();
    const [category, setCategory] = useState<Category>({
        name: "",
        subCategories: [],
    });
    const [loading, setLoading] = useState<boolean>(false);

    // -----------------
    // Update category name
    // -----------------
    const handleNameChange = (path: number[], value: string) => {
        setCategory((prev) => {
            const updated = structuredClone(prev) as Category;

            let current: Category = updated;
            for (const index of path) {
                current = current.subCategories[index];
            }
            current.name = value;
            return updated;
        });
    };

    // -----------------
    // Add subcategory
    // -----------------
    const handleAddSubCategory = (path: number[]) => {
        setCategory((prev) => {
            const updated = structuredClone(prev) as Category;

            let current: Category = updated;
            for (const index of path) {
                current = current.subCategories[index];
            }
            current.subCategories.push({ name: "", subCategories: [] });

            return updated;
        });
    };

    // -----------------
    // Delete subcategory
    // -----------------
    const handleDeleteSubCategory = (path: number[]) => {
        if (path.length === 0) return; // cannot delete root
        setCategory((prev) => {
            const updated = structuredClone(prev) as Category;

            let current: Category = updated;
            for (let i = 0; i < path.length - 1; i++) {
                current = current.subCategories[path[i]];
            }

            current.subCategories.splice(path[path.length - 1], 1);
            return updated;
        });
    };

    // -----------------
    // Recursive Renderer
    // -----------------
    const renderCategory = (cat: Category, path: number[] = []) => (
        <div key={path.join("-")} className="ml-4 mt-2 border-l border-main pl-4 relative">
            <input
                type="text"
                placeholder="Category name"
                value={cat.name}
                onChange={(e) => handleNameChange(path, e.target.value)}
                className="border border-main rounded px-2 py-1 w-64"
            />
            <button
                type="button"
                onClick={() => handleAddSubCategory(path)}
                className="px-2 py-1 rounded text-blue-400 hover:text-blue-700 border ml-2 mt-2"
            >
                <IoMdAddCircle />
            </button>
            {path.length > 0 && (
                <button
                    type="button"
                    onClick={() => handleDeleteSubCategory(path)}
                    className="px-2 py-1 rounded text-red-400 hover:text-red-700 border ml-2 mt-2"
                >
                    <FaTrash />
                </button>
            )}

            {cat.subCategories.map((sub, i) => renderCategory(sub, [...path, i]))}
        </div>
    );

    // -----------------
    // POST function
    // -----------------
    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await api.post("/categories", category);
            if (response.data.success) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "Product category created successfully!",
                    confirmButtonText: "OK",
                });
                setCategory({ name: "", subCategories: [] });
                changeProductCategoryKey();
            }

            console.log("Response data:", response.data);

            // Reset form
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error.response?.data?.message || "Error submitting  category",
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Something went wrong",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <p className="text-xl font-bold mb-4">Category Builder</p>
            <div className="-ml-4">{renderCategory(category)}</div>
            <button type="button" onClick={handleSubmit} disabled={loading} className="mt-4 bg-primary text-text_light px-4 py-2 rounded">
                {loading ? "Submitting..." : "Submit  Category"}
            </button>
        </div>
    );
};
export default AddProductCategory;
