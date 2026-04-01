import { Router } from "express";

import userRoutes from "./user.routes";
import blog_categoryRoutes from "./blog_category.routes";
import uploadRoutes from "./upload.routes";
import blogRoutes from "./blog.routes";
import productRoutes from "./product.routes";
import categoryRoutes from "./category.routes";
import bannerRoutes from "./banner.routes";
import pcjunctionRoutes from "./product_category_junction.routes";
import orderRoutes from "./order.routes";
import webhookRoutes from "./webhook.routes";
import offerRoutes from "./offer.routes";
import categoryImageRoutes from "./category_image.routes";

const router = Router();

router.use("/auth", userRoutes);
router.use("/blog-categories", blog_categoryRoutes);
router.use("/blogs", blogRoutes);
router.use("/uploads", uploadRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/banners", bannerRoutes);
router.use("/pcjunctions", pcjunctionRoutes);
router.use("/orders", orderRoutes);
router.use("/", webhookRoutes);
router.use("/offers", offerRoutes);
router.use("/category-images", categoryImageRoutes);

export default router;
