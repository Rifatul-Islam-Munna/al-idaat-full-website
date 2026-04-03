"use client";

import SingleImageUploader from "@/components/shared/SingleImageUploader";
import { useAuth } from "@/components/shared/AuthContext";
import { api } from "@/libs/axios";
import { calculateReducedPrice } from "@/libs/utils";
import Image from "next/image";
import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { MdCheckCircle, MdImage, MdInfo, MdLocalOffer, MdSearch } from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

type UploadedImage = {
    url: string;
    id: string;
};

const getErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        const details = error.response?.data?.errors;

        if (Array.isArray(details) && details.length > 0) {
            return details.map((item: { message?: string }) => item.message).filter(Boolean).join(", ");
        }

        return message || error.message;
    }

    return "Failed to save offer banner. Please try again.";
};

const AddOfferBanner = () => {
    const { products, changeOfferBannerKey } = useAuth();

    const [desktopImage, setDesktopImage] = useState<UploadedImage | null>(null);
    const [mobileImage, setMobileImage] = useState<UploadedImage | null>(null);
    const [productId, setProductId] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const selectedProduct = products?.data.find((p) => p._id === productId);
    const filteredProducts = products?.data.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleSaveOfferBanner = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        if (!desktopImage || !mobileImage) {
            Swal.fire({
                icon: "warning",
                title: "Images Missing",
                text: "Please upload both desktop and mobile offer banner images.",
                confirmButtonColor: "#3b82f6",
            });
            return;
        }

        if (!productId) {
            Swal.fire({
                icon: "warning",
                title: "No Product Selected",
                text: "Please select a product to link with this offer banner.",
                confirmButtonColor: "#3b82f6",
            });
            return;
        }

        setIsSaving(true);

        try {
            const result = await api.post("/offers", {
                desktopUrl: desktopImage.url,
                mobileUrl: mobileImage.url,
                productId,
            });

            if (result.data.success) {
                await Swal.fire({
                    icon: "success",
                    title: "Offer Banner Saved!",
                    confirmButtonColor: "#10b981",
                    timer: 1800,
                    showConfirmButton: false,
                });

                setDesktopImage(null);
                setMobileImage(null);
                setProductId("");
                setSearchQuery("");
                changeOfferBannerKey();
            }
        } catch (error) {
            console.error("Save error:", error);
            Swal.fire({
                icon: "error",
                title: "Save Failed",
                text: getErrorMessage(error),
                confirmButtonColor: "#ef4444",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 overflow-y-auto custom-scrollbar h-[calc(100vh-132px)] pr-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Offer Banner Upload</h2>
                <p className="text-gray-600">Upload a desktop and mobile image, then link the banner to a product.</p>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <MdInfo className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-blue-900">Desktop Offer Banner</p>
                            <p className="text-sm text-blue-700 mt-1">Aspect: 5:2</p>
                            <p className="text-sm text-blue-700">Recommended size: 2000 x 800 px</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <MdInfo className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-emerald-900">Mobile Offer Banner</p>
                            <p className="text-sm text-emerald-700 mt-1">Aspect: 4:5</p>
                            <p className="text-sm text-emerald-700">Recommended size: 1200 x 1500 px</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                    <div>
                        <p className="text-lg font-semibold text-gray-800">Desktop Offer Image</p>
                        <p className="text-sm text-gray-500">Shown in the wider homepage offer section on larger screens.</p>
                    </div>

                    {desktopImage ? (
                        <div className="space-y-3">
                            <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                <Image src={desktopImage.url} alt="Desktop offer preview" width={2000} height={800} className="w-full aspect-[5/2] object-cover" />
                            </div>
                            <button onClick={() => setDesktopImage(null)} className="text-sm font-medium text-red-500 hover:text-red-600">
                                Remove desktop selection
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 aspect-[5/2]">
                            <div className="text-center text-gray-400">
                                <MdImage className="mx-auto h-10 w-10 mb-2" />
                                <p className="text-sm">No desktop offer image uploaded yet</p>
                            </div>
                        </div>
                    )}

                    <SingleImageUploader onImageUpload={(image) => setDesktopImage({ url: image.url, id: image._id })} />
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                    <div>
                        <p className="text-lg font-semibold text-gray-800">Mobile Offer Image</p>
                        <p className="text-sm text-gray-500">Shown on phones with a mobile-friendly taller crop.</p>
                    </div>

                    {mobileImage ? (
                        <div className="space-y-3">
                            <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                <Image src={mobileImage.url} alt="Mobile offer preview" width={1200} height={1500} className="w-full aspect-[4/5] object-cover" />
                            </div>
                            <button onClick={() => setMobileImage(null)} className="text-sm font-medium text-red-500 hover:text-red-600">
                                Remove mobile selection
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 aspect-[4/5]">
                            <div className="text-center text-gray-400">
                                <MdImage className="mx-auto h-10 w-10 mb-2" />
                                <p className="text-sm">No mobile offer image uploaded yet</p>
                            </div>
                        </div>
                    )}

                    <SingleImageUploader onImageUpload={(image) => setMobileImage({ url: image.url, id: image._id })} />
                </div>
            </div>

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

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <button
                    onClick={handleSaveOfferBanner}
                    disabled={isSaving || !desktopImage || !mobileImage || !productId}
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
                            Save Responsive Offer Banner
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default AddOfferBanner;
