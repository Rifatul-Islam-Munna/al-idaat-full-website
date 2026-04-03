"use client";

import SingleImageUploader from "@/components/shared/SingleImageUploader";
import { useAuth } from "@/components/shared/AuthContext";
import { api } from "@/libs/axios";
import Image from "next/image";
import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { MdCheckCircle, MdImage, MdInfo } from "react-icons/md";

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

    return "Failed to save banner. Please try again.";
};

const Banner = () => {
    const { changeBannerKey } = useAuth();
    const [desktopImage, setDesktopImage] = useState<UploadedImage | null>(null);
    const [mobileImage, setMobileImage] = useState<UploadedImage | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveBanner = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        if (!desktopImage || !mobileImage) {
            Swal.fire({
                icon: "warning",
                title: "Images Missing",
                text: "Please upload both desktop and mobile banner images.",
                confirmButtonColor: "#3b82f6",
            });
            return;
        }

        setIsSaving(true);

        try {
            const result = await api.post("/banners", {
                desktopUrl: desktopImage.url,
                mobileUrl: mobileImage.url,
            });

            if (result.data.success) {
                await Swal.fire({
                    icon: "success",
                    title: "Banner Saved!",
                    text: "Responsive banner created successfully.",
                    confirmButtonColor: "#10b981",
                    timer: 1800,
                    showConfirmButton: false,
                });

                setDesktopImage(null);
                setMobileImage(null);
                changeBannerKey();
            }
        } catch (error) {
            console.error("Error saving banner:", error);
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
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Banner Upload</h2>
                <p className="text-gray-600">Upload a desktop and a mobile image for each homepage banner slide.</p>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <MdInfo className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-blue-900">Desktop Banner</p>
                            <p className="text-sm text-blue-700 mt-1">Aspect: 50:19</p>
                            <p className="text-sm text-blue-700">Recommended size: 1900 x 722 px</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <MdInfo className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-emerald-900">Mobile Banner</p>
                            <p className="text-sm text-emerald-700 mt-1">Aspect: 4:5</p>
                            <p className="text-sm text-emerald-700">Recommended size: 1200 x 1500 px</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                    <div>
                        <p className="text-lg font-semibold text-gray-800">Desktop Banner Image</p>
                        <p className="text-sm text-gray-500">Used on tablets, laptops, and desktops.</p>
                    </div>

                    {desktopImage ? (
                        <div className="space-y-3">
                            <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                <Image src={desktopImage.url} alt="Desktop banner preview" width={1900} height={722} className="w-full aspect-[50/19] object-cover" />
                            </div>
                            <button onClick={() => setDesktopImage(null)} className="text-sm font-medium text-red-500 hover:text-red-600">
                                Remove desktop selection
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 aspect-[50/19]">
                            <div className="text-center text-gray-400">
                                <MdImage className="mx-auto h-10 w-10 mb-2" />
                                <p className="text-sm">No desktop image uploaded yet</p>
                            </div>
                        </div>
                    )}

                    <SingleImageUploader onImageUpload={(image) => setDesktopImage({ url: image.url, id: image._id })} />
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                    <div>
                        <p className="text-lg font-semibold text-gray-800">Mobile Banner Image</p>
                        <p className="text-sm text-gray-500">Used on phones for a cleaner mobile hero.</p>
                    </div>

                    {mobileImage ? (
                        <div className="space-y-3">
                            <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                <Image src={mobileImage.url} alt="Mobile banner preview" width={1200} height={1500} className="w-full aspect-[4/5] object-cover" />
                            </div>
                            <button onClick={() => setMobileImage(null)} className="text-sm font-medium text-red-500 hover:text-red-600">
                                Remove mobile selection
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 aspect-[4/5]">
                            <div className="text-center text-gray-400">
                                <MdImage className="mx-auto h-10 w-10 mb-2" />
                                <p className="text-sm">No mobile image uploaded yet</p>
                            </div>
                        </div>
                    )}

                    <SingleImageUploader onImageUpload={(image) => setMobileImage({ url: image.url, id: image._id })} />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <button
                    onClick={handleSaveBanner}
                    disabled={isSaving || !desktopImage || !mobileImage}
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
                            Save Responsive Banner
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Banner;
