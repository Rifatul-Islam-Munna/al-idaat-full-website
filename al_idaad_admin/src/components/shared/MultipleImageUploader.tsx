"use client";

import React, { useState, useRef } from "react";
import Swal from "sweetalert2";
import axios, { AxiosError } from "axios";
import { useAuth } from "./AuthContext";
import { api } from "@/libs/axios";

interface IUpload {
    _id: string;
    originalName: string;
    url: string;
    publicId: string;
}

interface MultipleImageUploaderProps {
    onMultipleUpload?: (urls: string[]) => void;
    onUploaded?: (files: IUpload[]) => void;
}

const MultipleImageUploader: React.FC<MultipleImageUploaderProps> = ({ onMultipleUpload, onUploaded }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const { changeUploedFilesKey } = useAuth();

    const handleMultipleUpload = async () => {
        if (!files.length) return;
        const formData = new FormData();
        files.forEach((f) => formData.append("files", f));

        try {
            setLoading(true);
            const res = await api.post<{
                success: boolean;
                data: IUpload[];
            }>("/uploads/multiple", formData);

            Swal.fire("Success", `${res.data.data.length} images uploaded`, "success");

            changeUploedFilesKey();

            if (onMultipleUpload) onMultipleUpload(res.data.data.map((f) => f.url));
            if (onUploaded) onUploaded(res.data.data);

            setFiles([]);
            if (inputRef.current) inputRef.current.value = "";
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const axiosErr = err as AxiosError<{ message: string }>;
                Swal.fire("Error", axiosErr.response?.data?.message || axiosErr.message, "error");
            } else {
                Swal.fire("Error", "An unexpected error occurred", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-main rounded border border-border">
            <label className="block mb-2 text-sm font-medium">Upload New Product Images</label>
            <div className="flex items-center gap-3">
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                    className="block w-full text-sm  
                               file:mr-4 file:py-2 file:px-4
                               file:rounded-lg file:border-0
                               file:text-sm file:font-semibold
                               file:bg-green-50 file:text-green-600
                               hover:file:bg-green-100"
                />
                <button
                    onClick={handleMultipleUpload}
                    disabled={loading || !files.length}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white 
                               hover:bg-green-700 transition disabled:bg-green-300 disabled:cursor-not-allowed!"
                >
                    {loading ? "Uploading..." : "Upload"}
                </button>
            </div>
        </div>
    );
};

export default MultipleImageUploader;
