import GetBlog from "./GetBlog";
import PostBlog from "./PostBlog";

const BlogContainer = () => {
    return (
        <div className="flex gap-4">
            <div className="flex-1">
                <PostBlog></PostBlog>
            </div>
            <div className="flex-1">
                <GetBlog></GetBlog>
            </div>
        </div>
    );
};

export default BlogContainer;
