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
                const desktopUrl = item.desktopUrl || item.url;
                const mobileUrl = item.mobileUrl || desktopUrl;

                if (!desktopUrl) {
                    return null;
                }

                return (
                    <div key={item._id} className="group relative rounded-xl border border-border bg-white p-4 overflow-hidden">
                        <div className={`grid gap-4 md:grid-cols-2 transition-opacity duration-200 ${isDeleting ? "opacity-50" : "opacity-100"}`}>
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-text_normal/60">Desktop Banner</p>
                                <Image src={desktopUrl} alt="desktop banner" width={1600} height={608} className="w-full aspect-[50/19] rounded-lg object-cover" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-text_normal/60">Mobile Banner</p>
                                <Image src={mobileUrl!} alt="mobile banner" width={1200} height={1500} className="w-full aspect-[4/5] rounded-lg object-cover" />
                            </div>
                        </div>

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
