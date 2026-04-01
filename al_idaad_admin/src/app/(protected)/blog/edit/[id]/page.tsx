import EditBlog from "@/components/ui/blog_page/blog/EditBlog";

const BlogDetailsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    return (
        <div className="h-[calc(100vh-132px)] overflow-y-auto">
            <EditBlog id={id}></EditBlog>
        </div>
    );
};

export default BlogDetailsPage;
