import Category from "../models/category.model";
import mongoose from "mongoose";

interface ResolvedCategory {
    _id: mongoose.Types.ObjectId;
    name: string;
}

// Recursively search nested subcategories for a matching _id
function findInTree(nodes: any[], targetId: string): ResolvedCategory | null {
    for (const node of nodes) {
        if (node._id.toString() === targetId) {
            return { _id: node._id, name: node.name };
        }
        if (node.subCategories?.length) {
            const found = findInTree(node.subCategories, targetId);
            if (found) return found;
        }
    }
    return null;
}

export const resolveCategoryIds = async (ids: mongoose.Types.ObjectId[]): Promise<ResolvedCategory[]> => {
    // Fetch all top-level categories (subcategories are embedded inside)
    const allCategories = await Category.find();

    return ids.map((id) => {
        const idStr = id.toString();

        // Check top-level first
        const topLevel = allCategories.find((c) => c._id.toString() === idStr);
        if (topLevel) return { _id: topLevel._id, name: topLevel.name };

        // Recursively search subcategories
        for (const category of allCategories) {
            const found = findInTree(category.subCategories, idStr);
            if (found) return found;
        }

        // Fallback if ID not found
        return { _id: id, name: "Unknown" };
    });
};
