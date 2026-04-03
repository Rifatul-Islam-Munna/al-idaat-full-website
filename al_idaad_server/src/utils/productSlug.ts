import Product, { IProduct } from "../models/product.model";

const slugifyProductName = (value: string) => {
    const normalized = value
        .toLowerCase()
        .trim()
        .replace(/['’]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-{2,}/g, "-");

    return normalized || "product";
};

export const generateUniqueProductSlug = async (name: string, excludeId?: string) => {
    const baseSlug = slugifyProductName(name);
    let candidateSlug = baseSlug;
    let suffix = 2;

    while (
        await Product.exists({
            slug: candidateSlug,
            ...(excludeId ? { _id: { $ne: excludeId } } : {}),
        })
    ) {
        candidateSlug = `${baseSlug}-${suffix}`;
        suffix += 1;
    }

    return candidateSlug;
};

export const ensureProductSlug = async (product: IProduct) => {
    if (product.slug) {
        return product;
    }

    product.slug = await generateUniqueProductSlug(product.name, String(product._id));
    await product.save();

    return product;
};

export const ensureProductSlugs = async (products: IProduct[]): Promise<IProduct[]> =>
    Promise.all(products.map((product) => ensureProductSlug(product)));
