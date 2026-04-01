"use client";
import { useAuth } from "@/components/shared/AuthContext";
import { api } from "@/libs/axios";
import { useState, useRef } from "react";
import { MdUpload, MdClose, MdImage, MdCheckCircle, MdInfo } from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Image from "next/image";
import Swal from "sweetalert2";

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

const Banner = () => {
    const { changeUploedFilesKey, changeBannerKey } = useAuth();
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        // Create preview URLs
        const previews: string[] = [];
        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                previews.push(reader.result as string);
                if (previews.length === files.length) {
                    setPreviewImages(previews);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleUpload = async () => {
        const files = fileInputRef.current?.files;
        if (!files || files.length === 0) {
            Swal.fire({
                icon: "warning",
                title: "No Files Selected",
                text: "Please select files first",
                confirmButtonColor: "#3b82f6",
            });
            return;
        }

        setIsUploading(true);
        setUploadSuccess(false);

        try {
            const formData = new FormData();
            Array.from(files).forEach((file) => {
                formData.append("files", file);
            });

            const response = await api.post<UploadResponse>("/uploads/multiple", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.success) {
                const uploaded: UploadedImage[] = response.data.data.map((item) => ({
                    url: item.url,
                    id: item._id,
                }));

                setUploadedImages(uploaded);
                setUploadSuccess(true);
                changeUploedFilesKey();

                // Reset file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }

                Swal.fire({
                    icon: "success",
                    title: "Upload Successful!",
                    text: `${uploaded.length} image${uploaded.length > 1 ? "s" : ""} uploaded successfully`,
                    confirmButtonColor: "#10b981",
                    timer: 1000,
                    showConfirmButton: false,
                });
            }
        } catch (error) {
            console.error("Error uploading images:", error);
            Swal.fire({
                icon: "error",
                title: "Upload Failed",
                text: "Failed to upload images. Please try again.",
                confirmButtonColor: "#ef4444",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemovePreview = (index: number) => {
        const newPreviews = previewImages.filter((_, i) => i !== index);
        setPreviewImages(newPreviews);

        // Also reset file input if no previews left
        if (newPreviews.length === 0 && fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRemoveUploaded = (index: number) => {
        const newUploaded = uploadedImages.filter((_, i) => i !== index);
        setUploadedImages(newUploaded);
    };

    const handleSaveBanner = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        if (uploadedImages.length === 0) {
            Swal.fire({
                icon: "warning",
                title: "No Images",
                text: "Please upload images first",
                confirmButtonColor: "#3b82f6",
            });
            return;
        }

        setIsSaving(true);

        try {
            // Extract URLs from uploaded images and send as array
            const urls = uploadedImages.map((img) => img.url);

            console.log("Saving banner with URLs:", urls);
            const result = await api.post(`/banners`, { urls });

            if (result.data.success) {
                await Swal.fire({
                    icon: "success",
                    title: "Banner Saved!",
                    text: `${result.data.count || urls.length} banner${(result.data.count || urls.length) > 1 ? "s" : ""} created successfully`,
                    confirmButtonColor: "#10b981",
                    timer: 2000,
                    showConfirmButton: false,
                });

                setUploadedImages([]);
                setPreviewImages([]);
                setUploadSuccess(false);
                changeUploedFilesKey();
                changeBannerKey();
            }
        } catch (error) {
            console.error("Error saving banner:", error);
            Swal.fire({
                icon: "error",
                title: "Save Failed",
                text: "Failed to save banner. Please try again.",
                confirmButtonColor: "#ef4444",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className=" space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Banner Upload</h2>
                <p className="text-gray-600">Upload multiple images for your banner</p>

                {/* Image Ratio Notice */}
                <div className="mt-4 flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <MdInfo className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-blue-900">Image Ratio Recommendation</p>
                        <p className="text-sm text-blue-700 mt-1">
                            For best results, please use images with a <strong>50:19 aspect ratio</strong> (e.g., 1900×722)
                        </p>
                    </div>
                </div>
            </div>

            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />

                {/* Upload Button Area */}
                {previewImages.length === 0 && uploadedImages.length === 0 && (
                    <div
                        onClick={triggerFileInput}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                    >
                        <MdUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-700 mb-2">Click to upload images</p>
                        <p className="text-sm text-gray-500">PNG, JPG, WEBP up to 1MB</p>
                        <p className="text-xs text-gray-400 mt-2">Recommended: 50:19 aspect ratio</p>
                    </div>
                )}

                {/* Preview Grid - Before Upload */}
                {previewImages.length > 0 && uploadedImages.length === 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800">Selected Images ({previewImages.length})</h3>
                            <button onClick={triggerFileInput} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                Change Files
                            </button>
                        </div>

                        <div>
                            {previewImages.map((preview, index) => (
                                <div key={index} className="relative group p-1 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                    <Image
                                        width={600}
                                        height={228}
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full aspect-50/19 object-cover"
                                    />
                                    <button
                                        onClick={() => handleRemovePreview(index)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                                    >
                                        <MdClose className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
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
                                    Upload {previewImages.length} Image{previewImages.length > 1 ? "s" : ""}
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Uploaded Images Grid - After Upload */}
                {uploadedImages.length > 0 && (
                    <div className="space-y-4">
                        {uploadSuccess && (
                            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <MdCheckCircle className="h-5 w-5 text-green-600" />
                                <p className="text-green-700 font-medium">Images uploaded successfully!</p>
                            </div>
                        )}

                        <h3 className="text-lg font-semibold text-gray-800">Uploaded Images ({uploadedImages.length})</h3>

                        <div>
                            {uploadedImages.map((image, index) => (
                                <div key={image.id} className="relative group rounded-lg overflow-hidden">
                                    <Image
                                        width={600}
                                        height={228}
                                        src={image.url}
                                        alt={`Uploaded ${index + 1}`}
                                        className="w-full aspect-50/19 object-cover"
                                    />
                                    <button
                                        onClick={() => handleRemoveUploaded(index)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                                    >
                                        <MdClose className="h-4 w-4" />
                                    </button>
                                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <p className="text-white text-xs truncate">Banner</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Save Button */}
            {uploadedImages.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <button
                        onClick={handleSaveBanner}
                        disabled={isSaving || uploadedImages.length === 0}
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
                                Save as Banner
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Empty State */}
            {previewImages.length === 0 && uploadedImages.length === 0 && (
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
                    <MdImage className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-600">No images selected yet</p>
                    <p className="text-sm text-gray-500 mt-1">Click the upload area above to get started</p>
                </div>
            )}
        </div>
    );
};

export default Banner;
