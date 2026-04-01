import { useAuth } from "@/components/shared/AuthContext";
import { api } from "@/libs/axios";
import { formatMongoDate } from "@/libs/utils";
import { AxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LuSquarePen, LuTrash2 } from "react-icons/lu";
import Swal from "sweetalert2";

const GetBlog = () => {
    const [deletingId, setDeletingId] = useState<string | null>("");
    const router = useRouter();

    const { blog, blogLoading, changeBlogKey, changeUploedFilesKey } = useAuth();

    const blogData = blog?.data;
    const handleDelete = async (id: string) => {
        Swal.fire({
            title: "Are you sure?",
            text: `Delete this item? This cannot be undone.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                setDeletingId(id);
                try {
                    await api.delete(`/blogs/${id}`);
                    Swal.fire("Deleted!", "Blog has been deleted.", "success");

                    changeBlogKey();
                    changeUploedFilesKey();
                } catch (err) {
                    const error = err as AxiosError<{ message?: string }>;
                    Swal.fire("Error!", error.response?.data?.message || "Failed to delete blog.", "error");
                } finally {
                    setDeletingId(null);
                }
            }
        });
    };

    return (
        <div className="h-[calc(100vh-132px)] overflow-y-auto custom-scrollbar">
            {blogLoading ? (
                <p className="text-sm text-text_normal animate-pulse h-[calc(100vh-132px)] w-full flex justify-center items-center">
                    Loading Blogs...
                </p>
            ) : blogData?.length === 0 ? (
                /* Empty State */
                <div className="h-full flex flex-col items-center justify-center text-center gap-2">
                    <span className="text-text_normal text-sm">No Blog Added</span>

                    <span className="text-xs text-text_normal/70">Start by creating your first blog post</span>
                </div>
            ) : (
                <div className="space-y-4">
                    {blogData?.map((ele) => {
                        return (
                            <div
                                key={ele._id}
                                className="p-1 pr-3 bg-slate-100 border border-border rounded flex justify-between gap-2 items-center w-full"
                            >
                                {/* Left */}
                                <div className="flex gap-2 items-center">
                                    <Image
                                        src={ele.thumbnail}
                                        width={100}
                                        height={75}
                                        className="w-25 h-18.75 rounded object-cover"
                                        alt="blog thumbnail"
                                    />

                                    <div>
                                        <Link href={`/blog/details/${ele._id}`}>
                                            <span className="hover:text-blue-400 transition max-w-87.5 line-clamp-1">{ele.title}</span>
                                        </Link>

                                        <p className="text-xs text-text_normal">{formatMongoDate(ele.createdAt)}</p>
                                    </div>
                                </div>

                                {/* Category */}
                                <div className="min-w-37.5 flex justify-center">
                                    <p className="bg-primary text-text_light px-3 py-1 text-xs font-medium rounded-full">{ele.category.name}</p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4">
                                    <button
                                        className="text-brand hover:text-blue-500 transition active:scale-90"
                                        onClick={() => router.push(`/blog/edit/${ele._id}`)}
                                    >
                                        <LuSquarePen size={16} />
                                    </button>

                                    <button
                                        disabled={deletingId === ele._id}
                                        onClick={() => handleDelete(ele._id)}
                                        className="text-red-400 hover:text-red-800 transition"
                                    >
                                        {deletingId === ele._id ? (
                                            <span className="animate-spin border-2 border-red-500 border-t-transparent rounded-full w-4 h-4 inline-block"></span>
                                        ) : (
                                            <LuTrash2 />
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default GetBlog;
