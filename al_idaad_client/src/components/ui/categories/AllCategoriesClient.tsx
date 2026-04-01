"use client";
import { getLowestSubCategories } from "@/utils/helper";
import { CategoryType } from "@/utils/types";
import Link from "next/link";

const palettes = [
    { bg: "#EEF2FF", text: "#4338CA", dot: "#818CF8" },
    { bg: "#F0FDF4", text: "#15803D", dot: "#4ADE80" },
    { bg: "#FDF4FF", text: "#9333EA", dot: "#D946EF" },
    { bg: "#FFF1F2", text: "#BE123C", dot: "#FB7185" },
    { bg: "#FFFBEB", text: "#B45309", dot: "#FCD34D" },
    { bg: "#F0F9FF", text: "#0369A1", dot: "#38BDF8" },
    { bg: "#F0FDFA", text: "#0F766E", dot: "#2DD4BF" },
    { bg: "#FFF7ED", text: "#C2410C", dot: "#FB923C" },
];

const getPalette = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return palettes[Math.abs(hash) % palettes.length];
};

const AllCategoriesClient = ({ categories }: { categories: CategoryType[] }) => {
    const categoryList = getLowestSubCategories(categories);

    return (
        <div className="flex flex-wrap gap-2.5 items-center">
            {categoryList.map((e) => {
                const p = getPalette(e._id);
                return (
                    <Link href={`/all-products?category=${e._id}`} key={e._id}>
                        <span
                            className="cursor-pointer font-poppins inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-medium tracking-wide select-none whitespace-nowrap shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
                            style={{ backgroundColor: p.bg, color: p.text, border: `1.5px solid ${p.dot}33` }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: p.dot }} />
                            {e.name}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
};

export default AllCategoriesClient;
