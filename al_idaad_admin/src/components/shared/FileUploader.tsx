"use client";

import { useRef, useState, forwardRef, useImperativeHandle } from "react";
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

interface FileUploaderProps {
    onSingleUpload?: (url: string) => void;
    onMultipleUpload?: (urls: string[]) => void;
    onUploaded?: (files: IUpload[]) => void;
}

const FileUploader = forwardRef<{ reset: () => void }, FileUploaderProps>(({ onSingleUpload, onMultipleUpload, onUploaded }, ref) => {
    const [file, setFile] = useState<File | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [singleLoading, setSingleLoading] = useState<boolean>(false);
    const [multipleLoading, setMultipleLoading] = useState<boolean>(false);

    const singleInputRef = useRef<HTMLInputElement | null>(null);
    const multipleInputRef = useRef<HTMLInputElement | null>(null);

    // Expose reset function to parent via ref
    useImperativeHandle(ref, () => ({
        reset: () => {
            setFile(null);
            setFiles([]);
            if (singleInputRef.current) singleInputRef.current.value = "";
            if (multipleInputRef.current) multipleInputRef.current.value = "";
        },
    }));

    const { changeUploedFilesKey } = useAuth();

    const handleSingleUpload = async () => {
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);

        try {
            setSingleLoading(true);
            const res = await api.post<{
                success: boolean;
                data: IUpload;
            }>("/uploads/single", formData);

            Swal.fire({
                icon: "success",
                title: "Done",
                text: "Uploaded succesfully",
                timer: 1000,
                showConfirmButton: false,
            });

            if (onSingleUpload) onSingleUpload(res.data.data.url);
            if (onUploaded) onUploaded([res.data.data]);

            changeUploedFilesKey();
        } catch (err) {
            handleAxiosError(err);
        } finally {
            setSingleLoading(false);
        }
    };

    const handleMultipleUpload = async () => {
        if (!files.length) return;
        const formData = new FormData();
        files.forEach((f) => formData.append("files", f));

        try {
            setMultipleLoading(true);
            const res = await api.post<{
                success: boolean;
                data: IUpload[];
            }>("/uploads/multiple", formData);
            Swal.fire({
                icon: "success",
                title: "Done",
                text: `${res.data.data.length} files uploaded`,
                timer: 1000,
                showConfirmButton: false,
            });

            if (onMultipleUpload) onMultipleUpload(res.data.data.map((f) => f.url));
            if (onUploaded) onUploaded(res.data.data);

            changeUploedFilesKey();
        } catch (err) {
            handleAxiosError(err);
        } finally {
            setMultipleLoading(false);
        }
    };

    const handleAxiosError = (err: unknown) => {
        if (axios.isAxiosError(err)) {
            const axiosErr = err as AxiosError<{ message: string }>;
            Swal.fire("Error", axiosErr.response?.data?.message || axiosErr.message, "error");
        } else {
            Swal.fire("Error", "An unexpected error occurred", "error");
        }
    };

    return (
        <div className="p-6 bg-main rounded-lg border border-border">
            <h2 className="font-semibold text-lg mb-4 ">Upload Files</h2>

            {/* Single File */}
            <div className="mb-6">
                <label className="block mb-2 text-sm font-medium ">Thumbnail (Single Upload)</label>
                <div className="flex items-center gap-3">
                    <input
                        ref={singleInputRef}
                        type="file"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        className="block w-full text-sm  
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-lg file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-600
                                    hover:file:bg-blue-100"
                    />
                    <button
                        onClick={handleSingleUpload}
                        disabled={singleLoading}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white 
                                    hover:bg-blue-700 transition disabled:bg-blue-300"
                    >
                        {singleLoading ? "Uploading..." : "Upload"}
                    </button>
                </div>
            </div>

            {/* Multiple Files */}
            <div>
                <label className="block mb-2 text-sm font-medium ">Product Images (Multiple Upload)</label>
                <div className="flex items-center gap-3">
                    <input
                        ref={multipleInputRef}
                        type="file"
                        multiple
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
                        disabled={multipleLoading}
                        className="px-4 py-2 rounded-lg bg-green-600 text-white 
                                    hover:bg-green-700 transition disabled:bg-green-300"
                    >
                        {multipleLoading ? "Uploading..." : "Upload"}
                    </button>
                </div>
            </div>
        </div>
    );
});

FileUploader.displayName = "FileUploader";

export default FileUploader;
