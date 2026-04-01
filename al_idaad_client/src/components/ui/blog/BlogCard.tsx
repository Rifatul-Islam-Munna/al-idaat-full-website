import { formatMongoDate } from "@/utils/helper";
import { BlogType } from "@/utils/types";
import Image from "next/image";
import Link from "next/link";

const BlogCard = ({ data }: { data: BlogType }) => {
    if (!data) {
        return <div className="text-red-400 w-75 h-50 flex items-center justify-center p-4 bg-bg_secondary rounded">Error in Loading Blog</div>;
    }
    const { _id, thumbnail, title, createdAt } = data;
    return (
        <Link href={`/blog/details/${_id}`}>
            <div className="w-[calc(50vw-30px)] md:w-75">
                <div className="w-[calc(50vw-30px)] h-[27vw] md:w-75 md:h-50 overflow-hidden">
                    <Image
                        src={thumbnail}
                        width={300}
                        height={200}
                        alt="al idaad blog"
                        className="w-[calc(50vw-30px)] h-[27vw] md:w-75 md:h-50 rounded hover:scale-110 transition duration-500"
                    ></Image>
                </div>
                <p className="text-[14px] sm:text-[16px] lg:text-xl font-semibold line-clamp-3 sm:line-clamp-2 mt-2 px-1 hover:text-blue-400 duration-150">
                    {title}
                </p>
                <p className="text-xs sm:text-sm text-text_normal font-semibold px-1">{formatMongoDate(createdAt)}</p>
            </div>
        </Link>
    );
};

export default BlogCard;
