"use client";

import { Rating } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";

import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { TbCurrencyTaka } from "react-icons/tb";
import { motion, AnimatePresence } from "motion/react";
import { ProductType } from "@/libs/types";
import { useAuth } from "@/components/shared/AuthContext";
import { calculateReducedPrice, findCategoryPath } from "@/libs/utils";

// ─── Rating star shape ────────────────────────────────────────────────────────

const CustomStar = (
    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
);

const myStyles = {
    itemShapes: CustomStar,
    itemStrokeWidth: 1,
    activeFillColor: "LightSeaGreen",
    activeStrokeColor: "LightSeaGreen",
    inactiveFillColor: "transparent",
    inactiveStrokeColor: "LightSeaGreen",
};

type TabType = "description" | "review";

// ─── Component ────────────────────────────────────────────────────────────────

const ProductDetails = ({ id }: { id: string }) => {
    const [productDetails, setProductDetails] = useState<ProductType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<TabType>("description");
    const [selectedImage, setSelectedImage] = useState<string>("");

    const router = useRouter();
    const { productCategories } = useAuth();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`);
                setProductDetails(res.data.data);
                setSelectedImage(res.data.data.thumbnail);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    // ─── Loading / empty states ───────────────────────────────────────────────

    if (loading) {
        return (
            <div className="bg-main h-[calc(100vh-100px)] flex items-center justify-center">
                <div className="flex items-center gap-2">
                    <span className="animate-spin border-6 border-blue-400 border-t-transparent rounded-full w-8 h-8 inline-block" />
                    <p>Loading Product details...</p>
                </div>
            </div>
        );
    }

    if (!productDetails) {
        return (
            <div className="bg-main h-[calc(100vh-100px)] flex items-center justify-center">
                <p className="text-red-500">Product not found.</p>
            </div>
        );
    }

    const { name, description, thumbnail, category, price, discountPercentage, inStock, ratings, reviews, images, variants, attarSizes } =
        productDetails;

    // const finalPrice = Math.round(price - (price * (discountPercentage ?? 0)) / 100);
    const finalPrice = Boolean(price) ? calculateReducedPrice(price || 0, discountPercentage || 0) : 0;
    // A product is variant-based, attar-based, or simple — never both
    const hasVariants = variants && variants.length > 0;
    const hasAttarSizes = !hasVariants && attarSizes && attarSizes.length > 0;

    return (
        <div className="py-4">
            <div className="max-w-311 mx-auto h-[calc(100vh-200px)] overflow-auto custom-scrollbar pr-1">
                {/* Breadcrumb */}
                <div className="text-text_normal mb-2">{findCategoryPath(productCategories, category._id)}</div>

                <div className="flex gap-10">
                    {/* ── Image panel ── */}
                    <div className="flex-1">
                        <Image src={selectedImage || thumbnail} width={400} height={300} alt={name} className="w-full h-100 rounded object-cover" />

                        {/* Thumbnail strip */}
                        <div className="flex flex-wrap gap-2 mt-2 pl-0.5">
                            <button
                                onClick={() => setSelectedImage(thumbnail)}
                                className={`p-0.5 rounded ${selectedImage === thumbnail ? "ring-2 ring-brand_color" : ""}`}
                            >
                                <Image src={thumbnail} width={50} height={50} alt="thumbnail" className="w-12.5 h-12.5 rounded object-cover" />
                            </button>

                            {images.map((ele) => (
                                <button
                                    key={ele}
                                    onClick={() => setSelectedImage(ele)}
                                    className={`p-0.5 rounded ${selectedImage === ele ? "ring-2 ring-brand_color" : ""}`}
                                >
                                    <Image src={ele} width={50} height={50} alt="img" className="w-12.5 h-12.5 rounded object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Product data panel ── */}
                    <div className="flex-1 space-y-3">
                        <p className="text-2xl font-bold text-primary">{name}</p>

                        <Rating style={{ maxWidth: 130 }} value={ratings || 2.5} itemStyles={myStyles} readOnly />

                        {/* ── Price block ── */}
                        <div className="flex items-center text-5xl text-red-400 -ml-3">
                            <TbCurrencyTaka />
                            <div className="flex items-baseline gap-1">
                                <p className="font-bold">{finalPrice}</p>
                                {!!discountPercentage && <del className="text-xl text-text_normal">{price}</del>}
                            </div>
                        </div>

                        {/* ── Stock indicator ── */}
                        <p className={`font-medium text-sm ${inStock ? "text-green-600" : "text-red-500"}`}>
                            {inStock ? "In Stock" : "Out of Stock"}
                        </p>

                        {/* ── Variants table (thobe / t-shirt) ── */}
                        {hasVariants && (
                            <div className="mt-2">
                                <p className="text-sm font-semibold text-text_normal mb-2">Available Sizes</p>
                                <div className="overflow-x-auto rounded-lg border border-border">
                                    <table className="w-full text-sm text-left text-text_normal">
                                        <thead className="bg-slate-100 text-xs uppercase text-text_normal/70">
                                            <tr>
                                                <th className="px-3 py-2">Size</th>
                                                {variants!.some((v) => v.color) && <th className="px-3 py-2">Color</th>}
                                                {variants!.some((v) => v.chest) && <th className="px-3 py-2">Chest (cm)</th>}
                                                {variants!.some((v) => v.length) && <th className="px-3 py-2">Length (cm)</th>}
                                                {variants!.some((v) => v.price) && <th className="px-3 py-2">Price</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {variants!.map((variant, index) => (
                                                <tr key={index} className="bg-white">
                                                    <td className="px-3 py-2 font-medium">{variant.size}</td>
                                                    {variants!.some((v) => v.color) && <td className="px-3 py-2">{variant.color ?? "—"}</td>}
                                                    {variants!.some((v) => v.chest) && <td className="px-3 py-2">{variant.chest ?? "—"}</td>}
                                                    {variants!.some((v) => v.length) && <td className="px-3 py-2">{variant.length ?? "—"}</td>}
                                                    {variants!.some((v) => v.price) && (
                                                        <td className="px-3 py-2">
                                                            {variant.price ? (
                                                                <span className="flex items-center">
                                                                    <TbCurrencyTaka size={14} />
                                                                    {variant.price}
                                                                </span>
                                                            ) : (
                                                                "—"
                                                            )}
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ── Attar sizes table ── */}
                        {hasAttarSizes && (
                            <div className="mt-2">
                                <p className="text-sm font-semibold text-text_normal mb-2">Available Sizes</p>
                                <div className="overflow-x-auto rounded-lg border border-border">
                                    <table className="w-full text-sm text-left text-text_normal">
                                        <thead className="bg-slate-100 text-xs uppercase text-text_normal/70">
                                            <tr>
                                                <th className="px-3 py-2">Volume</th>
                                                <th className="px-3 py-2">Price</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {attarSizes!.map((attar, index) => (
                                                <tr key={index} className="bg-white">
                                                    <td className="px-3 py-2 font-medium">{attar.ml} ml</td>
                                                    <td className="px-3 py-2">
                                                        <span className="flex items-center">
                                                            <TbCurrencyTaka size={14} />
                                                            {attar.price}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div className="mt-6">
                    <div className="flex gap-6 justify-center">
                        {(["description", "review"] as TabType[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-1 font-semibold capitalize ${
                                    activeTab === tab ? "border-b-2 border-brand_color text-primary" : "text-text_normal"
                                }`}
                            >
                                {tab === "review" ? "Reviews" : "Description"}
                            </button>
                        ))}
                    </div>

                    <div className="mt-4 min-h-50">
                        <AnimatePresence mode="wait">
                            {activeTab === "description" && (
                                <motion.div
                                    key="description"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="text-text_normal text-justify" dangerouslySetInnerHTML={{ __html: description }} />
                                </motion.div>
                            )}

                            {activeTab === "review" && (
                                <motion.div
                                    key="review"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {reviews && reviews.length > 0 ? (
                                        <div className="space-y-2">
                                            {reviews.map((review, idx) => (
                                                <div key={idx} className="border rounded p-2 shadow-sm bg-gray-50">
                                                    {review}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-text_normal">No reviews yet.</p>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ── Related products placeholder ── */}
                <div>
                    <p className="text-primary text-center font-bold mt-6">Related Products</p>
                    <div>related products card will be displayed here</div>
                </div>
            </div>

            {/* ── Action buttons ── */}
            <div className="flex justify-center gap-2 w-full">
                <button
                    onClick={() => router.push("/product")}
                    className="flex items-center gap-2 mt-6 text-text_light px-4 py-2 bg-primary rounded active:scale-90 transition hover:bg-primary/50"
                >
                    <FaArrowLeft />
                    <span>Go back</span>
                </button>
                <button
                    onClick={() => router.push(`/product/edit/${id}`)}
                    className="flex items-center gap-2 mt-6 text-text_light px-4 py-2 bg-primary rounded active:scale-90 transition hover:bg-primary/50"
                >
                    Edit
                </button>
            </div>
        </div>
    );
};

export default ProductDetails;
