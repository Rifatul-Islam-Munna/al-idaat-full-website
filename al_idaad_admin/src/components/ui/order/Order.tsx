"use client";

import { useAuth } from "@/components/shared/AuthContext";
import { api } from "@/libs/axios";
import { OrderType } from "@/libs/types";
import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ["pending", "processing", "delivered", "cancelled"];

const statusStyle: Record<string, { dot: string; badge: string; label: string }> = {
    pending: {
        dot: "bg-amber-400",
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        label: "Pending",
    },
    processing: {
        dot: "bg-blue-400",
        badge: "bg-blue-50 text-blue-700 border-blue-200",
        label: "Processing",
    },
    delivered: {
        dot: "bg-emerald-400",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        label: "Delivered",
    },
    cancelled: {
        dot: "bg-red-400",
        badge: "bg-red-50 text-red-700 border-red-200",
        label: "Cancelled",
    },
};

const getStatus = (s: string) =>
    statusStyle[s] ?? {
        dot: "bg-gray-400",
        badge: "bg-gray-50 text-gray-700 border-gray-200",
        label: s,
    };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(n);

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

// ─── Toast ────────────────────────────────────────────────────────────────────
type Toast = { id: number; msg: string; type: "success" | "error" };

const ToastContainer = ({ toasts }: { toasts: Toast[] }) => (
    <div className="fixed bottom-5 right-5 z-200 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
            <div
                key={t.id}
                className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-slide-up border
                    ${t.type === "success" ? "bg-white border-emerald-200 text-emerald-700" : "bg-white border-red-200 text-red-600"}`}
            >
                {t.type === "success" ? "✓ " : "✕ "}
                {t.msg}
            </div>
        ))}
    </div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonRow = () => (
    <tr className="border-b border-border">
        {Array.from({ length: 8 }).map((_, i) => (
            <td key={i} className="px-5 py-4">
                <div className="h-4 bg-bg_secondary rounded-md animate-pulse" style={{ width: `${60 + ((i * 13) % 40)}%` }} />
            </td>
        ))}
    </tr>
);

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteModal = ({
    order,
    onConfirm,
    onCancel,
    loading,
}: {
    order: OrderType;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}) => (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
        <div className="relative bg-white rounded shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="h-1 bg-red-500 w-full" />
            <div className="p-7">
                <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-5">
                    <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-text_dark mb-1">Delete Order</h3>
                <p className="text-sm text-text_normal mb-1">
                    You are about to permanently delete the order from <span className="font-semibold text-text_dark">{order.fullName}</span>.
                </p>
                <p className="text-xs text-text_normal bg-bg_secondary rounded-lg px-3 py-2 mt-3 font-mono">Order ID: {order._id}</p>
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-text_normal hover:bg-bg_secondary transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                Deleting…
                            </>
                        ) : (
                            "Delete Order"
                        )}
                    </button>
                </div>
            </div>
        </div>
    </div>
);

// ─── Edit Drawer ──────────────────────────────────────────────────────────────
type EditForm = {
    fullName: string;
    phone: string;
    altPhone: string;
    address: string;
    city: string;
    district: string;
    note: string;
    deliveryStatus: string;
    paymentMethod: string;
    steadfastTrackingCode: string;
    deliveryCharge: number;
};

const EditDrawer = ({
    order,
    onClose,
    onSave,
    loading,
}: {
    order: OrderType;
    onClose: () => void;
    onSave: (data: Partial<OrderType>) => void;
    loading: boolean;
}) => {
    const [form, setForm] = useState<EditForm>({
        fullName: order.fullName,
        phone: order.phone,
        altPhone: order.altPhone ?? "",
        address: order.address,
        city: order.city,
        district: order.district,
        note: order.note ?? "",
        deliveryStatus: order.deliveryStatus,
        paymentMethod: order.paymentMethod,
        steadfastTrackingCode: order.steadfastTrackingCode ?? "",
        deliveryCharge: order.deliveryCharge,
    });

    const set = (k: keyof EditForm, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

    const inputCls =
        "w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-white text-text_dark placeholder-[var(--color-text_light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors";

    const labelCls = "block text-xs font-semibold text-text_normal mb-1 uppercase tracking-wider";

    return (
        <div className="fixed inset-0 z-100 flex">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative ml-auto w-full max-w-lg bg-white h-full flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                    <div>
                        <h2 className="text-base font-semibold text-text_dark">Edit Order</h2>
                        <p className="text-xs text-text_normal mt-0.5 font-mono">{order._id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg_secondary text-text_normal transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
                    {/* Status + Payment */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Delivery Status</label>
                            <select value={form.deliveryStatus} onChange={(e) => set("deliveryStatus", e.target.value)} className={inputCls}>
                                {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Payment Method</label>
                            <input className={inputCls} value={form.paymentMethod} onChange={(e) => set("paymentMethod", e.target.value)} />
                        </div>
                    </div>

                    <hr className="border-border" />

                    {/* Customer */}
                    <div>
                        <p className="text-xs font-bold text-text_dark uppercase tracking-widest mb-3">Customer</p>
                        <div className="space-y-3">
                            <div>
                                <label className={labelCls}>Full Name</label>
                                <input className={inputCls} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Phone</label>
                                    <input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                                </div>
                                <div>
                                    <label className={labelCls}>Alt Phone</label>
                                    <input
                                        className={inputCls}
                                        value={form.altPhone}
                                        onChange={(e) => set("altPhone", e.target.value)}
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-border" />

                    {/* Shipping */}
                    <div>
                        <p className="text-xs font-bold text-text_dark uppercase tracking-widest mb-3">Shipping</p>
                        <div className="space-y-3">
                            <div>
                                <label className={labelCls}>Address</label>
                                <input className={inputCls} value={form.address} onChange={(e) => set("address", e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>City</label>
                                    <input className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} />
                                </div>
                                <div>
                                    <label className={labelCls}>District</label>
                                    <input className={inputCls} value={form.district} onChange={(e) => set("district", e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Delivery Charge (BDT)</label>
                                <input
                                    type="number"
                                    className={inputCls}
                                    value={form.deliveryCharge}
                                    onChange={(e) => set("deliveryCharge", Number(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="border-border" />

                    {/* Tracking */}
                    <div>
                        <p className="text-xs font-bold text-text_dark uppercase tracking-widest mb-3">Tracking</p>
                        <div>
                            <label className={labelCls}>Steadfast Tracking Code</label>
                            <input
                                className={inputCls}
                                value={form.steadfastTrackingCode}
                                onChange={(e) => set("steadfastTrackingCode", e.target.value)}
                                placeholder="Optional"
                            />
                        </div>
                    </div>

                    <hr className="border-border" />

                    {/* Note */}
                    <div>
                        <label className={labelCls}>Order Note</label>
                        <textarea
                            rows={3}
                            className={`${inputCls} resize-none`}
                            value={form.note}
                            onChange={(e) => set("note", e.target.value)}
                            placeholder="Optional note…"
                        />
                    </div>

                    {/* Items (read-only) */}
                    <div>
                        <p className="text-xs font-bold text-text_dark uppercase tracking-widest mb-3">Items ({order.items.length})</p>
                        <div className="space-y-2">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex gap-3 items-center bg-bg_secondary rounded-xl p-3">
                                    <Image
                                        src={item.thumbnail}
                                        alt={item.name}
                                        width={40}
                                        height={40}
                                        className="w-10 h-10 rounded-lg object-cover shrink-0 border border-border"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-text_dark truncate">{item.name}</p>
                                        <p className="text-xs text-text_normal">
                                            Qty: {item.quantity} · {fmt(item.price)}
                                            {item.attarSize && ` · ${item.attarSize.ml}ml`}
                                            {item.variant && ` · ${item.variant.size} / ${item.variant.color}`}
                                        </p>
                                    </div>
                                    <span className="text-sm font-semibold text-text_dark shrink-0">{fmt(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>
                        {/* Totals */}
                        <div className="mt-3 border border-border rounded-xl divide-y divide-border">
                            <div className="flex justify-between px-4 py-2.5 text-sm text-text_normal">
                                <span>Subtotal</span>
                                <span className="font-medium">{fmt(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between px-4 py-2.5 text-sm text-text_normal">
                                <span>Delivery</span>
                                <span className="font-medium">{fmt(form.deliveryCharge)}</span>
                            </div>
                            <div className="flex justify-between px-4 py-2.5 text-sm font-semibold text-text_dark">
                                <span>Grand Total</span>
                                <span>{fmt(order.subtotal + form.deliveryCharge)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-text_normal hover:bg-bg_secondary transition-colors"
                    >
                        Discard
                    </button>
                    <button
                        onClick={() => onSave(form)}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-selected text-white text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving…
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
    const s = getStatus(status);
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
        </span>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Order = () => {
    const { orders, ordersLoading, changeOrderKey } = useAuth();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const PER_PAGE = 10;

    const [deleteTarget, setDeleteTarget] = useState<OrderType | null>(null);
    const [editTarget, setEditTarget] = useState<OrderType | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);

    const [toasts, setToasts] = useState<Toast[]>([]);
    const toastId = useRef(0);

    const showToast = (msg: string, type: "success" | "error") => {
        const id = ++toastId.current;
        setToasts((p) => [...p, { id, msg, type }]);
        setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
    };

    useEffect(() => setPage(1), [search, statusFilter]);

    // ── Filter ─────────────────────────────────────────────────────────────────
    const filtered = (orders?.data ?? []).filter((o) => {
        const matchesStatus = statusFilter === "all" || o.deliveryStatus === statusFilter;
        const q = search.toLowerCase();
        const matchesSearch =
            !q ||
            o.fullName.toLowerCase().includes(q) ||
            o.phone.includes(q) ||
            o._id.toLowerCase().includes(q) ||
            o.district.toLowerCase().includes(q);
        return matchesStatus && matchesSearch;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    // ── Stats ──────────────────────────────────────────────────────────────────
    const all = orders?.data ?? [];
    const stats = {
        total: all.length,
        pending: all.filter((o) => o.deliveryStatus === "pending").length,
        processing: all.filter((o) => o.deliveryStatus === "processing").length,
        delivered: all.filter((o) => o.deliveryStatus === "delivered").length,
        cancelled: all.filter((o) => o.deliveryStatus === "cancelled").length,
        revenue: all.filter((o) => o.deliveryStatus !== "cancelled").reduce((s, o) => s + o.grandTotal, 0),
    };

    // ── Delete ─────────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await api.delete(`/orders/${deleteTarget._id}`);
            showToast("Order deleted successfully.", "success");
            changeOrderKey();
        } catch {
            showToast("Failed to delete order. Please try again.", "error");
        } finally {
            setDeleteLoading(false);
            setDeleteTarget(null);
        }
    };

    // ── Edit ───────────────────────────────────────────────────────────────────
    const handleEdit = async (data: Partial<OrderType>) => {
        if (!editTarget) return;
        setEditLoading(true);
        try {
            await api.put(`/orders/${editTarget._id}`, data);
            showToast("Order updated successfully.", "success");
            changeOrderKey();
        } catch {
            showToast("Failed to update order. Please try again.", "error");
        } finally {
            setEditLoading(false);
            setEditTarget(null);
        }
    };

    return (
        <>
            <style>{`
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up { animation: slide-up .25s ease forwards; }
            `}</style>

            <div className="min-h-[calc(100vh-132px)]  font-outfit">
                {/* ── Page Header ── */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text_normal mb-1">Management</p>
                        <h1 className="text-2xl md:text-3xl font-bold text-text_dark tracking-tight">Orders</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-text_normal">{orders?.count ?? 0} total orders</span>
                        <button
                            onClick={changeOrderKey}
                            className="p-2 rounded-xl border border-border bg-white hover:bg-bg_secondary text-text_normal transition-colors"
                            title="Refresh orders"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                    {[
                        { label: "Total", value: stats.total, color: "text-text_dark", bg: "bg-white" },
                        { label: "Pending", value: stats.pending, color: "text-amber-600", bg: "bg-amber-50" },
                        { label: "Processing", value: stats.processing, color: "text-blue-600", bg: "bg-blue-50" },
                        { label: "Delivered", value: stats.delivered, color: "text-emerald-600", bg: "bg-emerald-50" },
                        { label: "Cancelled", value: stats.cancelled, color: "text-red-500", bg: "bg-red-50" },
                        { label: "Revenue", value: fmt(stats.revenue), color: "text-[var(--color-primary)]", bg: "bg-white" },
                    ].map((s) => (
                        <div key={s.label} className={`rounded border border-border px-4 py-4 ${s.bg}`}>
                            <p className="text-xs text-text_normal mb-1 font-medium">{s.label}</p>
                            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* ── Filter Bar ── */}
                <div className="bg-white rounded border border-border mb-4 p-4 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text_light"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="#e6e6e6"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border text-text_dark focus:outline-none focus:border-primary transition-colors"
                            placeholder="Search by name, phone, ID, district…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-1 overflow-x-auto">
                        {["all", ...STATUS_OPTIONS].map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors
                                    ${statusFilter === s ? "bg-primary text-white" : "text-text_normal hover:bg-bg_secondary"}`}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="bg-white rounded border border-border h-[calc(100vh-418px)] custom-scrollbar overflow-y-auto">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-bg_secondary">
                                    {["Order", "Customer", "Items", "Total", "Payment", "Status", "Date", "Actions"].map((h) => (
                                        <th
                                            key={h}
                                            className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-text_normal whitespace-nowrap"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {ordersLoading ? (
                                    Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                                ) : pageData.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-5 py-16 text-center text-text_normal">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-bg_secondary flex items-center justify-center">
                                                    <svg
                                                        className="w-6 h-6 text-text_light"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={1.5}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                                        />
                                                    </svg>
                                                </div>
                                                <p className="text-sm font-medium">No orders found</p>
                                                <p className="text-xs text-text_light">Try adjusting your filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    pageData.map((order) => (
                                        <Fragment key={order._id}>
                                            <tr
                                                className={`border-b border-border hover:bg-bg_secondary/50 transition-colors group cursor-pointer
                                                    ${expandedId === order._id ? "bg-bg_secondary/30" : ""}`}
                                                onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                                            >
                                                {/* Order ID */}
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <svg
                                                            className={`w-3.5 h-3.5 text-text_normal transition-transform duration-200 shrink-0
                                                                ${expandedId === order._id ? "rotate-90" : ""}`}
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={2.5}
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                        </svg>
                                                        <span className="font-mono text-xs text-text_normal bg-bg_secondary px-2 py-0.5 rounded-md">
                                                            #{order._id.slice(-6).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </td>
                                                {/* Customer */}
                                                <td className="px-5 py-4">
                                                    <p className="font-medium text-text_dark">{order.fullName}</p>
                                                    <p className="text-xs text-text_normal mt-0.5">{order.phone}</p>
                                                    <p className="text-xs text-text_normal">{order.district}</p>
                                                </td>
                                                {/* Items */}
                                                <td className="px-5 py-4 text-text_normal">
                                                    <span className="font-medium text-text_dark">{order.items.length}</span>
                                                    <span className="text-xs ml-1">item{order.items.length !== 1 ? "s" : ""}</span>
                                                </td>
                                                {/* Total */}
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <p className="font-semibold text-text_dark">{fmt(order.grandTotal)}</p>
                                                    <p className="text-xs text-text_normal">+{fmt(order.deliveryCharge)} del.</p>
                                                </td>
                                                {/* Payment */}
                                                <td className="px-5 py-4">
                                                    <span className="text-xs font-medium text-text_normal bg-bg_secondary px-2 py-1 rounded-lg capitalize">
                                                        {order.paymentMethod}
                                                    </span>
                                                </td>
                                                {/* Status */}
                                                <td className="px-5 py-4">
                                                    <StatusBadge status={order.deliveryStatus} />
                                                </td>
                                                {/* Date */}
                                                <td className="px-5 py-4 whitespace-nowrap text-xs text-text_normal">{fmtDate(order.createdAt)}</td>
                                                {/* Actions */}
                                                <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => setEditTarget(order)}
                                                            className="p-1.5 rounded-lg hover:bg-blue-50 text-text_normal hover:text-blue-600 transition-colors"
                                                            title="Edit order"
                                                        >
                                                            <svg
                                                                className="w-4 h-4"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                                strokeWidth={2}
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteTarget(order)}
                                                            className="p-1.5 rounded-lg hover:bg-red-50 text-text_normal hover:text-red-500 transition-colors"
                                                            title="Delete order"
                                                        >
                                                            <svg
                                                                className="w-4 h-4"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                                strokeWidth={2}
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Expanded Detail Row */}
                                            {expandedId === order._id && (
                                                <tr key={`${order._id}-detail`} className="bg-bg_secondary/30 border-b border-border">
                                                    <td colSpan={8} className="px-5 py-5">
                                                        <div className="grid md:grid-cols-2 gap-4">
                                                            {/* Items list */}
                                                            <div>
                                                                {/* <p className="text-xs font-bold uppercase tracking-widest text-text_normal mb-3">
                                                                    Products
                                                                </p> */}
                                                                <div className="space-y-2">
                                                                    {order.items.map((item, i) => (
                                                                        <div
                                                                            key={i}
                                                                            className="flex gap-3 items-center bg-white rounded-xl p-3 border border-border"
                                                                        >
                                                                            <Image
                                                                                src={item.thumbnail}
                                                                                alt={item.name}
                                                                                width={36}
                                                                                height={36}
                                                                                className="w-9 h-9 rounded-lg object-cover border border-border"
                                                                            />
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-sm font-medium text-text_dark truncate">
                                                                                    {item.name}
                                                                                </p>
                                                                                <p className="text-xs text-text_normal">
                                                                                    ×{item.quantity}
                                                                                    {item.attarSize && ` · ${item.attarSize.ml}ml`}
                                                                                    {item.variant &&
                                                                                        ` · ${item.variant.size} / ${item.variant.color}`}
                                                                                </p>
                                                                            </div>
                                                                            <span className="text-sm font-semibold text-text_dark">
                                                                                {fmt(item.price * item.quantity)}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Details */}
                                                            <div className="space-y-3">
                                                                <div className="bg-white rounded-xl border border-border p-3">
                                                                    <p className="text-xs font-bold uppercase tracking-widest text-text_normal mb-2">
                                                                        Shipping Address
                                                                    </p>
                                                                    <p className="text-sm text-text_dark">{order.address}</p>
                                                                    <p className="text-xs text-text_normal mt-0.5">
                                                                        {order.city}, {order.district}
                                                                    </p>
                                                                    {order.altPhone && (
                                                                        <p className="text-xs text-text_normal mt-1">Alt: {order.altPhone}</p>
                                                                    )}
                                                                </div>
                                                                {order.steadfastTrackingCode && (
                                                                    <div className="bg-white rounded-xl border border-border p-3">
                                                                        <p className="text-xs font-bold uppercase tracking-widest text-text_normal mb-1">
                                                                            Tracking Code
                                                                        </p>
                                                                        <p className="text-sm font-mono text-text_dark">
                                                                            {order.steadfastTrackingCode}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {order.note && (
                                                                    <div className="bg-amber-50 rounded-xl border border-amber-100 p-3">
                                                                        <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-1">
                                                                            Customer Note
                                                                        </p>
                                                                        <p className="text-sm text-amber-800">{order.note}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Pagination ── */}
                    {!ordersLoading && filtered.length > PER_PAGE && (
                        <div className="flex items-center justify-between px-5 py-4 border-t border-border">
                            <p className="text-xs text-text_normal">
                                Showing{" "}
                                <span className="font-semibold text-text_dark">
                                    {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)}
                                </span>{" "}
                                of <span className="font-semibold text-text_dark">{filtered.length}</span>
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg border border-border text-text_normal hover:bg-bg_secondary disabled:opacity-40 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                                    .reduce<(number | "…")[]>((acc, n, i, arr) => {
                                        if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push("…");
                                        acc.push(n);
                                        return acc;
                                    }, [])
                                    .map((n, i) =>
                                        n === "…" ? (
                                            <span key={`e-${i}`} className="px-2 text-text_light text-sm">
                                                …
                                            </span>
                                        ) : (
                                            <button
                                                key={n}
                                                onClick={() => setPage(n as number)}
                                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
                                                    ${
                                                        page === n
                                                            ? "bg-primary text-white"
                                                            : "border border-border text-text_normal hover:bg-bg_secondary"
                                                    }`}
                                            >
                                                {n}
                                            </button>
                                        ),
                                    )}
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 rounded-lg border border-border text-text_normal hover:bg-bg_secondary disabled:opacity-40 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Modals ── */}
            {deleteTarget && (
                <DeleteModal order={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />
            )}
            {editTarget && <EditDrawer order={editTarget} onClose={() => setEditTarget(null)} onSave={handleEdit} loading={editLoading} />}

            <ToastContainer toasts={toasts} />
        </>
    );
};

export default Order;
