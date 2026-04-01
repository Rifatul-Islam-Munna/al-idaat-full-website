"use client";

import { useEffect, useState } from "react";
import RichTextEditor from "@/components/shared/rich_text_editor/RichTextEditor";
import Image from "next/image";

import axios, { AxiosError } from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa6";

import SingleImageUploader from "@/components/shared/SingleImageUploader";
import { api } from "@/libs/axios";
import { useAuth } from "@/components/shared/AuthContext";
import BlogCategoryList from "../blog_category/BlogCategoryList";
import GetUrlOfUploadedImage from "@/components/shared/GetUrlOfUploadedImage";

const EditBlog = ({ id }: { id: string }) => {
    const [loading, setLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);

    const [title, setTitle] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [category, setCategory] = useState<{
        _id: string;
        name: string;
    } | null>(null);
    const [description, setDescription] = useState("");

    const router = useRouter();
    const { changeBlogKey, changeUploedFilesKey } = useAuth();

    useEffect(() => {
        const fetchBlogDetails = async () => {
            try {
                const response = await api.get(`/blogs/${id}`);

                if (response.data.success) {
                    const blog = response.data.data;

                    setTitle(blog.title);
                    setCategory(blog.category);
                    setDescription(blog.description);
                    setThumbnail(blog.thumbnail);
                }
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogDetails();
    }, [id]);

    const handleAxiosError = (err: unknown) => {
        if (axios.isAxiosError(err)) {
            const axiosErr = err as AxiosError<{ message: string }>;
            Swal.fire("Error", axiosErr.response?.data?.message || axiosErr.message, "error");
        } else {
            Swal.fire("Error", "An unexpected error occurred", "error");
        }
    };

    const handleUpdateBlog = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = { title, thumbnail, description, category };

        setUpdateLoading(true);

        try {
            const result = await api.put(`/blogs/${id}`, payload);

            if (result.data.success) {
                changeBlogKey();
                changeUploedFilesKey();

                Swal.fire("Success", "Blog Updated Successfully", "success");
            }
        } catch (err) {
            handleAxiosError(err);
        } finally {
            setUpdateLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-132px)] flex items-center justify-center">
                <span className="text-text_normal text-sm animate-pulse">Loading blog editor...</span>
            </div>
        );
    }

    return (
        <div className="flex gap-4">
            <GetUrlOfUploadedImage />

            {/* Updating Overlay */}
            {updateLoading && (
                <div className="fixed inset-0 z-999 bg-black/70 flex items-center justify-center">
                    <span className="text-white font-medium animate-pulse">Updating Blog...</span>
                </div>
            )}

            <div className="max-w-5xl mx-auto bg-bg_main border border-border rounded-xl shadow-sm p-6 h-[calc(100vh-132px)] overflow-y-auto custom-scrollbar">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-text_dark">Edit Blog Post</h2>

                    <button
                        onClick={() => router.push("/blog")}
                        className="flex items-center gap-2 text-sm px-3 py-1.5
                        border border-border rounded-lg
                        hover:bg-slate-100 transition active:scale-95"
                    >
                        <FaArrowLeft size={14} />
                        Back
                    </button>
                </div>

                <form onSubmit={handleUpdateBlog} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block mb-1 text-sm font-medium text-text_normal">Blog Title</label>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter blog title"
                            className="w-full px-3 py-2 rounded border border-border bg-bg_main
                            focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                        />
                    </div>

                    {/* Upload + Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Upload */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-text_normal">Change Thumbnail</label>

                            <SingleImageUploader
                                onImageUpload={(props) => {
                                    setThumbnail(props.url);
                                }}
                            />
                        </div>

                        {/* Preview */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-text_normal">Thumbnail Preview</label>

                            <div
                                className="border border-border rounded-lg overflow-hidden bg-slate-100
                            w-full aspect-3/2 flex items-center justify-center"
                            >
                                {!thumbnail && <span className="text-sm text-text_normal">No image selected</span>}

                                {thumbnail && <Image width={300} height={200} src={thumbnail} alt="Thumbnail" className="w-full aspect-3/2" />}
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
                            className="w-full px-3 py-2 rounded border border-border
                            bg-slate-100 cursor-not-allowed text-sm"
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

                    {/* Footer Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={() => router.push("/blog")}
                            className="px-5 py-2 rounded-lg border border-border
                            hover:bg-slate-100 transition active:scale-95"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary text-text_light rounded-lg
                            hover:bg-selected transition active:scale-95 shadow-sm"
                        >
                            Update Blog
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditBlog;
