import DOMPurify from "dompurify";

interface Category {
    _id: string;
    name: string;
    subCategories: Category[];
    createdAt?: string;
    updatedAt?: string;
}

interface LowestLevelCategory {
    _id: string;
    name: string;
}

// function to get list of all lowest level of categories------------------
export const getLowestLevelCategories = (data: Category[]): LowestLevelCategory[] => {
    const result: LowestLevelCategory[] = [];

    function traverse(categories: Category[]): void {
        categories.forEach((category: Category) => {
            // Check if this category has no subcategories (empty array)
            if (category.subCategories && category.subCategories.length === 0) {
                result.push({
                    _id: category._id,
                    name: category.name,
                });
            } else if (category.subCategories && category.subCategories.length > 0) {
                // If it has subcategories, traverse them recursively
                traverse(category.subCategories);
            }
        });
    }

    // Start traversal from the top-level data array
    traverse(data);

    return result;
};

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

// process html images----------------------------------------------------------
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

export const extractImageSources = (html: string): string[] => {
    // Create a regular expression to match all img tags and capture the src attribute
    const imgSrcRegex = /<img[^>]+src=["'](.*?)["']/g;
    const sources: string[] = [];

    // Find all matches and extract the src values
    let match: RegExpExecArray | null;
    while ((match = imgSrcRegex.exec(html)) !== null) {
        if (match[1]) {
            sources.push(match[1]);
        }
    }

    return sources;
};

//functin to calculate reduced price--------------------
export const calculateReducedPrice = (price: string | number, discount: string | number): number => {
    const num_price = Number(price);
    const num_discount = Number(discount);
    const reduced_price = num_price - Math.round(num_price * (num_discount / 100));
    return reduced_price;
};

// function to create path of category-----------------------
export const findCategoryPath = (data: Category[], targetId: string): string | null => {
    function dfs(node: Category, path: string[]): string | null {
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

// find main category---------------------------------------

type MainParent = {
    name: string;
    _id: string;
};
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

// check multiple main category------------------------
export const hasMultipleMainCategories = (categories: Category[], selectedIds: string[]): boolean => {
    const mainParents = new Set<string>();

    for (const id of selectedIds) {
        const parent = findMainParentById(categories, id);
        if (parent) mainParents.add(parent._id);

        if (mainParents.size > 1) return true; // early exit
    }

    return false;
};
