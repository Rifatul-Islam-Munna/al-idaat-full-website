"use client";

import AddCategoryImage from "./AddCategoryImage";
import GetCategoryImage from "./GetCategoryImage";

const CategoryImageContainer = () => {
    return (
        <div className="flex gap-4">
            <div className="flex-1">
                <AddCategoryImage></AddCategoryImage>
            </div>
            <div className="flex-1">
                <GetCategoryImage></GetCategoryImage>
            </div>
        </div>
    );
};

export default CategoryImageContainer;
