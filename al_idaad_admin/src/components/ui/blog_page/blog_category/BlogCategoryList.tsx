import { useAuth } from "@/components/shared/AuthContext";
import { getLowestLevelCategories } from "@/libs/utils";

interface Category {
    _id: string;
    name: string;
}

interface CategoryListProps {
    value: Category | null;
    onChange: (value: Category | null) => void;
}

const BlogCategoryList: React.FC<CategoryListProps> = ({ value, onChange }) => {
    const { blogCategories } = useAuth();
    const refinedCategoryList = getLowestLevelCategories(blogCategories);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        if (!selectedId) {
            onChange(null);
            return;
        }
        const selectedCategory = refinedCategoryList.find((ele) => ele._id === selectedId);
        if (selectedCategory) {
            onChange({
                _id: selectedCategory._id,
                name: selectedCategory.name,
            });
        }
    };

    return (
        <select
            value={value?._id || ""}
            onChange={handleChange}
            className="w-full p-3 rounded focus:outline-none border border-border bg-slate-100 custom-scrollbar"
        >
            <option value="">Select Category</option>
            {refinedCategoryList.map((ele) => (
                <option key={ele._id} value={ele._id}>
                    {ele.name}
                </option>
            ))}
        </select>
    );
};

export default BlogCategoryList;
