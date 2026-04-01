"use client";
import { useState, useRef } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { api } from "@/libs/axios";

const GetUrlOfUploadedImage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const { changeUploedFilesKey } = useAuth();

    const handleUpload = async () => {
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            const res = await api.post<{
                success: boolean;
                data: { _id: string; originalName: string; url: string; publicId: string };
            }>("/uploads/single", formData);

            if (res.data.success) {
                changeUploedFilesKey();
                const imageUrl = res.data.data.url;

                Swal.fire({
                    title: "Upload Successful 🎉",
                    html: `
            <div style="display:flex; flex-direction:column; align-items:center; gap:12px;">
              <img src="${imageUrl}" alt="Uploaded Image" style="width:180px; height:auto; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.15)" />
              <div style="word-break:break-all; font-size:12px; color:#333; background:#f7f7f7; padding:6px 8px; border-radius:4px; max-width:250px;">
                ${imageUrl}
              </div>
              <button id="copyUrlBtn" style="
                background:#2563eb; 
                color:white; 
                border:none; 
                border-radius:6px; 
                padding:8px 14px; 
                font-weight:600;
                cursor:pointer;">
                Copy URL
              </button>
            </div>
          `,
                    showConfirmButton: false,
                    didOpen: () => {
                        const btn = document.getElementById("copyUrlBtn");
                        if (btn) {
                            btn.addEventListener("click", () => {
                                navigator.clipboard.writeText(imageUrl);
                                Swal.fire({
                                    icon: "success",
                                    title: "Copied",
                                    timer: 1000,
                                    showConfirmButton: false,
                                });
                            });
                        }
                    },
                });
            }

            setFile(null);
            if (inputRef.current) inputRef.current.value = "";
        } catch (err) {
            if (axios.isAxiosError(err)) {
                Swal.fire("Error", err.response?.data?.message || err.message, "error");
            } else {
                Swal.fire("Error", "An unexpected error occurred", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-6">
            <label className="block mb-2 text-sm font-medium">Upload Image</label>
            <div className="flex items-center gap-3">
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="block w-full text-sm  
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-lg file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-600
                     hover:file:bg-blue-100"
                />
                <button
                    onClick={handleUpload}
                    disabled={loading || !file}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white 
                     hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed!"
                >
                    {loading ? "Uploading..." : "Upload"}
                </button>
            </div>
        </div>
    );
};

export default GetUrlOfUploadedImage;
