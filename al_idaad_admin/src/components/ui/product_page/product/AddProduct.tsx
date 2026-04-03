"use client";

import { useRef, useState } from "react";
import Swal from "sweetalert2";
import { AxiosError } from "axios";
import Image from "next/image";
import { FaCircleXmark } from "react-icons/fa6";

import RichTextEditor from "@/components/shared/rich_text_editor/RichTextEditor";
import { useAuth } from "@/components/shared/AuthContext";
import { api } from "@/libs/axios";
import FileUploader from "@/components/shared/FileUploader";
import ProductCategoryList from "../product_category/ProductCategoryList";
import { calculateReducedPrice, findMainParentById, hasMultipleMainCategories } from "@/libs/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type ApiError = {
    message?: string;
    error?: string;
};

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

const AddProduct = () => {
    // Core fields
    const [name, setName] = useState<string>("");
    const [shortDescription, setShortDescription] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [brand, setBrand] = useState<string>("");
    const [category, setCategory] = useState<{ _id: string; name: string } | null>(null);
    const [inStock, setInStock] = useState<boolean>(true);

    // price
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
    const [deleting, setDeleting] = useState<string | null>(null);

    // Product mode
    const [productMode, setProductMode] = useState<ProductMode>("simple");

    // Variants (thobe / t-shirt)
    const [variants, setVariants] = useState<Variant[]>([emptyVariant()]);

    // Attar sizes
    const [attarSizes, setAttarSizes] = useState<AttarSize[]>([emptyAttarSize()]);

    // product flags
    const [isFeatured, setIsFeatured] = useState<boolean>(false);
    const [isBestSelling, setIsBestSelling] = useState<boolean>(false);

    // Delivery charge
    const [regularCharge, setRegularCharge] = useState<number | "">(120);
    const [specialCity, setSpecialCity] = useState<string>("Chittagong");
    const [specialCharge, setSpecialCharge] = useState<number | "">(60);

    // ----------------------------------------------
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

    const [loading, setLoading] = useState<boolean>(false);

    const fileUploaderRef = useRef<{ reset: () => void } | null>(null);
    const { changeProductKey, uploadedFiles, productCategories, changeUploedFilesKey } = useAuth();

    const [imgDeleteLoading, setImgDeleteLoading] = useState(false);

    //----------------check price fields------------------
    const hasPrice = (priceMode === "single" && price > 0) || (priceMode === "range" && priceMin !== "" && priceMax !== "");

    // ─── Error handler ────────────────────────────────────────────────────────

    const handleAxiosError = (err: unknown) => {
        const axiosError = err as AxiosError<ApiError>;
        const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || "An unexpected error occurred";
        Swal.fire("Error", errorMessage, "error");
        console.error(axiosError);
    };

    // ─── Image handlers ───────────────────────────────────────────────────────

    const handleDeleteImage = async (imageURL: string) => {
        setImgDeleteLoading(true);

        const id = uploadedFiles.find((file) => file.url === imageURL)?._id;
        if (!id) {
            Swal.fire("Error", "Image not found in uploaded files", "error");
            return;
        }

        setDeleting(imageURL);

        try {
            const res = await api.delete(`/uploads/single/${id}`);
            if (res.data.success) {
                setImages((prev) => {
                    const updated = prev.filter((img) => img !== imageURL);

                    setThumbnail((prevThumb) => {
                        if (prevThumb !== imageURL) return prevThumb;
                        return updated.length > 0 ? updated[0] : "";
                    });

                    return updated;
                });

                Swal.fire({
                    icon: "success",
                    title: "Deleted",
                    text: "Image removed successfully",
                    timer: 1500,
                    showConfirmButton: false,
                });

                changeUploedFilesKey();
            }
        } catch (err) {
            // setImages(prevImages);
            // setThumbnail(prevThumbnail);
            handleAxiosError(err);
        } finally {
            setDeleting(null);
            setImgDeleteLoading(false);
        }
    };

    // ─── Variant handlers ─────────────────────────────────────────────────────

    const addVariant = () => setVariants((prev) => [...prev, emptyVariant()]);

    const removeVariant = (index: number) => {
        if (variants.length === 1) return;
        setVariants((prev) => prev.filter((_, i) => i !== index));
    };

    const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
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

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !shortDescription || !description || !category || price < 0) {
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
                Swal.fire({
                    icon: "warning",
                    title: "Invalid Variants",
                    text: "Each variant must have a size.",
                });
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
            Swal.fire("Invalid price");
            return;
        }

        if (priceMode === "range") {
            if (priceMin === "" || priceMax === "" || priceMin > priceMax) {
                Swal.fire("Invalid price range");
                return;
            }
        }

        setLoading(true);

        const productData = {
            name,
            shortDescription,
            description,
            brand,
            category: findMainParentById(productCategories, category._id),
            categoryIdList: selectedCategoryIds, // ← newly added
            categoryIdListFilter: selectedCategoryIds, // ← newly added
            ...(priceMode === "single"
                ? {
                      price,
                      priceRange: {
                          min: Number(priceMin),
                          max: Number(priceMax),
                      },
                  }
                : {
                      price,
                      priceRange: {
                          min: Number(priceMin),
                          max: Number(priceMax),
                      },
                  }),
            discountPercentage,
            inStock,
            thumbnail,
            images: images.slice(1),
            isFeatured,
            isBestSelling,
            ...(productMode === "variants"
                ? {
                      variants: variants.map((v) => ({
                          size: v.size,
                          ...(v.color ? { color: v.color.toLocaleLowerCase() } : {}),
                          ...(v.chest !== "" ? { chest: Number(v.chest) } : {}),
                          ...(v.length !== "" ? { length: Number(v.length) } : {}),
                          price: v.price !== "" ? Number(v.price) : price,
                      })),
                  }
                : {}),
            ...(productMode === "attar"
                ? {
                      attarSizes: attarSizes.map((a) => ({
                          ml: Number(a.ml),
                          price: Number(a.price),
                      })),
                  }
                : {}),
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
        console.log(productData);
        try {
            const result = await api.post("/products", productData);
            if (result.data.success) {
                Swal.fire({
                    icon: "success",
                    title: "Product Added",
                    text: "The product has been added successfully!",
                });
                // Reset all state
                setName("");
                setShortDescription("");
                setDescription("");
                setBrand("");
                setCategory(null);
                setPrice(0);
                setDiscountPercentage(0);
                setReducedPrice(0);
                setPriceMin(0);
                setPriceMax(0);
                setReducedMaxPrice(0);
                setReducedMinPrice(0);
                setInStock(true);
                setImages([]);
                setThumbnail("");
                setIsFeatured(false);
                setIsBestSelling(false);
                setProductMode("simple");
                setVariants([emptyVariant()]);
                setAttarSizes([emptyAttarSize()]);
                setSelectedCategoryIds([]); // ← newly added
                setRegularCharge(120);
                setSpecialCity("Chittagong");
                setSpecialCharge(60);
                fileUploaderRef.current?.reset();
                changeProductKey();
            }
        } catch (error) {
            handleAxiosError(error);
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="h-[calc(100vh-202px)] overflow-y-auto pr-2 custom-scrollbar">
            <div className="max-w-5xl mx-auto bg-bg_main border border-border rounded-xl shadow-sm p-4">
                <form onSubmit={handleAddProduct} className="space-y-6">
                    {/* ── Images ── */}
                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-text_normal">
                                Product Images <br />
                            </label>
                            <FileUploader
                                ref={fileUploaderRef}
                                onSingleUpload={(url) => {
                                    setThumbnail(url);
                                    setImages((prev) => [...prev, url]);
                                }}
                                onMultipleUpload={(urls) => {
                                    setImages((prev) => [...prev, ...urls]);
                                    if (!thumbnail && urls.length > 0) setThumbnail(urls[0]);
                                }}
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-text_normal">
                                Image Preview {images.length > 0 && `(${images.length} image${images.length > 1 ? "s" : ""})`}
                            </label>
                            <div className="border border-border rounded-lg p-4 min-h-50">
                                {images.length === 0 && (
                                    <div className="flex items-center justify-center h-full min-h-42">
                                        <span className="text-sm text-text_normal">No images uploaded</span>
                                    </div>
                                )}
                                {images.length > 0 && (
                                    <div className="flex flex-wrap gap-3">
                                        {images.map((imageUrl, index) => (
                                            <div
                                                key={index}
                                                className="relative w-37.5 aspect-2/3 border border-border rounded-lg overflow-hidden bg-white group"
                                            >
                                                {imgDeleteLoading && (
                                                    <div className="absolute top-0 left-0 z-10 w-37.5 aspect-2/3 bg-black/50 animate-pulse"></div>
                                                )}
                                                {deleting === imageUrl ? (
                                                    <div className="w-37.5 aspect-2/3 animate-pulse bg-gray-300 flex items-center justify-center">
                                                        <div>Deleting...</div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Image
                                                            width={150}
                                                            height={255}
                                                            src={imageUrl}
                                                            alt={`Product ${index + 1}`}
                                                            className="w-full aspect-2/3"
                                                        />
                                                        {thumbnail === imageUrl && (
                                                            <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                                                                Thumbnail
                                                            </div>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteImage(imageUrl)}
                                                            disabled={deleting === imageUrl}
                                                            className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow
                                                            text-red-500 hover:text-red-700 transition active:scale-90
                                                            opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <FaCircleXmark size={18} />
                                                        </button>
                                                        {thumbnail !== imageUrl && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setThumbnail(imageUrl)}
                                                                disabled={deleting === imageUrl}
                                                                className="absolute bottom-2 left-2 right-2 bg-white/90 text-primary text-xs py-1 rounded
                                                                hover:bg-white transition opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                Set as Thumbnail
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Name ── */}
                    <div>
                        <label htmlFor="name" className="block mb-1 text-sm font-medium text-text_normal">
                            Product Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter product name"
                            className="w-full px-3 py-2 rounded border border-border bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                        />
                    </div>

                    {/* ── Short Description ── */}
                    <div>
                        <label htmlFor="shortDescription" className="block mb-2 text-sm font-medium text-text_normal">
                            Short Description
                        </label>
                        <div className="border border-border rounded-lg overflow-hidden">
                            <RichTextEditor content={shortDescription} onChange={(content) => setShortDescription(content)} />
                        </div>
                    </div>

                    {/* ── Description ── */}
                    <div>
                        <label htmlFor="description" className="block mb-2 text-sm font-medium text-text_normal">
                            Description
                        </label>
                        <div className="border border-border rounded-lg overflow-hidden">
                            <RichTextEditor content={description} onChange={(content) => setDescription(content)} />
                        </div>
                    </div>

                    {/* ── Brand & Category ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="brand" className="block mb-1 text-sm font-medium text-text_normal">
                                Brand
                            </label>
                            <input
                                id="brand"
                                type="text"
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                placeholder="Enter brand name"
                                className="w-full px-3 py-2 rounded border border-border bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                            />
                        </div>
                        {/* <div>
                            <label className="block mb-2 text-sm font-medium text-text_normal">Category</label>
                            <ProductCategoryList value={category} onChange={(selectedCategory) => setCategory(selectedCategory)} />
                        </div> */}
                        <div>
                            <label className="block mb-1 text-sm font-medium text-text_normal">
                                Category
                                {/* <span className="text-xs font-normal text-text_normal/60">(Hold Ctrl / Cmd to select multiple)</span> */}
                            </label>
                            <ProductCategoryList
                                // value={category}
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

                    {/* ── Price & Discount ── */}
                    {/* ===========tab=============== */}
                    <div className="flex gap-3 mb-3">
                        <button
                            type="button"
                            onClick={() => setPriceMode("single")}
                            className={`px-3 py-2 border rounded ${priceMode === "single" ? "border-primary bg-primary/10" : "border-border"}`}
                        >
                            Single Price
                        </button>

                        <button
                            type="button"
                            onClick={() => setPriceMode("range")}
                            className={`px-3 py-2 border rounded ${priceMode === "range" ? "border-primary bg-primary/10" : "border-border"}`}
                        >
                            Price Range
                        </button>
                    </div>
                    {/* ----------single price input----------- */}
                    {priceMode === "single" && (
                        <div>
                            <label className="block mb-1 text-sm font-medium">Price</label>

                            <input
                                type="number"
                                value={price}
                                onChange={(e) => {
                                    const val = Number(e.target.value);

                                    setPrice(val);

                                    // Clear price range if price is entered
                                    if (val > 0) {
                                        setPriceMin("");
                                        setPriceMax("");
                                        setReducedMinPrice(0);
                                        setReducedMaxPrice(0);
                                    }

                                    setReducedPrice(calculateReducedPrice(val, discountPercentage));
                                }}
                                className="w-full px-3 py-2 rounded border border-border bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                            />
                        </div>
                    )}
                    {/* --------------price range input------------------- */}
                    {priceMode === "range" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-1 text-sm font-medium">Minimum Price</label>

                                <input
                                    type="number"
                                    value={priceMin}
                                    onChange={(e) => {
                                        const val = e.target.value === "" ? "" : Number(e.target.value);

                                        setPriceMin(val);

                                        // Clear single price if range is used
                                        if (val !== "") {
                                            setPrice(0);
                                            setReducedPrice(0);
                                        }

                                        if (val !== "") {
                                            setReducedMinPrice(calculateReducedPrice(val, discountPercentage));
                                        }
                                    }}
                                    className="w-full px-3 py-2 rounded border border-border bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium">Maximum Price</label>

                                <input
                                    type="number"
                                    value={priceMax}
                                    onChange={(e) => {
                                        const val = e.target.value === "" ? "" : Number(e.target.value);

                                        setPriceMax(val);

                                        // Clear single price if range is used
                                        if (val !== "") {
                                            setPrice(0);
                                            setReducedPrice(0);
                                        }

                                        if (val !== "") {
                                            setReducedMaxPrice(calculateReducedPrice(val, discountPercentage));
                                        }
                                    }}
                                    className="w-full px-3 py-2 rounded border border-border bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                                />
                            </div>
                        </div>
                    )}
                    {/* -----------------discount input--------------- */}
                    <div>
                        <label className="block mb-1 text-sm font-medium">Discount (%)</label>

                        <input
                            type="number"
                            value={discountPercentage}
                            disabled={!hasPrice}
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
                            className={`w-full px-3 py-2 rounded border border-border bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 transition 
        ${!hasPrice ? "bg-gray-100 cursor-not-allowed opacity-60" : ""}`}
                        />

                        {!hasPrice && <p className="text-xs text-red-500 mt-1">Set price or price range first</p>}
                    </div>

                    {/* ---------------Reduced price display---------------- */}

                    {/* single */}
                    {priceMode === "single" && discountPercentage > 0 && hasPrice && (
                        <input
                            type="number"
                            readOnly
                            value={reducedPrice}
                            className="w-full px-3 py-2 rounded border border-border bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                        />
                    )}

                    {/* range */}

                    {priceMode === "range" && discountPercentage > 0 && hasPrice && (
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                readOnly
                                value={reducedMinPrice}
                                className="w-full px-3 py-2 rounded border border-border bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                            />
                            <input
                                readOnly
                                value={reducedMaxPrice}
                                className="w-full px-3 py-2 rounded border border-border bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                            />
                        </div>
                    )}
                    {/* ── In Stock toggle ── */}
                    <div className="border border-border rounded-lg p-4 bg-slate-50 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-text_normal">In Stock</p>
                            <p className="text-xs text-text_normal/60 mt-0.5">Toggle off if this product is currently unavailable.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setInStock((prev) => !prev)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none
                                ${inStock ? "bg-primary" : "bg-gray-300"}`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
                                    ${inStock ? "translate-x-6" : "translate-x-1"}`}
                            />
                        </button>
                    </div>

                    {/* ── Featured & Best Selling toggles ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Featured */}
                        <div className="border border-border rounded-lg p-4 bg-slate-50 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-text_normal">Featured</p>
                                <p className="text-xs text-text_normal/60 mt-0.5">Toggle on if this product should appear as featured.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsFeatured((prev) => !prev)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none
                ${isFeatured ? "bg-primary" : "bg-gray-300"}`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
                    ${isFeatured ? "translate-x-6" : "translate-x-1"}`}
                                />
                            </button>
                        </div>

                        {/* Best Selling */}
                        <div className="border border-border rounded-lg p-4 bg-slate-50 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-text_normal">Best Selling</p>
                                <p className="text-xs text-text_normal/60 mt-0.5">Toggle on if this product is a top seller.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsBestSelling((prev) => !prev)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none
                ${isBestSelling ? "bg-primary" : "bg-gray-300"}`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
                    ${isBestSelling ? "translate-x-6" : "translate-x-1"}`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* ── Product Mode Selector ── */}
                    <div className="border border-border rounded-lg p-4 bg-slate-50">
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
                                    className={`flex flex-col items-start px-4 py-2.5 rounded-lg border text-left transition
                                        ${
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

                    {/* ── Variants Table (thobe / t-shirt) ── */}
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

                            <p className="text-xs text-text_normal/60 -mt-1">
                                Set per-variant measurements. Size is required. Leave Price blank to use the base price above.
                            </p>

                            <div className="overflow-x-auto rounded-lg border border-border">
                                <table className="w-full text-sm text-left text-text_normal">
                                    <thead className="bg-slate-100 text-xs uppercase text-text_normal/70">
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
                                                {/* Size */}
                                                <td className="px-3 py-2 w-24">
                                                    <select
                                                        value={variant.size}
                                                        onChange={(e) => updateVariant(index, "size", e.target.value)}
                                                        className="w-full px-2 py-1.5 rounded border border-border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                                    >
                                                        {SIZE_OPTIONS.map((s) => (
                                                            <option key={s} value={s}>
                                                                {s}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>

                                                {/* Color */}
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="text"
                                                        value={variant.color}
                                                        onChange={(e) => updateVariant(index, "color", e.target.value)}
                                                        placeholder="e.g. White"
                                                        className="w-full px-2 py-1.5 rounded border border-border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                                    />
                                                </td>

                                                {/* Chest */}
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="number"
                                                        value={variant.chest}
                                                        onChange={(e) =>
                                                            updateVariant(index, "chest", e.target.value === "" ? "" : Number(e.target.value))
                                                        }
                                                        placeholder="e.g. 30"
                                                        className="w-full px-2 py-1.5 rounded border border-border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                                    />
                                                </td>

                                                {/* Length */}
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="number"
                                                        value={variant.length}
                                                        onChange={(e) =>
                                                            updateVariant(index, "length", e.target.value === "" ? "" : Number(e.target.value))
                                                        }
                                                        placeholder="e.g. 52"
                                                        className="w-full px-2 py-1.5 rounded border border-border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                                    />
                                                </td>

                                                {/* Per-variant price */}
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="number"
                                                        value={variant.price}
                                                        onChange={(e) =>
                                                            updateVariant(index, "price", e.target.value === "" ? "" : Number(e.target.value))
                                                        }
                                                        placeholder={price ? String(price) : "—"}
                                                        className="w-full px-2 py-1.5 rounded border border-border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                                    />
                                                </td>

                                                {/* Remove */}
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

                            <p className="text-xs text-text_normal/60 -mt-1">
                                Add ml options with their individual prices. Both fields are required.
                            </p>

                            <div className="overflow-x-auto rounded-lg border border-border">
                                <table className="w-full text-sm text-left text-text_normal">
                                    <thead className="bg-slate-100 text-xs uppercase text-text_normal/70">
                                        <tr>
                                            <th className="px-3 py-2">Volume (ml) *</th>
                                            <th className="px-3 py-2">Price *</th>
                                            <th className="px-3 py-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {attarSizes.map((attar, index) => (
                                            <tr key={index} className="bg-white">
                                                {/* ml */}
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="number"
                                                        value={attar.ml}
                                                        onChange={(e) =>
                                                            updateAttarSize(index, "ml", e.target.value === "" ? "" : Number(e.target.value))
                                                        }
                                                        placeholder="e.g. 3"
                                                        className="w-full px-2 py-1.5 rounded border border-border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                                    />
                                                </td>

                                                {/* price */}
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="number"
                                                        value={attar.price}
                                                        onChange={(e) =>
                                                            updateAttarSize(index, "price", e.target.value === "" ? "" : Number(e.target.value))
                                                        }
                                                        placeholder="e.g. 150"
                                                        className="w-full px-2 py-1.5 rounded border border-border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                                    />
                                                </td>

                                                {/* Remove */}
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
                    <div className="border border-border rounded-lg p-4 bg-slate-50 space-y-4">
                        <p className="text-sm font-medium text-text_normal">Delivery Charge</p>

                        {/* Regular Delivery */}
                        <div>
                            <label className="block mb-1 text-sm font-medium text-text_normal">Regular Delivery Charge</label>

                            <input
                                type="number"
                                value={regularCharge}
                                onChange={(e) => setRegularCharge(e.target.value === "" ? "" : Number(e.target.value))}
                                placeholder="Default 120"
                                className="w-full px-3 py-2 rounded border border-border bg-slate-100
                                    focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                            />
                        </div>

                        {/* Special Delivery */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-text_normal">Special City</label>

                                <input
                                    type="text"
                                    value={specialCity}
                                    onChange={(e) => setSpecialCity(e.target.value)}
                                    placeholder="e.g. Dhaka"
                                    className="w-full px-3 py-2 rounded border border-border bg-slate-100
                focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium text-text_normal">Special Delivery Charge</label>

                                <input
                                    type="number"
                                    value={specialCharge}
                                    onChange={(e) => setSpecialCharge(e.target.value === "" ? "" : Number(e.target.value))}
                                    placeholder="e.g. 60"
                                    className="w-full px-3 py-2 rounded border border-border bg-slate-100
                focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                                />
                            </div>
                        </div>
                    </div>
                    {/* ── Submit ── */}
                    <div className="flex justify-end pt-4 border-t border-border">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-primary text-text_light rounded-lg hover:bg-selected transition active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Adding Product..." : "Add Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;
