import DOMPurify from "dompurify";
import { ProductType, ProductVariant, AttarSize, SubCategoryType, CategoryType } from "@/utils/types";

export const formatMongoDate = (isoDate: string): string => {
    const date = new Date(isoDate);

    // Format time in 12-hour with AM/PM
    const time = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    // Format date like "10 October, 2025"
    const formattedDate = date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    return `${time} - ${formattedDate}`;
};

export const processImageHTML = (html: string) => {
    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Process all <img> tags
    doc.querySelectorAll("img").forEach((img) => {
        const containerStyle = img.getAttribute("containerstyle");
        let existingStyle = img.getAttribute("style") || "";

        let hasMargin = false;

        if (containerStyle) {
            // Look for margin in containerstyle
            const match = containerStyle.match(/margin\s*:\s*[^;]+/i);
            if (match) {
                hasMargin = true;
                // Append margin to the img's style
                existingStyle += (existingStyle ? "; " : "") + match[0];
            }
        }

        // If no margin, set display:inline-block
        if (!hasMargin) {
            existingStyle += (existingStyle ? "; " : "") + "display:inline-block ; margin-left : 1px";
        }

        img.setAttribute("style", existingStyle);

        // Remove unwanted attributes
        img.removeAttribute("containerstyle");
        img.removeAttribute("wrapperstyle");
    });

    // Serialize back to string and sanitize
    return DOMPurify.sanitize(doc.body.innerHTML, {
        ALLOWED_TAGS: ["p", "br", "b", "i", "em", "strong", "a", "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6", "img", "figure", "figcaption"],
        ALLOWED_ATTR: ["src", "alt", "width", "height", "style", "class", "draggable", "href"],
    });
};

// -------------------------------------------------------------------------

/**
 * Builds a unique cart key for a product + its selected variant/attar.
 *
 * Same product, different selection = different key = separate cart line item.
 *
 * Examples:
 *   plain product  →  "abc123"
 *   thobe XL white →  "abc123__v_XL_white"
 *   attar 12ml     →  "abc123__a_12ml"
 */
export const buildCartKey = (product: ProductType, variant?: ProductVariant, attarSize?: AttarSize): string => {
    if (variant) {
        const colorPart = variant.color ? `_${variant.color}` : "";
        return `${product._id}__v_${variant.size}${colorPart}`;
    }
    if (attarSize) {
        return `${product._id}__a_${attarSize.ml}ml`;
    }
    return product._id;
};

//function to calculate reduced price--------------------
export const calculateReducedPrice = (price: string | number, discount: string | number): number => {
    const num_price = Number(price);
    const num_discount = Number(discount);
    const reduced_price = num_price - Math.round(num_price * (num_discount / 100));
    return reduced_price;
};

// function to create path of category-----------------------
export const findCategoryPath = (data: SubCategoryType[], targetId: string): string | null => {
    function dfs(node: SubCategoryType, path: string[]): string | null {
        const newPath = [...path, node.name];

        if (node._id === targetId) {
            return newPath.join(" / ");
        }

        for (const sub of node.subCategories) {
            const result = dfs(sub, newPath);
            if (result) return result;
        }

        return null;
    }

    for (const category of data) {
        const result = dfs(category, []);
        if (result) return result;
    }

    return null;
};

// -----------------get lowest level of category-------------
export const getLowestSubCategories = (categories: CategoryType[]): SubCategoryType[] => {
    const result: SubCategoryType[] = [];

    const traverse = (subCategories: SubCategoryType[]) => {
        for (const sub of subCategories) {
            if (!sub.subCategories || sub.subCategories.length === 0) {
                result.push(sub);
            } else {
                traverse(sub.subCategories);
            }
        }
    };

    for (const category of categories) {
        traverse(category.subCategories);
    }

    return result;
};

// ------------------function to find main category---------------------
type MainParent = {
    name: string;
    _id: string;
};
interface Category {
    _id: string;
    name: string;
    subCategories: Category[];
    createdAt?: string;
    updatedAt?: string;
}

export const findMainParentById = (categories: Category[], targetId: string, mainParent: MainParent | null = null): MainParent | null => {
    for (const item of categories) {
        const currentMainParent = mainParent || {
            name: item.name,
            _id: item._id,
        };

        if (item._id === targetId) {
            return mainParent || currentMainParent;
        }

        if (item.subCategories.length > 0) {
            const result = findMainParentById(item.subCategories, targetId, currentMainParent);
            if (result) return result;
        }
    }

    return null;
};
