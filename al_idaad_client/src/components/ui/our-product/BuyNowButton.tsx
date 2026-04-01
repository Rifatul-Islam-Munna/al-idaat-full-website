"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductType } from "@/utils/types";
import VariantSelectorModal from "./VariantSelectorModal";
import toast from "react-hot-toast";
import { calculateReducedPrice } from "@/utils/helper";
import { useCart } from "@/components/shared/CartContext";

const BuyNowButton = ({ product }: { product: ProductType }) => {
    const router = useRouter();
    const { addItem } = useCart();
    const [modalOpen, setModalOpen] = useState(false);

    const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
    const hasAttarSizes = Array.isArray(product.attarSizes) && product.attarSizes.length > 0;
    const needsSelection = hasVariants || hasAttarSizes;

    const handleClick = () => {
        if (needsSelection) {
            // Open the modal; after user picks a variant, onAfterAdd will redirect
            setModalOpen(true);
        } else {
            // No selection needed — add immediately and go to checkout
            const resolvedPrice = product.discountPercentage ? calculateReducedPrice(product.price, product.discountPercentage) : product.price;
            addItem({ product, resolvedPrice });
            toast.success("Added to cart 🛒");
            router.push("/checkout");
        }
    };

    const handleAfterAdd = () => {
        // Called by VariantSelectorModal after it successfully adds the item
        router.push("/checkout");
    };

    return (
        <>
            <button
                onClick={handleClick}
                title="Buy now"
                className="flex items-center gap-2 px-4 py-2 rounded bg-brand text-white text-sm font-semibold
                           hover:opacity-90 active:scale-95 transition duration-150"
            >
                {/* Lightning bolt icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                Buy Now
            </button>

            {/*
             * Same re-key trick as ButtonContainer: remounting resets all
             * useState values in the modal without any useEffect.
             * onAfterAdd is called by the modal right after addItem succeeds,
             * giving us the hook to redirect to /checkout.
             */}
            <VariantSelectorModal
                key={modalOpen ? product._id : ""}
                product={product}
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onAfterAdd={handleAfterAdd}
                text="Check Out"
            />
        </>
    );
};

export default BuyNowButton;
