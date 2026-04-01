import { MetadataRoute } from "next";
import { GetAllProductsResponseType, GetAllBlogsResponseType, ProductType, BlogType } from "@/utils/types"; // 🔁 adjust path if needed

const BASE_URL = "https://alidaad.com";

// ✅ Fetch products
async function getProducts(): Promise<ProductType[]> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
        const data: GetAllProductsResponseType = await res.json();
        return data.data || [];
    } catch {
        return [];
    }
}

// ✅ Fetch blogs
async function getBlogs(): Promise<BlogType[]> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs`);
        const data: GetAllBlogsResponseType = await res.json();
        return data.data || [];
    } catch {
        return [];
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const products = await getProducts();
    const blogs = await getBlogs();

    const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
        url: `${BASE_URL}/product/${product._id}`,
        lastModified: new Date(product.updatedAt),
        changeFrequency: "weekly",
        priority: 0.8,
    }));

    const blogUrls: MetadataRoute.Sitemap = blogs.map((blog) => ({
        url: `${BASE_URL}/blog/details/${blog._id}`,
        lastModified: new Date(blog.updatedAt),
        changeFrequency: "monthly",
        priority: 0.7,
    }));

    return [
        // ✅ Static pages
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${BASE_URL}/products`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/blog`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },

        // ✅ Dynamic pages
        ...productUrls,
        ...blogUrls,
    ];
}
