import { api } from "@/libs/axios";
import axios from "axios";
import { useState, useRef } from "react";
import Swal from "sweetalert2";
import { useAuth } from "./AuthContext";

interface SingleImageUploaderProps {
    onImageUpload: ({ _id, originalName, url, publicId }: { _id: string; originalName: string; url: string; publicId: string }) => void;
}

const SingleImageUploader = ({ onImageUpload }: SingleImageUploaderProps) => {
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
                Swal.fire({
                    icon: "success",
                    title: "Done",
                    text: "Uploaded succesfully",
                    timer: 1000,
                    showConfirmButton: false,
                });
                changeUploedFilesKey();
            }
            onImageUpload(res.data.data);

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
            {/* <label className="block mb-2 text-sm font-medium">Thumbnail (Single Image)</label> */}
            <div className="flex items-center gap-3">
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png, image/webp"
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

export default SingleImageUploader;
