import { formatMongoDate } from "@/utils/helper";
import { BlogType } from "@/utils/types";
import Image from "next/image";
import Link from "next/link";

const BlogCardHome = ({ data }: { data: BlogType }) => {
  if (!data) {
    return (
      <div className="w-[300px] h-[200px] flex items-center justify-center p-4 bg-bg_secondary rounded-xl border border-red-400/20 text-red-400 text-sm font-medium">
        Failed to load blog
      </div>
    );
  }

  const { _id, thumbnail, title, createdAt } = data;

  return (
    <Link href={`/blog/details/${_id}`} className="group block w-[300px]">
      {/* Thumbnail */}
      <div className="w-full aspect-video overflow-hidden rounded-xl bg-bg_secondary">
        <Image
          src={thumbnail}
          width={300}
          height={169}
          alt={title}
          className="w-full h-full object-cover aspect-video transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="mt-3 px-1 space-y-1">
        <p className="text-base font-semibold leading-snug line-clamp-2 group-hover:text-blue-400 transition-colors duration-200">
          {title}
        </p>
        <p className="text-xs text-text_normal font-medium">
          {formatMongoDate(createdAt)}
        </p>
      </div>
    </Link>
  );
};

export default BlogCardHome;
