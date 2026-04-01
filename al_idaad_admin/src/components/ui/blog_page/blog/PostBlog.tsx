import RichTextEditor from "@/components/shared/rich_text_editor/RichTextEditor";
import React, { useState, useRef } from "react";
import Swal from "sweetalert2";

import Image from "next/image";
import SingleImageUploader from "@/components/shared/SingleImageUploader";
import axios, { AxiosError } from "axios";
import { FaCircleXmark } from "react-icons/fa6";
import { useAuth } from "@/components/shared/AuthContext";
import { api } from "@/libs/axios";
import BlogCategoryList from "../blog_category/BlogCategoryList";
import GetUrlOfUploadedImage from "@/components/shared/GetUrlOfUploadedImage";

const PostBlog = () => {
    const [title, setTitle] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [category, setCategory] = useState<{
        _id: string;
        name: string;
    } | null>(null);
    const [description, setDescription] = useState("");

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [deleting, setDeleting] = useState<boolean>(false);

    const fileUploaderRef = useRef<{ reset: () => void }>(null);

    const { changeBlogKey, changeUploedFilesKey } = useAuth();

    const handlePostBlog = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = { title, thumbnail, description, category };

        try {
            const result = await api.post(`/blogs`, payload);
            if (result.data.success) {
                Swal.fire("Success", "Blog Posted Successfully", "success");

                setTitle("");
                setThumbnail("");
                setCategory(null);
                setDescription("");

                fileUploaderRef.current?.reset();
            }
            changeBlogKey();
        } catch {
            Swal.fire("Error", "Failed to post blog", "error");
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

    const handleDeleteMultiple = async () => {
        if (!selectedIds.length) return;
        setDeleting(true);

        try {
            const res = await api.delete("/uploads/multiple", {
                data: { ids: selectedIds },
            });

            if (res.data.success) {
                Swal.fire("Deleted", res.data.message, "success");
                setSelectedIds([]);
                setThumbnail("");
                changeUploedFilesKey();
            }
        } catch (err) {
            handleAxiosError(err);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="h-[calc(100vh-202px)] overflow-y-auto px-4 py-6 custom-scrollbar">
            <GetUrlOfUploadedImage />

            <div className="max-w-5xl mx-auto bg-bg_main border border-border rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-text_dark mb-6">Create New Blog Post</h2>

                <form onSubmit={handlePostBlog} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-text_normal">Blog Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter blog title"
                            className="w-full px-3 py-2 rounded border border-border bg-slate-100
                            focus:outline-none focus:ring-2 focus:ring-primary/20
                            transition"
                        />
                    </div>

                    {/* Upload Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Upload */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-text_normal">
                                Upload Thumbnail <br /> <span className="text-green-700">(recommended raio : 16:9)</span>{" "}
                            </label>

                            <SingleImageUploader
                                onImageUpload={(props) => {
                                    setThumbnail(props.url);
                                    setSelectedIds([props._id]);
                                }}
                            />
                        </div>

                        {/* Preview */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-text_normal">Thumbnail Preview</label>

                            <div className="relative border border-border rounded-lg overflow-hidden bg-slate-100 w-full aspect-3/2 flex items-center justify-center">
                                {!thumbnail && <span className="text-sm text-text_normal">No image selected</span>}

                                {thumbnail && !deleting && (
                                    <Image width={400} height={267} src={thumbnail} alt="Thumbnail" className="w-full aspect-3/2 object-cover" />
                                )}

                                {deleting && <span className="animate-spin border-2 border-primary border-t-transparent rounded-full w-5 h-5" />}

                                {thumbnail && (
                                    <button
                                        type="button"
                                        onClick={handleDeleteMultiple}
                                        disabled={deleting}
                                        className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow
                                        text-red-500 hover:text-red-700 transition active:scale-90"
                                    >
                                        <FaCircleXmark size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Image URL */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-text_normal">Image URL</label>
                        <input
                            type="text"
                            value={thumbnail}
                            readOnly
                            placeholder="Image url will appear here"
                            className="w-full px-3 py-2 rounded border border-border bg-slate-100
                            cursor-not-allowed text-sm"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-text_normal">Blog Category</label>

                        <BlogCategoryList value={category} onChange={(selectedCategory) => setCategory(selectedCategory)} />
                    </div>

                    {/* Editor */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-text_normal">Blog Content</label>

                        <div className="border border-border rounded-lg overflow-hidden">
                            <RichTextEditor content={description} onChange={(content) => setDescription(content)} />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end pt-4 border-t border-border">
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-primary text-text_light rounded-lg
                            hover:bg-selected transition active:scale-95
                            shadow-sm"
                        >
                            Publish Blog
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostBlog;
