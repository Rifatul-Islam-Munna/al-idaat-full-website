"use client";

import { useState } from "react";
import { ProductType } from "@/utils/types";
import VariantSelectorModal from "./VariantSelectorModal";
import toast from "react-hot-toast";
import { useCart } from "@/components/shared/CartContext";
import { buildCartKey, calculateReducedPrice } from "@/utils/helper";

const ButtonContainer = ({ product }: { product: ProductType }) => {
    const { addItem, isInCart } = useCart();
    const [modalOpen, setModalOpen] = useState(false);

    const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
    const hasAttarSizes = Array.isArray(product.attarSizes) && product.attarSizes.length > 0;
    const needsSelection = hasVariants || hasAttarSizes;

    const plainCartKey = buildCartKey(product);
    const plainInCart = !needsSelection && isInCart(plainCartKey);

    const handleClick = () => {
        if (needsSelection) {
            setModalOpen(true);
        } else {
            const resolvedPrice = product.discountPercentage ? calculateReducedPrice(product.price, product.discountPercentage) : product.price;
            addItem({ product, resolvedPrice });
            toast.success("Added to cart 🛒");
        }
    };

    return (
        <>
            <button
                onClick={handleClick}
                title={needsSelection ? "Select options" : plainInCart ? "Add one more" : "Add to cart"}
                className={`relative transition duration-150 active:scale-90
                    ${plainInCart ? "text-brand" : "text-text_dark hover:text-text_light"}`}
            >
                <span className="relative inline-flex">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill={plainInCart ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="8" cy="21" r="1" />
                        <circle cx="19" cy="21" r="1" />
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    </svg>

                    {needsSelection && (
                        <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-brand text-white rounded-full flex items-center justify-center">
                            <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                        </span>
                    )}
                </span>
            </button>

            {/*
             * ✅ key={modalOpen ? product._id : ""}
             * When modalOpen flips true → key changes → React REMOUNTS the modal
             * with fresh useState values. No useEffect reset needed at all.
             */}
            <VariantSelectorModal
                key={modalOpen ? product._id : ""}
                product={product}
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                text="Add to Cart"
            />
        </>
    );
};

export default ButtonContainer;
