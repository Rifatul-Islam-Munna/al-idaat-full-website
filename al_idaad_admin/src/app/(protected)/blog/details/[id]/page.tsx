import BlogDetails from "@/components/ui/blog_page/blog/BlogDetails";

const BlogDetailsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    return (
        <div className="h-[calc(100vh-132px)] overflow-y-auto custom-scrollbar">
            <BlogDetails id={id}></BlogDetails>
        </div>
    );
};

export default BlogDetailsPage;
