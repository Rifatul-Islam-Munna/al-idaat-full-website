import { useAuth } from "@/components/shared/AuthContext";
import { api } from "@/libs/axios";
import { formatMongoDate, getLowestLevelCategories } from "@/libs/utils";
import { AxiosError } from "axios";
import Image from "next/image";
import { useState } from "react";
import { LuTrash2 } from "react-icons/lu";
import Swal from "sweetalert2";

const GetCategoryImage = () => {
    const [deletingId, setDeletingId] = useState<string | null>("");

    const { categoryImages, categoryImagesLoading, changeCategoryImagesKey, changeUploedFilesKey, productCategories } = useAuth();

    const categoryImageData = categoryImages?.data;
    const actualLowestLevelProductcategoriesId = getLowestLevelCategories(productCategories).map((ele) => ele._id);

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
                    await api.delete(`/category-images/${id}`);

                    Swal.fire("Deleted!", "Category image has been deleted.", "success");

                    changeCategoryImagesKey();
                    changeUploedFilesKey();
                } catch (err) {
                    const error = err as AxiosError<{ message?: string }>;

                    Swal.fire("Error!", error.response?.data?.message || "Failed to delete image.", "error");
                } finally {
                    setDeletingId(null);
                }
            }
        });
    };

    return (
        <div className="h-[calc(100vh-202px)] overflow-y-auto custom-scrollbar">
            {categoryImagesLoading ? (
                <p className="text-sm text-text_normal animate-pulse h-[calc(100vh-132px)] w-full flex justify-center items-center">
                    Loading Category Images...
                </p>
            ) : categoryImageData?.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-2">
                    <span className="text-text_normal text-sm">No Category Image Added</span>

                    <span className="text-xs text-text_normal/70">Start by adding a category image</span>
                </div>
            ) : (
                <div className="space-y-4">
                    {categoryImageData?.map((ele) => {
                        return (
                            <div
                                key={ele._id}
                                className={`p-1 pr-3 border border-border rounded flex justify-between gap-2 items-center w-full ${actualLowestLevelProductcategoriesId.includes(ele.categoryId) ? "bg-slate-100" : "bg-yellow-400"}`}
                            >
                                {/* Left */}
                                <div className="flex gap-2 items-center">
                                    <Image src={ele.url} width={80} height={80} className="w-20 h-20 rounded" alt="category image" />

                                    <div>
                                        <span className="max-w-87.5 line-clamp-1">{ele.categoryName}</span>

                                        <p className="text-xs text-text_normal">{formatMongoDate(ele.createdAt || "")}</p>
                                    </div>
                                </div>

                                {/* Parent Category */}
                                <div className="min-w-37.5 flex justify-center">
                                    <p className="bg-primary text-text_light px-3 py-1 text-xs font-medium rounded-full">{ele.categoryParentName}</p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4">
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
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default GetCategoryImage;
