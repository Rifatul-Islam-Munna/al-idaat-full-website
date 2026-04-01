import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
            },
            {
                userAgent: "*",
                disallow: ["/api/", "/checkout/"],
            },
        ],
        sitemap: "https://alidaad.com/sitemap.xml", // 🔁 change domain
    };
}
