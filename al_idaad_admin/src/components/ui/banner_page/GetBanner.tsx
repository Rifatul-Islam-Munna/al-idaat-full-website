"use client";

import { useState } from "react";
import { useAuth } from "@/components/shared/AuthContext";
import { api } from "@/libs/axios";
import Image from "next/image";
import Swal from "sweetalert2";
import { LuTrash2 } from "react-icons/lu";

const GetBanner = () => {
    const { banner, changeUploedFilesKey, changeBannerKey } = useAuth();

    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        try {
            setDeletingId(id);

            const result = await api.delete(`/banners/${id}`);

            if (result.status === 204) {
                changeUploedFilesKey();
                changeBannerKey();

                await Swal.fire({
                    icon: "success",
                    title: "Banner deleted",
                    showConfirmButton: false,
                    timer: 1500,
                });
            }
        } catch (error) {
            console.error("Error deleting banner:", error);

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

    return (
        <div className="space-y-4">
            {banner?.data.map((item) => {
                const isDeleting = deletingId === item._id;

                return (
                    <div key={item._id} className="group relative p-1 border border-border overflow-hidden">
                        <Image
                            src={item.url}
                            alt="banner"
                            width={1600}
                            height={900}
                            className={`w-full h-auto transition-opacity duration-200 ${isDeleting ? "opacity-50" : "opacity-100"}`}
                        />

                        {/* Delete Button (show on hover) */}
                        <button
                            onClick={() => handleDelete(item._id)}
                            disabled={isDeleting}
                            className={`
                                absolute top-2 right-2
                                bg-red-500 text-white p-2 rounded-full
                                transition-all duration-200
                                opacity-0 group-hover:opacity-100
                                hover:bg-red-600
                                disabled:cursor-not-allowed
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
    );
};

export default GetBanner;
