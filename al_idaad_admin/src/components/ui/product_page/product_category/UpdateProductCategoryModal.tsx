"use client";

import React, { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { IoMdAddCircle } from "react-icons/io";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import axios from "axios";
import { useAuth } from "@/components/shared/AuthContext";
import { api } from "@/libs/axios";

interface Category {
    _id?: string;
    name: string;
    subCategories: Category[];
}

interface UpdateProductCategoryModalProps {
    category: Category;
    onClose: () => void;
}

const UpdateProductCategoryModal: React.FC<UpdateProductCategoryModalProps> = ({ category, onClose }) => {
    const { changeProductCategoryKey } = useAuth();

    const [formData, setFormData] = useState<Category>(category);
    const [loading, setLoading] = useState(false);

    // -----------------
    // Helpers
    // -----------------
    const handleNameChange = (path: number[], value: string) => {
        setFormData((prev) => {
            const updated = structuredClone(prev) as Category;
            let current: Category = updated;
            for (const index of path) {
                current = current.subCategories[index];
            }
            current.name = value;
            return updated;
        });
    };

    const handleAddSubCategory = (path: number[]) => {
        setFormData((prev) => {
            const updated = structuredClone(prev) as Category;
            let current: Category = updated;
            for (const index of path) {
                current = current.subCategories[index];
            }
            current.subCategories.push({
                name: "",
                subCategories: [],
            });
            return updated;
        });
    };

    const handleDeleteSubCategory = (path: number[]) => {
        if (path.length === 0) return;
        setFormData((prev) => {
            const updated = structuredClone(prev) as Category;
            let current: Category = updated;
            for (let i = 0; i < path.length - 1; i++) {
                current = current.subCategories[path[i]];
            }
            current.subCategories.splice(path[path.length - 1], 1);
            return updated;
        });
    };

    const renderCategory = (cat: Category, path: number[] = []) => (
        <div key={path.join("-")} className="ml-4 mt-2 border-l border-main pl-4 ">
            <input
                type="text"
                value={cat.name}
                onChange={(e) => handleNameChange(path, e.target.value)}
                className="border border-main rounded px-2 py-1 w-64"
            />
            <button type="button" onClick={() => handleAddSubCategory(path)} className="px-2 py-1 text-blue-500 hover:text-blue-700 ml-2">
                <IoMdAddCircle />
            </button>
            {path.length > 0 && (
                <button type="button" onClick={() => handleDeleteSubCategory(path)} className="px-2 py-1 text-red-500 hover:text-red-700 ml-2">
                    <FaTrash />
                </button>
            )}
            {cat.subCategories.map((sub, i) => renderCategory(sub, [...path, i]))}
        </div>
    );

    // -----------------
    // Submit
    // -----------------
    const handleSubmit = async () => {
        setLoading(true);

        try {
            const res = await api.put(`/categories/${formData._id}`, formData);

            if (res.data.success) {
                Swal.fire("Success", "Product category updated!", "success");
                changeProductCategoryKey(); // refetch categories
                onClose();
            }
        } catch (error: unknown) {
            console.log(error);

            if (axios.isAxiosError(error)) {
                Swal.fire("Error", error.response?.data?.message || "Failed to update", "error");
            } else {
                Swal.fire("Error", "Unexpected error", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    // -----------------
    // UI with Animation
    // -----------------
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-50">
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    duration: 0.3,
                }}
                className="bg-main p-6 rounded border border-main"
            >
                <h2 className="text-lg font-bold mb-4">Update Category</h2>
                <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">{renderCategory(formData)}</div>
                <div className="mt-6 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-soft rounded">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
                        {loading ? "Updating..." : "Update"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default UpdateProductCategoryModal;
