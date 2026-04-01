"use client";

import { useAuth } from "@/components/shared/AuthContext";
import { api } from "@/libs/axios";
import { calculateReducedPrice } from "@/libs/utils";
import Image from "next/image";
import { useRef, useState } from "react";
import Swal from "sweetalert2";
import { MdUpload, MdClose, MdImage, MdCheckCircle, MdInfo, MdLocalOffer, MdSearch } from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface UploadedImage {
    url: string;
    id: string;
}

interface UploadResponse {
    success: boolean;
    data: Array<{
        _id: string;
        url: string;
        originalName: string;
        publicId: string;
    }>;
}

const AddOfferBanner = () => {
    const { products, changeUploedFilesKey, changeOfferBannerKey } = useAuth();

    // Upload states
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Save states
    const [productId, setProductId] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const selectedProduct = products?.data.find((p) => p._id === productId);
    const filteredProducts = products?.data.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    // ─── File Select ───────────────────────────────────────────────
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setPreviewImage(reader.result as string);
        reader.readAsDataURL(file);
    };

    const triggerFileInput = () => fileInputRef.current?.click();

    // ─── Upload ────────────────────────────────────────────────────
    const handleUpload = async () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file) {
            Swal.fire({
                icon: "warning",
                title: "No File Selected",
                text: "Please select a file first",
                confirmButtonColor: "#3b82f6",
            });
            return;
        }

        setIsUploading(true);
        setUploadSuccess(false);

        try {
            const formData = new FormData();
            formData.append("files", file);

            const response = await api.post<UploadResponse>("/uploads/multiple", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.data.success) {
                const item = response.data.data[0];
                setUploadedImage({ url: item.url, id: item._id });
                setUploadSuccess(true);
                if (fileInputRef.current) fileInputRef.current.value = "";

                Swal.fire({
                    icon: "success",
                    title: "Upload Successful!",
                    text: "Offer banner image uploaded successfully",
                    confirmButtonColor: "#10b981",
                    timer: 2000,
                    showConfirmButton: false,
                });
                changeUploedFilesKey();
            }
        } catch (error) {
            console.error("Upload error:", error);
            Swal.fire({
                icon: "error",
                title: "Upload Failed",
                text: "Failed to upload image. Please try again.",
                confirmButtonColor: "#ef4444",
            });
        } finally {
            setIsUploading(false);
        }
    };

    // ─── Remove ────────────────────────────────────────────────────
    const handleRemovePreview = () => {
        setPreviewImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleRemoveUploaded = () => {
        setUploadedImage(null);
        setUploadSuccess(false);
    };

    // ─── Save ──────────────────────────────────────────────────────
    const handleSaveOfferBanner = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        if (!uploadedImage) {
            Swal.fire({
                icon: "warning",
                title: "No Image",
                text: "Please upload a banner image first",
                confirmButtonColor: "#3b82f6",
            });
            return;
        }
        if (!productId) {
            Swal.fire({
                icon: "warning",
                title: "No Product Selected",
                text: "Please select a product to link with this offer banner",
                confirmButtonColor: "#3b82f6",
            });
            return;
        }

        setIsSaving(true);
        try {
            const result = await api.post("/offers", {
                url: uploadedImage.url,
                productId,
            });

            if (result.data.success) {
                await Swal.fire({
                    icon: "success",
                    title: "Offer Banner Saved!",
                    confirmButtonColor: "#10b981",
                    timer: 2000,
                    showConfirmButton: false,
                });

                // Reset everything
                setUploadedImage(null);
                setPreviewImage(null);
                setUploadSuccess(false);
                setProductId("");
                setSearchQuery("");

                // refresh
                changeOfferBannerKey();
            }
        } catch (error) {
            console.error("Save error:", error);
            Swal.fire({
                icon: "error",
                title: "Save Failed",
                text: "Failed to save offer banner. Please try again.",
                confirmButtonColor: "#ef4444",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 overflow-y-auto custom-scrollbar h-[calc(100vh-132px)] pr-2">
            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Offer Banner Upload</h2>
                <p className="text-gray-600">Upload a banner image and link it to a product</p>

                <div className="mt-4 flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <MdInfo className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-blue-900">Image Ratio Recommendation</p>
                        <p className="text-sm text-blue-700 mt-1">
                            For best results, please use images with a <strong>5:3 aspect ratio</strong> (e.g., 1920×1152)
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Upload Section ──────────────────────────────────────── */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

                {/* Empty dropzone */}
                {!previewImage && !uploadedImage && (
                    <div
                        onClick={triggerFileInput}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                    >
                        <MdUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-700 mb-2">Click to upload offer banner</p>
                        <p className="text-sm text-gray-500">PNG, JPG, WEBP up to 1 MB</p>
                        <p className="text-xs text-gray-400 mt-2">Recommended: 5:3 aspect ratio</p>
                    </div>
                )}

                {/* Preview — before upload */}
                {previewImage && !uploadedImage && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800">Selected Image</h3>
                            <button onClick={triggerFileInput} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                Change File
                            </button>
                        </div>

                        <div className="relative group aspect-5/3 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                            <Image src={previewImage} alt="Preview" fill className=" w-full aspect-5/3" />
                            <button
                                onClick={handleRemovePreview}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                            >
                                <MdClose className="h-4 w-4" />
                            </button>
                        </div>

                        <button
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            {isUploading ? (
                                <>
                                    <AiOutlineLoading3Quarters className="h-5 w-5 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <MdUpload className="h-5 w-5" />
                                    Upload Image
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Uploaded image — after upload */}
                {uploadedImage && (
                    <div className="space-y-4">
                        {uploadSuccess && (
                            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <MdCheckCircle className="h-5 w-5 text-green-600" />
                                <p className="text-green-700 font-medium">Image uploaded successfully!</p>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800">Uploaded Image</h3>
                            <button onClick={handleRemoveUploaded} className="text-sm text-red-500 hover:text-red-600 font-medium">
                                Remove
                            </button>
                        </div>

                        <div className="relative group aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shadow-sm">
                            <Image src={uploadedImage.url} alt="Uploaded offer banner" fill className="object-cover" />
                            <button
                                onClick={handleRemoveUploaded}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                            >
                                <MdClose className="h-4 w-4" />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <p className="text-white text-xs">Offer Banner</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Product Selection ───────────────────────────────────── */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <MdLocalOffer className="h-5 w-5 text-gray-500" />
                        Select Product
                    </h3>
                    {selectedProduct && (
                        <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                            <MdCheckCircle className="h-4 w-4" />
                            {selectedProduct.name}
                        </span>
                    )}
                </div>

                {/* Search */}
                <div className="relative">
                    <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                </div>

                {/* Products grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto pr-1">
                    {filteredProducts?.map((product) => (
                        <div
                            key={product._id}
                            onClick={() => setProductId(product._id)}
                            className={`relative group border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                productId === product._id
                                    ? "border-green-500 bg-green-50 shadow-sm"
                                    : "border-gray-200 hover:border-blue-300 bg-white"
                            }`}
                        >
                            {productId === product._id && (
                                <div className="absolute top-2 right-2 z-10">
                                    <MdCheckCircle className="h-5 w-5 text-green-500" />
                                </div>
                            )}

                            <div className="relative w-full aspect-square rounded-md overflow-hidden bg-gray-100 mb-2">
                                <Image src={product.thumbnail} alt={product.name} fill className="object-cover" />
                            </div>

                            <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>

                            <div className="mt-1 flex items-center gap-2 flex-wrap">
                                {product.discountPercentage ? (
                                    <>
                                        <span className="text-sm font-bold text-green-600">
                                            ${calculateReducedPrice(product.price, product.discountPercentage)}
                                        </span>
                                        <span className="text-xs text-gray-400 line-through">${product.price}</span>
                                        <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
                                            -{product.discountPercentage}%
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-sm font-bold text-gray-700">${product.price}</span>
                                )}
                            </div>
                        </div>
                    ))}

                    {filteredProducts?.length === 0 && (
                        <div className="col-span-4 py-8 text-center text-gray-500">
                            <MdSearch className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                            <p>No products found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Save Button ─────────────────────────────────────────── */}
            {uploadedImage && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <button
                        onClick={handleSaveOfferBanner}
                        disabled={isSaving || !uploadedImage || !productId}
                        className="w-full py-3 px-6 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2 text-lg"
                    >
                        {isSaving ? (
                            <>
                                <AiOutlineLoading3Quarters className="h-5 w-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <MdCheckCircle className="h-5 w-5" />
                                Save Offer Banner
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* ── Empty State ─────────────────────────────────────────── */}
            {!previewImage && !uploadedImage && (
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
                    <MdImage className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-600">No image selected yet</p>
                    <p className="text-sm text-gray-500 mt-1">Click the upload area above to get started</p>
                </div>
            )}
        </div>
    );
};

export default AddOfferBanner;
