"use client";

import { useAuth } from "@/components/shared/AuthContext";
import { api } from "@/libs/axios";
import Image from "next/image";
import { useState } from "react";
import { LuTrash2 } from "react-icons/lu";
import Swal from "sweetalert2";

const GetOfferBanner = () => {
    const { offerBanner, offerBannerLoading, changeOfferBannerKey, changeUploedFilesKey } = useAuth();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        try {
            setDeletingId(id);

            const result = await api.delete(`/offers/${id}`);

            if (result.status === 204) {
                changeUploedFilesKey();
                changeOfferBannerKey();

                await Swal.fire({
                    icon: "success",
                    title: "Banner deleted",
                    showConfirmButton: false,
                    timer: 1500,
                });
            }
        } catch (error) {
            console.error("Error deleting offer banner:", error);

            Swal.fire({
                icon: "error",
                title: "Delete failed",
                text: "Something went wrong",
                timer: 1500,
                showConfirmButton: false,
            });
        } finally {
            setDeletingId(null);
        }
    };

    if (offerBannerLoading) {
        return <div className="h-[calc(100vh-132px)] w-full flex items-center justify-center">Loading images........</div>;
    }

    if (offerBannerLoading) {
        return <div className="h-[calc(100vh-132px)] w-full flex items-center justify-center">Loading images........</div>;
    }

    // ✅ Empty state
    if (!offerBanner?.data?.length) {
        return (
            <div className="h-[calc(100vh-132px)] w-full flex flex-col items-center justify-center text-gray-400">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-circle-off-icon lucide-circle-off"
                >
                    <path d="m2 2 20 20" />
                    <path d="M8.35 2.69A10 10 0 0 1 21.3 15.65" />
                    <path d="M19.08 19.08A10 10 0 1 1 4.92 4.92" />
                </svg>{" "}
                <p className="text-lg font-medium">No offer banners yet</p>
                <p className="text-sm">Uploaded banners will appear here</p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-132px)] overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
                {offerBanner?.data.map((ele) => {
                    const isDeleting = deletingId === ele._id;

                    return (
                        // ✅ Added `group` class so group-hover works on children
                        <div key={ele._id} className="relative group">
                            <Image src={ele.url} alt="Preview" width={800} height={320} className="w-full aspect-5/2" />

                            <button
                                onClick={() => handleDelete(ele._id)}
                                disabled={isDeleting}
                                className={`
                                    absolute top-2 right-2
                                    bg-red-500 text-white p-2 rounded-full
                                    transition-all duration-200
                                    opacity-0 group-hover:opacity-100
                                    hover:bg-red-600
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                            >
                                {isDeleting ? (
                                    <span className="block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <LuTrash2 className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GetOfferBanner;
