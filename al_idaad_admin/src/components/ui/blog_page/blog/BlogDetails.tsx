"use client";

import { api } from "@/libs/axios";
import { BlogType, SingleBlogResponseType } from "@/libs/types";
import { formatMongoDate, processImageHTML } from "@/libs/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";

const BlogDetails = ({ id }: { id: string }) => {
    const [blogDetails, setBlogDetails] = useState<SingleBlogResponseType | null>(null);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchlogDetails = async () => {
            try {
                const response = await api.get(`/blogs/${id}`);
                if (response.data.success) {
                    setBlogDetails(response.data);
                    setLoading(false);
                }
            } catch (err) {
                console.log(err);
            }
        };
        fetchlogDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="h-[calc(100vh-100px)] fixed left-75 right-0 top-25 flex justify-center items-center">
                <p>Loading Blog Details...</p>
            </div>
        );
    }

    const { title, description, category, createdAt, thumbnail } = blogDetails?.data as BlogType;

    return (
        <div className="px-4 pt-4 relative">
            <div className="max-w-200 mx-auto space-y-4">
                <p className="text-3xl font-bold text-main">{title}</p>
                <div className="flex justify-between items-center">
                    <p>Written on : {formatMongoDate(createdAt)}</p>
                    <p>Category : {category.name}</p>
                </div>
                <Image src={thumbnail} alt="blog banner image" width={800} height={533} className="aspect-3/2 w-200 rounded"></Image>
                <div
                    dangerouslySetInnerHTML={{
                        __html: description ? processImageHTML(description) : "",
                    }}
                    className="text-soft ProseMirror"
                />
            </div>
            <div className="flex justify-center gap-4 pt-4 pb-2 bg-white sticky bottom-0">
                <button
                    onClick={() => router.push(`/blog`)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-text_light rounded active:scale-90 transition hover:bg-brand-soft"
                >
                    <FaArrowLeft />
                    <span>Go back</span>
                </button>
                <button
                    onClick={() => router.push(`/blog/edit/${id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-text_light rounded active:scale-90 transition hover:bg-brand-soft"
                >
                    Edit
                </button>
            </div>
        </div>
    );
};

export default BlogDetails;
