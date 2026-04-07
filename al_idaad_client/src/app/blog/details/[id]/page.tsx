import { getBlogs } from "@/utils/fetchData";
import { formatMongoDate } from "@/utils/helper";
import { BlogType, GetSingleBlogResponseType } from "@/utils/types";
import Image from "next/image";
import Link from "next/link";

import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const blog = await getSingleBlog(id);

    if (!blog) {
        return {
            title: "Blog Not Found",
        };
    }

    return {
        title: blog.title,
        description: blog.description.replace(/<[^>]*>?/gm, "").slice(0, 160),

        keywords: [blog.title, blog.category?.name, "Islamic Fashion blog", "Al Idaad blog"],

        openGraph: {
            title: blog.title,
            description: blog.description,
            images: [
                {
                    url: blog.thumbnail,
                },
            ],
        },
    };
}

export const revalidate = 1;

async function getSingleBlog(id: string): Promise<BlogType> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${id}`, {
        next: { revalidate: 1 },
    });

    if (!res) {
        throw new Error("Failed to fetch blog");
    }

    const data: GetSingleBlogResponseType = await res.json();
    return data.data;
}

const BlogDetailsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const blog = await getSingleBlog(id);
    const allBlog = await getBlogs();

    if (!blog) {
        return <div>error</div>;
    }
    const { title, description, category, createdAt, thumbnail } = blog as BlogType;

    return (
        <div className="max-w-5xl xl:max-w-7xl mx-auto py-20 px-4 lg:flex lg:justify-between">
            <div className="space-y-3 border-r border-border pr-8 max-w-60 xl:max-w-80 hidden lg:block">
                <p className="font-bold">All Blogs</p>
                {allBlog.map((ele) => (
                    <p
                        key={ele._id}
                        className={` ${title === ele.title ? "text-brand" : "text-text_normal hover:underline transition duration-150"}`}
                    >
                        <Link href={`/blog/details/${ele._id}`}>{ele.title}</Link>
                    </p>
                ))}
            </div>
            <div className="max-w-200 mx-auto lg:mx-0 lg:max-w-180 xl:max-w-200 space-y-4">
                <h1 className="text-3xl font-bold text-main">{title}</h1>

                <div className="flex flex-wrap justify-between items-center">
                    <p>{formatMongoDate(createdAt)}</p>
                    <p className="text-brand">{category.name}</p>
                </div>

                <div className="w-full lg:w-200 xl:w-200 aspect-3/2 relative rounded overflow-hidden">
                    <Image src={thumbnail} alt={title} fill className="w-full aspect-3/2" />
                </div>
                <div dangerouslySetInnerHTML={{ __html: description }} className="text-soft ProseMirror" />
            </div>
        </div>
    );
};
export default BlogDetailsPage;
