"use client";

import { ProductType, ProductVariant, AttarSize } from "@/utils/types";
import { addToCartEvent, createGtmEventId, getGtmUserMeta } from "@/utils/google-tag-manager";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CartItem = {
    _id: string;
    name: string;
    thumbnail: string;
    category: { _id: string; name: string };

    // Resolved price for this exact selection
    price: number;
    quantity: number;

    // Set when a thobe variant was chosen
    selectedVariant?: ProductVariant;

    // Set when an attar ml size was chosen
    selectedAttarSize?: AttarSize;

    // Unique key: same product + different variant = different line item
    // "<productId>" | "<productId>__v_<size>_<color>" | "<productId>__a_<ml>ml"
    cartKey: string;

    // ✅ New
    deliveryCharge: {
        regular: { charge: number; city: "all" };
        special: { charge: number; city: string };
    };
};

export type AddItemPayload = {
    product: ProductType;
    selectedVariant?: ProductVariant;
    selectedAttarSize?: AttarSize;
    resolvedPrice: number;
};

interface CartContextValue {
    items: CartItem[];
    totalQty: number;
    totalPrice: number;
    addItem: (payload: AddItemPayload) => void;
    removeItem: (cartKey: string) => void;
    increaseQty: (cartKey: string) => void;
    decreaseQty: (cartKey: string) => void;
    clearCart: () => void;
    isInCart: (cartKey: string) => boolean;
    buildCartKey: (product: ProductType, variant?: ProductVariant, attarSize?: AttarSize) => string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "al_idaad_cart";

const loadCartFromStorage = (): CartItem[] => {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? (JSON.parse(stored) as CartItem[]) : [];
    } catch {
        localStorage.removeItem(STORAGE_KEY);
        return [];
    }
};

export const buildCartKey = (product: ProductType, variant?: ProductVariant, attarSize?: AttarSize): string => {
    if (variant) {
        const colorPart = variant.color ? `_${variant.color}` : "";
        return `${product._id}__v_${variant.size}${colorPart}`;
    }
    if (attarSize) {
        return `${product._id}__a_${attarSize.ml}ml`;
    }
    return product._id;
};

const getTrackingVariant = (selectedVariant?: ProductVariant, selectedAttarSize?: AttarSize) => {
    if (selectedVariant) {
        return {
            size: selectedVariant.size,
            color: selectedVariant.color,
        };
    }

    if (selectedAttarSize) {
        return {
            size: `${selectedAttarSize.ml} ml`,
        };
    }

    return undefined;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();

    // Lazy initializer — reads localStorage once, no cascading render
    const [items, setItems] = useState<CartItem[]>(loadCartFromStorage);

    // Write-only effect: sync to localStorage when state changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    // ── Derived ───────────────────────────────────────────────────────────────

    const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // ── Actions ───────────────────────────────────────────────────────────────

    const addItem = useCallback(({ product, selectedVariant, selectedAttarSize, resolvedPrice }: AddItemPayload) => {
        void addToCartEvent({
            event_id: createGtmEventId(),
            ...getGtmUserMeta(user),
            productId: product._id,
            slug: product.slug,
            name: product.name,
            brandName: product.brand,
            category: product.category.name,
            unitPrice: resolvedPrice,
            quantity: 1,
            variant: getTrackingVariant(selectedVariant, selectedAttarSize),
        });

        const cartKey = buildCartKey(product, selectedVariant, selectedAttarSize);
        setItems((prev) => {
            const existingIndex = prev.findIndex((i) => i.cartKey === cartKey);
            if (existingIndex !== -1) {
                return prev.map((item, idx) => (idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item));
            }
            const newItem: CartItem = {
                _id: product._id,
                name: product.name,
                thumbnail: product.thumbnail,
                category: product.category,
                price: resolvedPrice,
                quantity: 1,
                cartKey,
                deliveryCharge: product.deliveryCharge, // ✅ New
                ...(selectedVariant && { selectedVariant }),
                ...(selectedAttarSize && { selectedAttarSize }),
            };
            return [...prev, newItem];
        });
    }, [user]);

    const removeItem = useCallback((cartKey: string) => {
        setItems((prev) => prev.filter((item) => item.cartKey !== cartKey));
    }, []);

    const increaseQty = useCallback((cartKey: string) => {
        const item = items.find((entry) => entry.cartKey === cartKey);

        if (item) {
            void addToCartEvent({
                event_id: createGtmEventId(),
                ...getGtmUserMeta(user),
                productId: item._id,
                name: item.name,
                category: item.category.name,
                unitPrice: item.price,
                quantity: 1,
                variant: getTrackingVariant(item.selectedVariant, item.selectedAttarSize),
            });
        }

        setItems((prev) => prev.map((item) => (item.cartKey === cartKey ? { ...item, quantity: item.quantity + 1 } : item)));
    }, [items, user]);

    const decreaseQty = useCallback((cartKey: string) => {
        setItems((prev) =>
            prev.map((item) => (item.cartKey === cartKey ? { ...item, quantity: item.quantity - 1 } : item)).filter((item) => item.quantity > 0),
        );
    }, []);

    const clearCart = useCallback(() => setItems([]), []);

    const isInCart = useCallback((cartKey: string) => items.some((item) => item.cartKey === cartKey), [items]);

    return (
        <CartContext.Provider
            value={{
                items,
                totalQty,
                totalPrice,
                addItem,
                removeItem,
                increaseQty,
                decreaseQty,
                clearCart,
                isInCart,
                buildCartKey,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useCart = (): CartContextValue => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
    return ctx;
};
