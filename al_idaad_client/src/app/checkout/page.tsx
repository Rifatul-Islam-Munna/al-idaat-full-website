"use client";

import { useAuth } from "@/components/shared/AuthContext";
import { CartItem, useCart } from "@/components/shared/CartContext";
import { createGtmEventId, getGtmUserMeta, initiateCheckoutEvent, purchaseEvent } from "@/utils/google-tag-manager";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
    fullName: string;
    phone: string;
    altPhone: string;
    address: string;
    city: string;
    district: string;
    note: string;
}

const INITIAL_FORM: FormData = {
    fullName: "",
    phone: "",
    altPhone: "",
    address: "",
    city: "",
    district: "",
    note: "",
};

const getTrackingVariant = (item: CartItem) => {
    if (item.selectedVariant) {
        return {
            size: item.selectedVariant.size,
            color: item.selectedVariant.color,
        };
    }

    if (item.selectedAttarSize) {
        return {
            size: `${item.selectedAttarSize.ml} ml`,
        };
    }

    return undefined;
};

// ─── Success Screen ───────────────────────────────────────────────────────────

// ✅ Now accepts both trackingCode (from Steadfast) and orderId (MongoDB fallback)
const OrderSuccess = ({
    trackingCode,
    orderId,
    steadfastSuccess,
    showProfileLink,
}: {
    trackingCode: string;
    orderId: string;
    steadfastSuccess: boolean;
    showProfileLink: boolean;
}) => (
    <div className="min-h-screen bg-bg_main flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <svg
                    className="w-12 h-12 text-green-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>
            <h1 className="text-2xl font-bold text-text_normal mb-2">Order Placed!</h1>

            {/* ✅ Show Steadfast tracking code as the primary identifier */}
            {steadfastSuccess && trackingCode ? (
                <>
                    <p className="text-gray-500 text-sm mb-1">Your tracking code is</p>
                    <p className="font-mono font-bold text-brand text-lg mb-1">{trackingCode}</p>
                    <p className="text-xs text-gray-400 mb-4">
                        Use this to track your delivery on{" "}
                        <a
                            href={`https://steadfast.com.bd/t/${trackingCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand underline"
                        >
                            steadfast.com.bd
                        </a>
                    </p>
                </>
            ) : (
                <>
                    {/* ✅ Steadfast failed — show DB order ID as fallback */}
                    <p className="text-gray-500 text-sm mb-1">Your order ID is</p>
                    <p className="font-mono font-bold text-brand text-lg mb-4">{orderId}</p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-left text-xs text-yellow-800">
                        Your order was saved successfully. Courier tracking will be assigned shortly — we will contact you to confirm.
                    </div>
                </>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-left">
                <div className="flex gap-3">
                    <svg
                        className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <div>
                        <p className="text-sm font-semibold text-amber-800 mb-0.5">Cash on Delivery</p>
                        <p className="text-xs text-amber-700 leading-relaxed">
                            Please have the exact amount ready when our delivery agent arrives. We will contact you on your provided number to confirm
                            delivery.
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
                <Link
                    href="/all-products"
                    className="flex-1 bg-brand text-white text-center py-3 rounded-xl font-semibold hover:opacity-90 active:scale-95 transition duration-150 text-sm"
                >
                    Continue Shopping
                </Link>
                <Link
                    href={showProfileLink ? "/profile" : "/"}
                    className="flex-1 border border-border text-text_normal text-center py-3 rounded-xl font-semibold hover:bg-gray-50 active:scale-95 transition duration-150 text-sm"
                >
                    {showProfileLink ? "View Profile" : "Go Home"}
                </Link>
            </div>
        </div>
    </div>
);

// ─── Checkout Page ────────────────────────────────────────────────────────────

const CheckoutPage = () => {
    const { user, authFetch, loading: authLoading } = useAuth();
    const { items, totalPrice, totalQty, clearCart, increaseQty, decreaseQty, removeItem } = useCart();
    const [formDraft, setFormDraft] = useState<Partial<FormData>>({});
    const [errors, setErrors] = useState<Partial<FormData>>({});
    const [loading, setLoading] = useState(false);

    // ✅ Store tracking info separately instead of a single orderId string
    const [orderResult, setOrderResult] = useState<{
        orderId: string;
        trackingCode: string;
        steadfastSuccess: boolean;
    } | null>(null);

    const form = useMemo<FormData>(
        () => ({
            fullName: formDraft.fullName ?? user?.name ?? INITIAL_FORM.fullName,
            phone: formDraft.phone ?? user?.phone ?? INITIAL_FORM.phone,
            altPhone: formDraft.altPhone ?? INITIAL_FORM.altPhone,
            address: formDraft.address ?? user?.address ?? INITIAL_FORM.address,
            city: formDraft.city ?? user?.city ?? INITIAL_FORM.city,
            district: formDraft.district ?? user?.district ?? INITIAL_FORM.district,
            note: formDraft.note ?? INITIAL_FORM.note,
        }),
        [formDraft, user],
    );
    const checkoutTrackedRef = useRef(false);

    useEffect(() => {
        if (authLoading || checkoutTrackedRef.current || orderResult || items.length === 0) {
            return;
        }

        checkoutTrackedRef.current = true;

        void initiateCheckoutEvent({
            event_id: createGtmEventId(),
            ...getGtmUserMeta(user),
            items: items.map((item) => ({
                productId: item._id,
                name: item.name,
                category: item.category.name,
                unitPrice: item.price,
                quantity: item.quantity,
                variant: getTrackingVariant(item),
            })),
        });
    }, [authLoading, items, orderResult, user]);

    if (items.length === 0 && !orderResult) {
        return (
            <div className="min-h-screen bg-bg_main flex items-center justify-center px-4">
                <div className="text-center">
                    <svg
                        className="w-16 h-16 text-gray-300 mx-auto mb-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="8" cy="21" r="1" />
                        <circle cx="19" cy="21" r="1" />
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    </svg>
                    <h2 className="text-xl font-bold text-text_normal mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 text-sm mb-6">Add some products before checking out.</p>
                    <Link
                        href="/all-products"
                        className="bg-brand text-white px-6 py-2.5 rounded-xl font-semibold hover:opacity-90 transition text-sm"
                    >
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    // ✅ Show success screen with tracking info
    if (orderResult) {
        return (
            <OrderSuccess
                trackingCode={orderResult.trackingCode}
                orderId={orderResult.orderId}
                steadfastSuccess={orderResult.steadfastSuccess}
                showProfileLink={Boolean(user)}
            />
        );
    }

    // Per-item: check if user's district matches the product's special city → use special charge, else regular
    const getItemDeliveryCharge = (item: CartItem, district: string): number => {
        if (!district.trim()) return item.deliveryCharge.regular.charge;
        const userDistrict = district.toLowerCase().trim();
        const specialCity = item.deliveryCharge.special.city.toLowerCase().trim();
        return userDistrict.includes(specialCity) || specialCity.includes(userDistrict)
            ? item.deliveryCharge.special.charge
            : item.deliveryCharge.regular.charge;
    };

    // For a single shipment to one address, use the highest charge across all items
    const deliveryCharge = items.length > 0 ? Math.max(...items.map((item) => getItemDeliveryCharge(item, form.district))) : 0;

    // total price
    const grandTotal = totalPrice + deliveryCharge;

    const validate = (): boolean => {
        const newErrors: Partial<FormData> = {};
        if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
        if (!form.phone.trim()) newErrors.phone = "Phone number is required";
        else if (!/^(?:\+8801|01)[3-9]\d{8}$/.test(form.phone.replace(/\s/g, ""))) newErrors.phone = "Enter a valid Bangladeshi number";
        if (!form.address.trim()) newErrors.address = "Address is required";
        if (!form.city.trim()) newErrors.city = "City is required";
        if (!form.district.trim()) newErrors.district = "District is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormDraft((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormData]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async () => {
        if (!validate()) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);
        try {
            const orderItems = items.map((item) => {
                const base = {
                    productId: item._id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    thumbnail: item.thumbnail,
                };
                if (item.selectedVariant) {
                    return { ...base, variant: item.selectedVariant };
                }
                if (item.selectedAttarSize) {
                    return { ...base, attarSize: item.selectedAttarSize };
                }
                return base;
            });

            const orderPayload = {
                fullName: form.fullName,
                phone: form.phone,
                altPhone: form.altPhone || undefined,
                address: form.address,
                city: form.city,
                district: form.district,
                note: form.note || undefined,
                items: orderItems,
                subtotal: totalPrice,
                deliveryCharge,
                grandTotal,
                paymentMethod: "cash_on_delivery",
            };

            const res = user
                ? await authFetch("/orders", {
                      method: "POST",
                      body: JSON.stringify(orderPayload),
                  })
                : await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(orderPayload),
                  });

            const data = await res.json();

            if (!res.ok) {
                const serverMessage =
                    data?.message ||
                    data?.error ||
                    (Array.isArray(data?.errors)
                        ? data.errors.map((e: { msg?: string; message?: string }) => e.msg ?? e.message).join(", ")
                        : null) ||
                    "Order failed. Please try again.";
                toast.error(serverMessage);
                return;
            }

            // ✅ Extract tracking_code and orderId from the updated backend response shape:
            // { success: true, data: { orderId, tracking_code, consignment_id, steadfastSuccess } }
            const { orderId, tracking_code, steadfastSuccess } = data.data;
            const resolvedOrderId = orderId ?? `ORD-${Date.now()}`;

            void purchaseEvent({
                event_id: createGtmEventId(),
                ...getGtmUserMeta(user),
                orderId: resolvedOrderId,
                orderTotal: grandTotal,
                totalDiscount: 0,
                shipping: deliveryCharge,
                products: items.map((item) => ({
                    productId: item._id,
                    name: item.name,
                    category: item.category.name,
                    unitPrice: item.price,
                    quantity: item.quantity,
                    totalPrice: item.price * item.quantity,
                    variant: getTrackingVariant(item),
                })),
            });

            clearCart();
            setOrderResult({
                orderId: resolvedOrderId,
                trackingCode: tracking_code ?? "",
                steadfastSuccess: steadfastSuccess ?? false,
            });
        } catch {
            toast.error("Something went wrong. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-bg_main pt-24 md:pt-32 pb-16 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <Link
                        href="/all-products"
                        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-text_normal transition mb-4"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                        Continue Shopping
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-bold text-text_normal">Checkout</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {totalQty} item{totalQty > 1 ? "s" : ""} in your cart
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
                    {/* ── LEFT ── */}
                    <div className="space-y-5">
                        <section className="bg-white rounded-2xl border border-border p-6">
                            <h2 className="font-bold text-text_normal mb-5 flex items-center gap-2">
                                <span className="w-6 h-6 bg-brand text-white rounded-full text-xs flex items-center justify-center font-bold">1</span>
                                Delivery Information
                            </h2>
                            <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${user ? "border-green-200 bg-green-50 text-green-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                                {user
                                    ? "You are checking out with your account. This order will appear in your profile purchase history."
                                    : "Guest checkout is still available. Log in if you want this order saved to your purchase history and wishlist account."}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={form.fullName}
                                        onChange={handleChange}
                                        placeholder="e.g. Abdullah Al Mamun"
                                        className={`w-full px-4 py-2.5 rounded-xl border text-sm text-text_normal placeholder:text-gray-400 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 ${errors.fullName ? "border-red-400 bg-red-50" : "border-border bg-gray-50"}`}
                                    />
                                    {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="01XXXXXXXXX"
                                        className={`w-full px-4 py-2.5 rounded-xl border text-sm text-text_normal placeholder:text-gray-400 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 ${errors.phone ? "border-red-400 bg-red-50" : "border-border bg-gray-50"}`}
                                    />
                                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                        Alternative Phone <span className="text-gray-400 font-normal">(optional)</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="altPhone"
                                        value={form.altPhone}
                                        onChange={handleChange}
                                        placeholder="01XXXXXXXXX"
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 text-sm text-text_normal placeholder:text-gray-400 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                        Full Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        placeholder="House no, road, area"
                                        className={`w-full px-4 py-2.5 rounded-xl border text-sm text-text_normal placeholder:text-gray-400 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 ${errors.address ? "border-red-400 bg-red-50" : "border-border bg-gray-50"}`}
                                    />
                                    {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                        City / Thana <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={form.city}
                                        onChange={handleChange}
                                        placeholder="e.g. Dhaka, Mirpur"
                                        className={`w-full px-4 py-2.5 rounded-xl border text-sm text-text_normal placeholder:text-gray-400 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 ${errors.city ? "border-red-400 bg-red-50" : "border-border bg-gray-50"}`}
                                    />
                                    {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                        District <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="district"
                                        value={form.district}
                                        onChange={handleChange}
                                        placeholder="e.g. Dhaka, Chattogram"
                                        className={`w-full px-4 py-2.5 rounded-xl border text-sm text-text_normal placeholder:text-gray-400 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 ${errors.district ? "border-red-400 bg-red-50" : "border-border bg-gray-50"}`}
                                    />
                                    {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                        Order Note <span className="text-gray-400 font-normal">(optional)</span>
                                    </label>
                                    <textarea
                                        name="note"
                                        value={form.note}
                                        onChange={handleChange}
                                        rows={2}
                                        placeholder="Any special instructions for delivery..."
                                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 text-sm text-text_normal placeholder:text-gray-400 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 resize-none"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="bg-white rounded-2xl border border-border p-6">
                            <h2 className="font-bold text-text_normal mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 bg-brand text-white rounded-full text-xs flex items-center justify-center font-bold">2</span>
                                Payment Method
                            </h2>
                            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                                <div className="w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center shrink-0">
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-green-800">Cash on Delivery</p>
                                    <p className="text-xs text-green-700">Pay when your order arrives at your door</p>
                                </div>
                                <svg
                                    className="w-8 h-8 text-green-600 ml-auto shrink-0"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect x="2" y="6" width="20" height="12" rx="2" />
                                    <path d="M22 10H2M7 15h.01M11 15h2" />
                                </svg>
                            </div>
                        </section>
                    </div>

                    {/* ── RIGHT ── */}
                    <div>
                        <section className="bg-white rounded-2xl border border-border p-5 sticky top-32">
                            <h2 className="font-bold text-text_normal mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 bg-brand text-white rounded-full text-xs flex items-center justify-center font-bold">3</span>
                                Order Summary
                            </h2>

                            <div className="space-y-4 mb-4 max-h-105 overflow-y-auto custom-scrollbar pr-1">
                                {items.map((item) => {
                                    const subtitle = item.selectedVariant
                                        ? [item.selectedVariant.size, item.selectedVariant.color].filter(Boolean).join(" · ")
                                        : item.selectedAttarSize
                                          ? `${item.selectedAttarSize.ml} ml`
                                          : null;

                                    return (
                                        <div key={item.cartKey} className="flex gap-3">
                                            {/* Thumbnail */}
                                            <div className="relative w-14 shrink-0">
                                                <Image
                                                    src={item.thumbnail}
                                                    alt={item.name}
                                                    width={56}
                                                    height={84}
                                                    className="w-14 rounded-lg object-cover"
                                                    style={{ aspectRatio: "2/3" }}
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-1">
                                                    <p className="text-sm font-semibold text-text_normal leading-tight truncate flex-1">
                                                        {item.name}
                                                    </p>
                                                    {/* Remove button */}
                                                    <button
                                                        onClick={() => removeItem(item.cartKey)}
                                                        className="shrink-0 w-5 h-5 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition ml-1"
                                                        aria-label="Remove item"
                                                    >
                                                        <svg
                                                            width="9"
                                                            height="9"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="3"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <line x1="18" y1="6" x2="6" y2="18" />
                                                            <line x1="6" y1="6" x2="18" y2="18" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-0.5">{item.category.name}</p>
                                                {subtitle && (
                                                    <span className="inline-block mt-0.5 text-[10px] font-semibold bg-brand/10 text-brand px-2 py-0.5 rounded-full">
                                                        {subtitle}
                                                    </span>
                                                )}

                                                {/* Qty controls + price */}
                                                <div className="flex items-center justify-between mt-2">
                                                    {/* Qty stepper */}
                                                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                                                        <button
                                                            onClick={() => decreaseQty(item.cartKey)}
                                                            className="w-6 h-6 rounded-md bg-white shadow-sm flex items-center justify-center hover:bg-red-50 hover:text-red-500 active:scale-90 transition"
                                                            aria-label="Decrease quantity"
                                                        >
                                                            <svg
                                                                width="10"
                                                                height="10"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="3"
                                                                strokeLinecap="round"
                                                            >
                                                                <line x1="5" y1="12" x2="19" y2="12" />
                                                            </svg>
                                                        </button>
                                                        <span className="w-6 text-center text-xs font-bold text-text_normal">{item.quantity}</span>
                                                        <button
                                                            onClick={() => increaseQty(item.cartKey)}
                                                            className="w-6 h-6 rounded-md bg-white shadow-sm flex items-center justify-center hover:bg-green-50 hover:text-green-600 active:scale-90 transition"
                                                            aria-label="Increase quantity"
                                                        >
                                                            <svg
                                                                width="10"
                                                                height="10"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="3"
                                                                strokeLinecap="round"
                                                            >
                                                                <line x1="12" y1="5" x2="12" y2="19" />
                                                                <line x1="5" y1="12" x2="19" y2="12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <p className="text-sm font-bold text-brand">৳ {(item.price * item.quantity).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="border-t border-border pt-4 space-y-2.5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-semibold text-text_normal">৳ {totalPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 flex items-center gap-1">
                                        Delivery Charge
                                        {form.district &&
                                            items.length > 0 &&
                                            (() => {
                                                const maxItem = items.reduce((a, b) =>
                                                    getItemDeliveryCharge(a, form.district) >= getItemDeliveryCharge(b, form.district) ? a : b,
                                                );
                                                const isSpecial = form.district
                                                    .toLowerCase()
                                                    .trim()
                                                    .includes(maxItem.deliveryCharge.special.city.toLowerCase().trim());
                                                return (
                                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                                                        {isSpecial ? `Inside ${maxItem.deliveryCharge.special.city}` : "Outside special zone"}
                                                    </span>
                                                );
                                            })()}
                                    </span>
                                    <span className="font-semibold text-text_normal">৳ {deliveryCharge}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold border-t border-border pt-2.5">
                                    <span className="text-text_normal">Total</span>
                                    <span className="text-brand">৳ {grandTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="mt-5 w-full bg-brand text-white py-3.5 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Placing Order...
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        Place Order
                                    </>
                                )}
                            </button>

                            <p className="text-center text-xs text-gray-400 mt-3">
                                By placing your order you agree to our{" "}
                                <Link href="/terms" className="text-brand hover:underline">
                                    Terms & Conditions
                                </Link>
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CheckoutPage;
