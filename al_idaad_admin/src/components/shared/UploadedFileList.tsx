"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";
import axios, { AxiosError } from "axios";
import Image from "next/image";
import { useAuth } from "./AuthContext";
import { api } from "@/libs/axios";
import { extractImageSources } from "@/libs/utils";

const UploadedFileList: React.FC = () => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [deleting, setDeleting] = useState<boolean>(false); // loading while deleting

    const { uploadedFiles, uploadedFilesLoading, changeUploedFilesKey, blog, products, banner, offerBanner, categoryImages } = useAuth();

    // urls from blog-----------------------
    let imgFromBlog: string[] = [];

    if (blog?.success) {
        const imgFromBlogThumbnail = blog.data.map((ele) => ele.thumbnail);
        const imgFromBlogDescription = blog.data.map((ele) => extractImageSources(ele.description || "")).flat();
        imgFromBlog = [...imgFromBlogThumbnail, ...imgFromBlogDescription];
    }

    //urls from products-----------------------
    let imgFromProducts: string[] = [];

    if (products?.success) {
        const imgFromProductsThumbnail = products.data.map((ele) => ele.thumbnail);
        const productImage = products.data.map((ele) => ele.images).flat();
        imgFromProducts = [...imgFromProductsThumbnail, ...productImage];
    }

    // urls from banners-----------------------
    let imgFromBanner: string[] = [];

    if (banner?.success) {
        imgFromBanner = banner.data.flatMap((ele) => {
            const desktop = ele.desktopUrl || ele.url;
            const mobile = ele.mobileUrl;
            return [desktop, mobile].filter(Boolean) as string[];
        });
    }

    // urls from offer banners-----------------------
    let imgFromOfferBanner: string[] = [];

    if (offerBanner?.success) {
        imgFromOfferBanner = offerBanner.data.flatMap((ele) => {
            const desktop = ele.desktopUrl || ele.url;
            const mobile = ele.mobileUrl;
            return [desktop, mobile].filter(Boolean) as string[];
        });
    }

    // urls from category images-----------------------
    let imgFromCategoryImages: string[] = [];

    if (categoryImages?.success) {
        imgFromCategoryImages = categoryImages.data.map((ele) => ele.url);
    }
    // ===================================================all image urls=================================================
    const allImageUrls = [...new Set([...imgFromBlog, ...imgFromProducts, ...imgFromBanner, ...imgFromOfferBanner, ...imgFromCategoryImages])];

    const handleDeleteMultiple = async () => {
        if (!selectedIds.length) return;
        setDeleting(true);

        try {
            const res = await api.delete<{
                success: boolean;
                message: string;
            }>("/uploads/multiple", { data: { ids: selectedIds } });
            Swal.fire("Deleted", res.data.message, "success");
            changeUploedFilesKey();
            setSelectedIds([]);
        } catch (err) {
            handleAxiosError(err);
        } finally {
            setDeleting(false);
        }
    };

    const handleAxiosError = (err: unknown) => {
        if (axios.isAxiosError(err)) {
            const axiosErr = err as AxiosError<{ message: string }>;
            Swal.fire("Error", axiosErr.response?.data?.message || axiosErr.message, "error");
        } else {
            Swal.fire("Error", "An unexpected error occurred", "error");
        }
    };

    return (
        <div className="relative overflow-y-auto h-[calc(100vh-132px)] custom-scrollbar pr-4">
            <p className="font-bold mb-4 text-lg">Uploaded Files {uploadedFiles.length}</p>

            {/* Loading state while fetching */}
            {uploadedFilesLoading ? (
                <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : uploadedFiles.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {uploadedFiles.map((f) => (
                        <div
                            key={f._id}
                            className={`relative border rounded-lg overflow-hidden ${selectedIds.includes(f._id) ? "ring-2 ring-red-400" : ""} `}
                        >
                            {/* Checkbox overlay */}
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(f._id)}
                                onChange={(e) =>
                                    e.target.checked
                                        ? setSelectedIds((prev) => [...prev, f._id])
                                        : setSelectedIds((prev) => prev.filter((id) => id !== f._id))
                                }
                                className="absolute top-2 left-2 h-4 w-4 text-red-500 bg-white rounded-sm border-gray-300 z-10"
                            />

                            {/* Image Preview */}
                            <a href={f.url} target="_blank" rel="noreferrer">
                                <div className="relative w-full aspect-3/2 bg-soft">
                                    <Image src={f.url} alt={f.originalName} fill className="object-cover" />
                                </div>
                            </a>

                            {/* File name */}
                            <div className={`p-2 text-center text-sm truncate bg-soft ${allImageUrls.includes(f.url) ? "" : "bg-yellow-400!"}`}>
                                {f.originalName}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">No files uploaded yet</p>
            )}

            {selectedIds.length > 0 && (
                <button
                    onClick={handleDeleteMultiple}
                    disabled={deleting}
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition disabled:opacity-50 fixed bottom-4 left-77.5 z-60"
                >
                    {deleting ? "Deleting..." : `Delete Selected (${selectedIds.length})`}
                </button>
            )}
        </div>
    );
};

export default UploadedFileList;
