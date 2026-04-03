// updated product edit form
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import Swal from "sweetalert2";
import { FaCircleXmark } from "react-icons/fa6";

import RichTextEditor from "@/components/shared/rich_text_editor/RichTextEditor";
import SingleImageUploader from "@/components/shared/SingleImageUploader";
import MultipleImageUploader from "@/components/shared/MultipleImageUploader";
import ProductCategoryList from "../product_category/ProductCategoryList";
import { calculateReducedPrice, findMainParentById, hasMultipleMainCategories } from "@/libs/utils";
import { useAuth } from "@/components/shared/AuthContext";
import { api } from "@/libs/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductMode = "simple" | "variants" | "attar";

type Variant = {
    size: string;
    color: string;
    chest: number | "";
    length: number | "";
    price: number | "";
};

type AttarSize = {
    ml: number | "";
    price: number | "";
};

// ─── Constants ────────────────────────────────────────────────────────────────

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const emptyVariant = (): Variant => ({
    size: "M",
    color: "",
    chest: "",
    length: "",
    price: "",
});

const emptyAttarSize = (): AttarSize => ({
    ml: "",
    price: "",
});

// ─── Component ────────────────────────────────────────────────────────────────

const EditProduct = ({ id }: { id: string }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [updateLoading, setUpdateLoading] = useState<boolean>(false);
    const [refetch, setRefetch] = useState<boolean>(false);

    // Core fields
    const [name, setName] = useState<string>("");
    const [shortDescription, setShortDescription] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [brand, setBrand] = useState<string>("");
    const [category, setCategory] = useState<{ _id: string; name: string } | null>(null);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [inStock, setInStock] = useState<boolean>(true);

    // Price
    const [priceMode, setPriceMode] = useState<"single" | "range">("single");

    const [price, setPrice] = useState<number>(0);

    const [priceMin, setPriceMin] = useState<number | "">("");
    const [priceMax, setPriceMax] = useState<number | "">("");

    const [discountPercentage, setDiscountPercentage] = useState<number>(0);

    const [reducedPrice, setReducedPrice] = useState<number>(0);
    const [reducedMinPrice, setReducedMinPrice] = useState<number>(0);
    const [reducedMaxPrice, setReducedMaxPrice] = useState<number>(0);

    // Images
    const [thumbnail, setThumbnail] = useState<string>("");
    const [images, setImages] = useState<string[]>([]);
    const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

    // Product mode
    const [productMode, setProductMode] = useState<ProductMode>("simple");

    // Variants (thobe / t-shirt)
    const [variants, setVariants] = useState<Variant[]>([emptyVariant()]);

    // Attar sizes
    const [attarSizes, setAttarSizes] = useState<AttarSize[]>([emptyAttarSize()]);

    // Product flags
    const [isFeatured, setIsFeatured] = useState<boolean>(false);
    const [isBestSelling, setIsBestSelling] = useState<boolean>(false);

    // Delivery charge
    const [regularCharge, setRegularCharge] = useState<number | "">(120);
    const [specialCity, setSpecialCity] = useState<string>("Chittagong");
    const [specialCharge, setSpecialCharge] = useState<number | "">(60);

    const { changeUploedFilesKey, changeProductKey, productCategories } = useAuth();

    // ─── Derived ──────────────────────────────────────────────────────────────

    const hasPrice = (priceMode === "single" && price > 0) || (priceMode === "range" && priceMin !== "" && priceMax !== "");

    // ─── Fetch product ────────────────────────────────────────────────────────

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`);
                const data = res.data.data;

                setName(data.name);
                setShortDescription(data.shortDescription ?? "");
                setDescription(data.description);
                setBrand(data.brand ?? "");
                setCategory(data.category);
                setSelectedCategoryIds(data.categoryIdListFilter ?? [data.category._id]);
                setInStock(data.inStock ?? true);
                setIsFeatured(data.isFeatured ?? false);
                setIsBestSelling(data.isBestSelling ?? false);

                // Price: detect range vs single
                const hasRange = data.priceRange && (data.priceRange.min > 0 || data.priceRange.max > 0) && data.price === 0;

                if (hasRange) {
                    setPriceMode("range");
                    setPriceMin(data.priceRange.min ?? "");
                    setPriceMax(data.priceRange.max ?? "");
                    setPrice(0);
                    const discount = data.discountPercentage ?? 0;
                    setDiscountPercentage(discount);
                    if (data.priceRange.min) setReducedMinPrice(calculateReducedPrice(data.priceRange.min, discount));
                    if (data.priceRange.max) setReducedMaxPrice(calculateReducedPrice(data.priceRange.max, discount));
                } else {
                    setPriceMode("single");
                    setPrice(data.price ?? 0);
                    const discount = data.discountPercentage ?? 0;
                    setDiscountPercentage(discount);
                    setReducedPrice(calculateReducedPrice(data.price ?? 0, discount));
                }

                // Images
                setThumbnail(data.thumbnail);
                setImages(data.images ?? []);
                setSelectedUrls(data.images ?? []);

                // Delivery charge
                setRegularCharge(data.deliveryCharge?.regular?.charge ?? 120);
                setSpecialCity(data.deliveryCharge?.special?.city ?? "Chittagong");
                setSpecialCharge(data.deliveryCharge?.special?.charge ?? 60);

                // Product mode
                if (data.variants && data.variants.length > 0) {
                    setProductMode("variants");
                    setVariants(
                        data.variants.map((v: { size: string; color?: string; chest?: number; length?: number; price?: number }) => ({
                            size: v.size,
                            color: v.color ?? "",
                            chest: v.chest ?? "",
                            length: v.length ?? "",
                            price: v.price ?? "",
                        })),
                    );
                } else if (data.attarSizes && data.attarSizes.length > 0) {
                    setProductMode("attar");
                    setAttarSizes(
                        data.attarSizes.map((a: { ml: number; price: number }) => ({
                            ml: a.ml,
                            price: a.price,
                        })),
                    );
                } else {
                    setProductMode("simple");
                }
            } catch (err) {
                console.error(err);
                Swal.fire("Error", "Failed to load product details.", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [refetch, id]);

    // ─── Image handlers ───────────────────────────────────────────────────────

    const handleAddProductImages = (uploadedImages: string[]) => {
        const newImageArray = [...images, ...uploadedImages];
        setImages(newImageArray);
        setSelectedUrls(newImageArray);
    };

    // ─── Variant handlers ─────────────────────────────────────────────────────

    const addVariant = () => setVariants((prev) => [...prev, emptyVariant()]);

    const removeVariant = (index: number) => {
        if (variants.length === 1) return;
        setVariants((prev) => prev.filter((_, i) => i !== index));
    };

    const updateVariant = (index: number, field: keyof Variant, value: string | number | "") => {
        setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
    };

    // ─── Attar size handlers ──────────────────────────────────────────────────

    const addAttarSize = () => setAttarSizes((prev) => [...prev, emptyAttarSize()]);

    const removeAttarSize = (index: number) => {
        if (attarSizes.length === 1) return;
        setAttarSizes((prev) => prev.filter((_, i) => i !== index));
    };

    const updateAttarSize = (index: number, field: keyof AttarSize, value: number | "") => {
        setAttarSizes((prev) => prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)));
    };

    // ─── Submit ───────────────────────────────────────────────────────────────

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !shortDescription || !description || !category) {
            Swal.fire({
                icon: "warning",
                title: "Invalid Input",
                text: "Please fill in all required fields correctly.",
            });
            return;
        }

        if (productMode === "variants") {
            const invalid = variants.some((v) => !v.size);
            if (invalid) {
                Swal.fire({ icon: "warning", title: "Invalid Variants", text: "Each variant must have a size." });
                return;
            }
        }

        if (productMode === "attar") {
            const invalid = attarSizes.some((a) => a.ml === "" || a.price === "" || Number(a.ml) <= 0 || Number(a.price) < 0);
            if (invalid) {
                Swal.fire({
                    icon: "warning",
                    title: "Invalid Attar Sizes",
                    text: "Each attar size must have a valid ml and price.",
                });
                return;
            }
        }

        if (hasMultipleMainCategories(productCategories, selectedCategoryIds)) {
            Swal.fire({
                icon: "warning",
                title: "Invalid Category Selection",
                text: "One product cannot belong to multiple main categories.",
            });
            return;
        }

        if (priceMode === "single" && price <= 0) {
            Swal.fire("Invalid price", "Price must be greater than 0.", "warning");
            return;
        }

        if (priceMode === "range") {
            if (priceMin === "" || priceMax === "" || priceMin > priceMax) {
                Swal.fire("Invalid price range", "Check min and max values.", "warning");
                return;
            }
        }

        const productData = {
            name,
            shortDescription,
            description,
            brand,
            category: findMainParentById(productCategories, category?._id ?? ""),
            categoryIdList: selectedCategoryIds,
            categoryIdListFilter: selectedCategoryIds,
            ...(priceMode === "single"
                ? {
                      price,
                      priceRange: { min: Number(priceMin), max: Number(priceMax) },
                  }
                : {
                      price,
                      priceRange: { min: Number(priceMin), max: Number(priceMax) },
                  }),
            discountPercentage,
            inStock,
            thumbnail,
            images: selectedUrls,
            isFeatured,
            isBestSelling,
            ...(productMode === "variants"
                ? {
                      variants: variants.map((v) => ({
                          size: v.size,
                          ...(v.color ? { color: v.color.toLocaleLowerCase() } : {}),
                          ...(v.chest !== "" ? { chest: Number(v.chest) } : {}),
                          ...(v.length !== "" ? { length: Number(v.length) } : {}),
                          ...(v.price !== "" ? { price: Number(v.price) } : {}),
                      })),
                      attarSizes: [],
                  }
                : {}),
            ...(productMode === "attar"
                ? {
                      attarSizes: attarSizes.map((a) => ({
                          ml: Number(a.ml),
                          price: Number(a.price),
                      })),
                      variants: [],
                  }
                : {}),
            ...(productMode === "simple" ? { variants: [], attarSizes: [] } : {}),
            deliveryCharge: {
                regular: {
                    charge: regularCharge === "" ? 120 : regularCharge,
                    city: "all",
                },
                special: {
                    charge: specialCharge === "" ? 0 : specialCharge,
                    city: specialCity,
                },
            },
        };

        setUpdateLoading(true);
        try {
            const result = await api.put(`/products/${id}`, productData);
            if (result.data.success) {
                Swal.fire({
                    icon: "success",
                    title: "Product Updated",
                    text: "Information has been updated successfully!",
                });
                changeUploedFilesKey();
                changeProductKey();
                setRefetch((prev) => !prev);
            }
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to update product.", "error");
        } finally {
            setUpdateLoading(false);
        }
    };

    // ─── Loading state ────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="bg-main h-[calc(100vh-132px)] flex items-center justify-center">
                <div className="flex items-center justify-center gap-2">
                    <span className="animate-spin border-6 border-blue-400 border-t-transparent rounded-full w-8 h-8 inline-block" />
                    <p>Loading product details...</p>
                </div>
            </div>
        );
    }

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div>
            {/* Update overlay spinner */}
            {updateLoading && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="flex items-center gap-2">
                        <span className="animate-spin border-6 border-white border-t-transparent rounded-full w-8 h-8 inline-block" />
                        <p className="text-white">Updating Product...</p>
                    </div>
                </div>
            )}

            <div className="flex gap-10">
                {/* ── Left: Form ── */}
                <form className="flex-1 h-[calc(100vh-132px)] overflow-y-auto custom-scrollbar pr-2 space-y-4" onSubmit={handleUpdate}>
                    {/* ── Name ── */}
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-text_normal">
                            Product Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 bg-bg_secondary rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* ── Thumbnail uploader ── */}
                    <div className="border border-border p-4 space-y-4 rounded">
                        <p className="text-sm font-medium text-text_normal">Change Thumbnail</p>
                        <SingleImageUploader onImageUpload={(props) => setThumbnail(props.url)} />
                    </div>

                    {/* ── Multiple images uploader ── */}
                    <MultipleImageUploader onMultipleUpload={(props) => handleAddProductImages(props)} />

                    {/* ── Short Description ── */}
                    <div className="space-y-2">
                        <label htmlFor="shortDescription" className="text-sm font-medium text-text_normal">
                            Short Description
                        </label>
                        <div className="border border-border rounded">
                            <RichTextEditor content={shortDescription} onChange={(content) => setShortDescription(content)} />
                        </div>
                    </div>

                    {/* ── Description ── */}
                    <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-medium text-text_normal">
                            Description
                        </label>
                        <div className="border border-border rounded">
                            <RichTextEditor content={description} onChange={(content) => setDescription(content)} />
                        </div>
                    </div>

                    {/* ── Brand & Category ── */}
                    <div className="flex gap-2">
                        <div className="space-y-2 flex-1">
                            <label htmlFor="brand" className="text-sm font-medium text-text_normal">
                                Brand
                            </label>
                            <input
                                id="brand"
                                type="text"
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                className="w-full p-3 bg-bg_secondary rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="space-y-2 flex-1">
                            <label className="text-sm font-medium text-text_normal">Category</label>
                            <ProductCategoryList
                                selectedIds={selectedCategoryIds}
                                onChange={(primary, allIds) => {
                                    setCategory(primary);
                                    setSelectedCategoryIds(allIds);
                                }}
                            />
                            {selectedCategoryIds.length > 1 && (
                                <p className="text-xs text-text_normal/60 mt-1">
                                    {selectedCategoryIds.length} categories selected — first is primary
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ── Price Mode Toggle ── */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setPriceMode("single")}
                            className={`px-3 py-2 border rounded text-sm ${
                                priceMode === "single" ? "border-primary bg-primary/10 text-primary" : "border-border"
                            }`}
                        >
                            Single Price
                        </button>
                        <button
                            type="button"
                            onClick={() => setPriceMode("range")}
                            className={`px-3 py-2 border rounded text-sm ${
                                priceMode === "range" ? "border-primary bg-primary/10 text-primary" : "border-border"
                            }`}
                        >
                            Price Range
                        </button>
                    </div>

                    {/* ── Single Price ── */}
                    {priceMode === "single" && (
                        <div className="space-y-2">
                            <label htmlFor="price" className="text-sm font-medium text-text_normal">
                                Price
                            </label>
                            <input
                                id="price"
                                type="number"
                                value={price}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setPrice(val);
                                    setPriceMin("");
                                    setPriceMax("");
                                    setReducedMinPrice(0);
                                    setReducedMaxPrice(0);
                                    setReducedPrice(calculateReducedPrice(val, discountPercentage));
                                    if (val === 0) setDiscountPercentage(0);
                                }}
                                className="w-full p-3 bg-bg_secondary rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}

                    {/* ── Price Range ── */}
                    {priceMode === "range" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text_normal">Minimum Price</label>
                                <input
                                    type="number"
                                    value={priceMin}
                                    onChange={(e) => {
                                        const val = e.target.value === "" ? "" : Number(e.target.value);
                                        setPriceMin(val);
                                        setPrice(0);
                                        setReducedPrice(0);
                                        if (val !== "") setReducedMinPrice(calculateReducedPrice(val, discountPercentage));
                                    }}
                                    className="w-full p-3 bg-bg_secondary rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text_normal">Maximum Price</label>
                                <input
                                    type="number"
                                    value={priceMax}
                                    onChange={(e) => {
                                        const val = e.target.value === "" ? "" : Number(e.target.value);
                                        setPriceMax(val);
                                        setPrice(0);
                                        setReducedPrice(0);
                                        if (val !== "") setReducedMaxPrice(calculateReducedPrice(val, discountPercentage));
                                    }}
                                    className="w-full p-3 bg-bg_secondary rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}

                    {/* ── Discount ── */}
                    <div className="space-y-2">
                        <label htmlFor="discountPercentage" className="text-sm font-medium text-text_normal">
                            Discount (%) {!hasPrice && <span className="text-xs font-normal text-red-400">(Set price first)</span>}
                        </label>
                        <input
                            id="discountPercentage"
                            type="number"
                            disabled={!hasPrice}
                            value={discountPercentage}
                            onChange={(e) => {
                                const discount = Number(e.target.value);
                                setDiscountPercentage(discount);
                                if (priceMode === "single") {
                                    setReducedPrice(calculateReducedPrice(price, discount));
                                }
                                if (priceMode === "range") {
                                    if (priceMin !== "") setReducedMinPrice(calculateReducedPrice(priceMin, discount));
                                    if (priceMax !== "") setReducedMaxPrice(calculateReducedPrice(priceMax, discount));
                                }
                            }}
                            className={`w-full p-3 bg-bg_secondary rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                !hasPrice ? "opacity-60 cursor-not-allowed" : ""
                            }`}
                        />
                        {!hasPrice && <p className="text-xs text-red-500">Set price or price range first</p>}
                    </div>

                    {/* ── Reduced Price Display ── */}
                    {priceMode === "single" && discountPercentage > 0 && hasPrice && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text_normal">Reduced Price</label>
                            <input
                                type="number"
                                readOnly
                                value={reducedPrice}
                                className="w-full p-3 bg-bg_secondary rounded outline-none cursor-not-allowed"
                            />
                        </div>
                    )}

                    {priceMode === "range" && discountPercentage > 0 && hasPrice && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text_normal">Reduced Min Price</label>
                                <input
                                    readOnly
                                    value={reducedMinPrice}
                                    className="w-full p-3 bg-bg_secondary rounded outline-none cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text_normal">Reduced Max Price</label>
                                <input
                                    readOnly
                                    value={reducedMaxPrice}
                                    className="w-full p-3 bg-bg_secondary rounded outline-none cursor-not-allowed"
                                />
                            </div>
                        </div>
                    )}

                    {/* ── In Stock toggle ── */}
                    <div className="border border-border rounded-lg p-4 bg-bg_secondary flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-text_normal">In Stock</p>
                            <p className="text-xs text-text_normal/60 mt-0.5">Toggle off if this product is currently unavailable.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setInStock((prev) => !prev)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                inStock ? "bg-primary" : "bg-gray-300"
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                    inStock ? "translate-x-6" : "translate-x-1"
                                }`}
                            />
                        </button>
                    </div>

                    {/* ── Product Flags ── */}
                    <div className="space-y-3">
                        {/* Featured */}
                        <div className="border border-border rounded-lg p-4 bg-bg_secondary flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-text_normal">Featured Product</p>
                                <p className="text-xs text-text_normal/60 mt-0.5">
                                    Toggle on to highlight this product on the homepage or special sections.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsFeatured((prev) => !prev)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                    isFeatured ? "bg-primary" : "bg-gray-300"
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                        isFeatured ? "translate-x-6" : "translate-x-1"
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Best Selling */}
                        <div className="border border-border rounded-lg p-4 bg-bg_secondary flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-text_normal">Best Selling</p>
                                <p className="text-xs text-text_normal/60 mt-0.5">Toggle on if this product is among the best-selling items.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsBestSelling((prev) => !prev)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                                    isBestSelling ? "bg-primary" : "bg-gray-300"
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                        isBestSelling ? "translate-x-6" : "translate-x-1"
                                    }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* ── Product Mode Selector ── */}
                    <div className="border border-border rounded-lg p-4 bg-bg_secondary">
                        <p className="text-sm font-medium text-text_normal mb-3">Product Type</p>
                        <div className="flex flex-wrap gap-3">
                            {(
                                [
                                    { value: "simple", label: "Simple", desc: "No sizes or variants" },
                                    { value: "variants", label: "Sizes / Variants", desc: "Thobe, T-shirt, etc." },
                                    { value: "attar", label: "Attar Sizes", desc: "ml-based pricing" },
                                ] as { value: ProductMode; label: string; desc: string }[]
                            ).map(({ value, label, desc }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setProductMode(value)}
                                    className={`flex flex-col items-start px-4 py-2.5 rounded-lg border text-left transition ${
                                        productMode === value
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border bg-white text-text_normal hover:border-primary/40"
                                    }`}
                                >
                                    <span className="text-sm font-medium">{label}</span>
                                    <span className="text-xs text-text_normal/60 mt-0.5">{desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Variants Table ── */}
                    {productMode === "variants" && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-text_normal">Size Variants</h3>
                                <button
                                    type="button"
                                    onClick={addVariant}
                                    className="px-3 py-1.5 text-xs bg-primary text-text_light rounded-lg hover:bg-selected transition active:scale-95"
                                >
                                    + Add Variant
                                </button>
                            </div>
                            <p className="text-xs text-text_normal/60 -mt-1">Size is required. Leave Price blank to use the base price above.</p>

                            <div className="overflow-x-auto rounded-lg border border-border">
                                <table className="w-full text-sm text-left text-text_normal">
                                    <thead className="bg-bg_secondary text-xs uppercase text-text_normal/70">
                                        <tr>
                                            <th className="px-3 py-2">Size *</th>
                                            <th className="px-3 py-2">Color</th>
                                            <th className="px-3 py-2">Chest (cm)</th>
                                            <th className="px-3 py-2">Length (cm)</th>
                                            <th className="px-3 py-2">Price (override)</th>
                                            <th className="px-3 py-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {variants.map((variant, index) => (
                                            <tr key={index} className="bg-white">
                                                <td className="px-3 py-2">
                                                    <select
                                                        value={variant.size}
                                                        onChange={(e) => updateVariant(index, "size", e.target.value)}
                                                        className="w-full px-2 py-1.5 rounded border border-border bg-bg_secondary focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    >
                                                        {SIZE_OPTIONS.map((s) => (
                                                            <option key={s} value={s}>
                                                                {s}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        value={variant.color}
                                                        onChange={(e) => updateVariant(index, "color", e.target.value)}
                                                        placeholder="e.g. White"
                                                        className="w-full px-2 py-1.5 rounded border border-border bg-bg_secondary focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="number"
                                                        value={variant.chest}
                                                        onChange={(e) =>
                                                            updateVariant(index, "chest", e.target.value === "" ? "" : Number(e.target.value))
                                                        }
                                                        placeholder="e.g. 30"
                                                        className="w-full px-2 py-1.5 rounded border border-border bg-bg_secondary focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="number"
                                                        value={variant.length}
                                                        onChange={(e) =>
                                                            updateVariant(index, "length", e.target.value === "" ? "" : Number(e.target.value))
                                                        }
                                                        placeholder="e.g. 52"
                                                        className="w-full px-2 py-1.5 rounded border border-border bg-bg_secondary focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="number"
                                                        value={variant.price}
                                                        onChange={(e) =>
                                                            updateVariant(index, "price", e.target.value === "" ? "" : Number(e.target.value))
                                                        }
                                                        placeholder={price ? String(price) : "—"}
                                                        className="w-full px-2 py-1.5 rounded border border-border bg-bg_secondary focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVariant(index)}
                                                        disabled={variants.length === 1}
                                                        className="text-red-400 hover:text-red-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                                    >
                                                        <FaCircleXmark size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── Attar Sizes Table ── */}
                    {productMode === "attar" && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-text_normal">Attar Sizes</h3>
                                <button
                                    type="button"
                                    onClick={addAttarSize}
                                    className="px-3 py-1.5 text-xs bg-primary text-text_light rounded-lg hover:bg-selected transition active:scale-95"
                                >
                                    + Add Size
                                </button>
                            </div>
                            <p className="text-xs text-text_normal/60 -mt-1">Both ml and price are required for each entry.</p>

                            <div className="overflow-x-auto rounded-lg border border-border">
                                <table className="w-full text-sm text-left text-text_normal">
                                    <thead className="bg-bg_secondary text-xs uppercase text-text_normal/70">
                                        <tr>
                                            <th className="px-3 py-2">Volume (ml) *</th>
                                            <th className="px-3 py-2">Price *</th>
                                            <th className="px-3 py-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {attarSizes.map((attar, index) => (
                                            <tr key={index} className="bg-white">
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="number"
                                                        value={attar.ml}
                                                        onChange={(e) =>
                                                            updateAttarSize(index, "ml", e.target.value === "" ? "" : Number(e.target.value))
                                                        }
                                                        placeholder="e.g. 3"
                                                        className="w-full px-2 py-1.5 rounded border border-border bg-bg_secondary focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="number"
                                                        value={attar.price}
                                                        onChange={(e) =>
                                                            updateAttarSize(index, "price", e.target.value === "" ? "" : Number(e.target.value))
                                                        }
                                                        placeholder="e.g. 150"
                                                        className="w-full px-2 py-1.5 rounded border border-border bg-bg_secondary focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAttarSize(index)}
                                                        disabled={attarSizes.length === 1}
                                                        className="text-red-400 hover:text-red-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                                    >
                                                        <FaCircleXmark size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── Delivery Charge ── */}
                    <div className="border border-border rounded-lg p-4 bg-bg_secondary space-y-4">
                        <p className="text-sm font-medium text-text_normal">Delivery Charge</p>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text_normal">Regular Delivery Charge</label>
                            <input
                                type="number"
                                value={regularCharge}
                                onChange={(e) => setRegularCharge(e.target.value === "" ? "" : Number(e.target.value))}
                                placeholder="Default 120"
                                className="w-full p-3 bg-bg_main rounded border border-border focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-text_normal">Special City</label>
                                <input
                                    type="text"
                                    value={specialCity}
                                    onChange={(e) => setSpecialCity(e.target.value)}
                                    placeholder="e.g. Dhaka"
                                    className="w-full p-3 bg-bg_main rounded border border-border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-text_normal">Special Delivery Charge</label>
                                <input
                                    type="number"
                                    value={specialCharge}
                                    onChange={(e) => setSpecialCharge(e.target.value === "" ? "" : Number(e.target.value))}
                                    placeholder="e.g. 60"
                                    className="w-full p-3 bg-bg_main rounded border border-border focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Submit ── */}
                    <div className="mt-3 pb-4">
                        <button
                            type="submit"
                            disabled={updateLoading}
                            className="w-full py-3 bg-primary text-text_light rounded font-medium focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {updateLoading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>

                {/* ── Right: Image preview panel ── */}
                <div className="flex-1 space-y-2 h-[calc(100vh-132px)] overflow-y-auto custom-scrollbar pr-2">
                    <p className="text-xl font-soft font-medium">Thumbnail</p>
                    {thumbnail && <Image src={thumbnail} width={800} height={600} alt="thumbnail" className="w-150 max-h-112.5" />}

                    <p className="text-xl font-soft font-medium">
                        Other Images <span className="text-sm font-normal text-text_normal/60">(deselect to exclude)</span>
                    </p>
                    <div className="flex flex-wrap">
                        {images.map((ele) => (
                            <div key={ele} className="relative">
                                <input
                                    type="checkbox"
                                    checked={selectedUrls.includes(ele)}
                                    onChange={(e) =>
                                        e.target.checked
                                            ? setSelectedUrls((prev) => [...prev, ele])
                                            : setSelectedUrls((prev) => prev.filter((url) => url !== ele))
                                    }
                                    className="absolute top-2 left-2 h-4 w-4 text-red-500 bg-white rounded-sm border-gray-300 z-10"
                                />
                                <Image src={ele} alt="product image" width={267} height={200} className="w-74 max-h-50" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProduct;
