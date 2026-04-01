"use client";

import { useAuth } from "@/components/shared/AuthContext";
import { OrderType } from "@/libs/types";
import { useEffect, useState } from "react";

// ─── Animated Counter ─────────────────────────────────────────────────────────
const useCountUp = (target: number, duration = 1200) => {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (target === 0) return;
        let start: number | null = null;
        const step = (ts: number) => {
            if (!start) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
            else setValue(target);
        };
        requestAnimationFrame(step);
    }, [target, duration]);
    return value;
};

const CountUp = ({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) => {
    const animated = useCountUp(value);
    return (
        <>
            {prefix}
            {animated.toLocaleString()}
            {suffix}
        </>
    );
};

// ─── Mini Sparkline (CSS-only bars) ──────────────────────────────────────────
const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
    const max = Math.max(...data, 1);
    return (
        <div className="flex items-end gap-0.5 h-8">
            {data.map((v, i) => (
                <div
                    key={i}
                    className="flex-1 rounded-sm transition-all"
                    style={{
                        height: `${Math.max(8, (v / max) * 100)}%`,
                        background: color,
                        opacity: 0.3 + 0.7 * (i / (data.length - 1)),
                        animationDelay: `${i * 60}ms`,
                    }}
                />
            ))}
        </div>
    );
};

// ─── Status Badge (mini) ──────────────────────────────────────────────────────
const miniStatus: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    processing: "bg-blue-100 text-blue-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-600",
};
const MiniStatus = ({ s }: { s: string }) => (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${miniStatus[s] ?? "bg-gray-100 text-gray-600"}`}>
        {s}
    </span>
);

const fmt = (n: number) => new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(n);

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const DashBoard = () => {
    const { products, productCategories, orders, blog, ordersLoading, productsLoading } = useAuth();

    const allOrders: OrderType[] = orders?.data ?? [];

    // Revenue (non-cancelled)
    const revenue = allOrders.filter((o) => o.deliveryStatus !== "cancelled").reduce((s, o) => s + o.grandTotal, 0);

    // Status breakdown
    const statusCount = {
        pending: allOrders.filter((o) => o.deliveryStatus === "pending").length,
        processing: allOrders.filter((o) => o.deliveryStatus === "processing").length,
        delivered: allOrders.filter((o) => o.deliveryStatus === "delivered").length,
        cancelled: allOrders.filter((o) => o.deliveryStatus === "cancelled").length,
    };

    // Recent 5 orders
    const recentOrders = [...allOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

    // Orders per last 7 days (sparkline)
    const orderSparkline = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const ds = d.toDateString();
        return allOrders.filter((o) => new Date(o.createdAt).toDateString() === ds).length;
    });

    // Top selling products by order items
    const productSales: Record<string, { name: string; count: number; revenue: number }> = {};
    allOrders.forEach((o) => {
        o.items.forEach((item) => {
            if (!productSales[item.productId]) {
                productSales[item.productId] = { name: item.name, count: 0, revenue: 0 };
            }
            productSales[item.productId].count += item.quantity;
            productSales[item.productId].revenue += item.price * item.quantity;
        });
    });
    const topProducts = Object.values(productSales)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    const maxProductCount = Math.max(...topProducts.map((p) => p.count), 1);

    // Stat cards config
    const statCards = [
        {
            label: "Total Revenue",
            value: revenue,
            display: fmt(revenue),
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            ),
            gradient: "from-violet-500 to-purple-600",
            lightBg: "bg-violet-50",
            lightText: "text-violet-700",
            lightBorder: "border-violet-100",
            sparkData: orderSparkline.map((v) => v * 120),
            sparkColor: "#7c3aed",
            isRaw: true,
        },
        {
            label: "Total Orders",
            value: orders?.count ?? 0,
            display: String(orders?.count ?? 0),
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            ),
            gradient: "from-blue-500 to-cyan-500",
            lightBg: "bg-blue-50",
            lightText: "text-blue-700",
            lightBorder: "border-blue-100",
            sparkData: orderSparkline,
            sparkColor: "#3b82f6",
            isRaw: false,
        },
        {
            label: "Total Products",
            value: products?.count ?? 0,
            display: String(products?.count ?? 0),
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11" />
                </svg>
            ),
            gradient: "from-emerald-500 to-teal-500",
            lightBg: "bg-emerald-50",
            lightText: "text-emerald-700",
            lightBorder: "border-emerald-100",
            sparkData: [3, 5, 4, 7, 6, 8, products?.count ?? 0],
            sparkColor: "#10b981",
            isRaw: false,
        },
        {
            label: "Blog Posts",
            value: blog?.count ?? 0,
            display: String(blog?.count ?? 0),
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                </svg>
            ),
            gradient: "from-rose-500 to-pink-500",
            lightBg: "bg-rose-50",
            lightText: "text-rose-700",
            lightBorder: "border-rose-100",
            sparkData: [1, 2, 1, 3, 2, 4, blog?.count ?? 0],
            sparkColor: "#f43f5e",
            isRaw: false,
        },
        {
            label: "Categories",
            value: productCategories.length,
            display: String(productCategories.length),
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                </svg>
            ),
            gradient: "from-amber-500 to-orange-500",
            lightBg: "bg-amber-50",
            lightText: "text-amber-700",
            lightBorder: "border-amber-100",
            sparkData: [2, 3, 3, 4, 4, 5, productCategories.length],
            sparkColor: "#f59e0b",
            isRaw: false,
        },
    ];

    // Order status donut segments (SVG)
    const total = allOrders.length || 1;
    const donutData = [
        { label: "Delivered", count: statusCount.delivered, color: "#10b981" },
        { label: "Processing", count: statusCount.processing, color: "#3b82f6" },
        { label: "Pending", count: statusCount.pending, color: "#f59e0b" },
        { label: "Cancelled", count: statusCount.cancelled, color: "#ef4444" },
    ];
    const circumference = 2 * Math.PI * 36;
    let cumulative = 0;
    const donutSegments = donutData.map((d) => {
        const pct = d.count / total;
        const dash = pct * circumference;
        const gap = circumference - dash;
        const offset = circumference - cumulative * circumference;
        cumulative += pct;
        return { ...d, dash, gap, offset };
    });

    return (
        <>
            <style>{`
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes scale-in {
                    from { opacity: 0; transform: scale(0.94); }
                    to   { opacity: 1; transform: scale(1); }
                }
                .anim-fade-up { animation: fade-up 0.45s cubic-bezier(.22,1,.36,1) both; }
                .anim-scale-in { animation: scale-in 0.4s cubic-bezier(.22,1,.36,1) both; }
                @keyframes shimmer {
                    0%   { background-position: -400px 0; }
                    100% { background-position: 400px 0; }
                }
                .shimmer {
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 800px 100%;
                    animation: shimmer 1.4s infinite;
                }
            `}</style>

            <div className="h-[calc(100vh-132px)] overflow-y-auto custom-scrollbar pb-4 pr-2 font-(--font-outfit)">
                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-1 ms:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
                    {statCards.map((card, i) => (
                        <div
                            key={card.label}
                            className="anim-fade-up bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                            style={{ animationDelay: `${80 + i * 60}ms` }}
                        >
                            {/* Gradient top bar */}
                            <div className={`h-1 w-full bg-linear-to-r ${card.gradient}`} />

                            <div className="p-5">
                                {/* Icon + label */}
                                <div className="flex items-start justify-between mb-3">
                                    <div
                                        className={`w-9 h-9 rounded-xl ${card.lightBg} ${card.lightText} flex items-center justify-center border ${card.lightBorder}`}
                                    >
                                        {card.icon}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-text_normal">{card.label}</p>
                                    </div>
                                </div>

                                {/* Value */}
                                <div className="mb-3">
                                    {ordersLoading || productsLoading ? (
                                        <div className="h-8 w-24 rounded-lg shimmer" />
                                    ) : (
                                        <p className={`text-2xl font-bold ${card.lightText}`}>
                                            {card.isRaw ? <CountUp value={card.value} prefix="৳" /> : <CountUp value={card.value} />}
                                        </p>
                                    )}
                                </div>

                                {/* Sparkline */}
                                <Sparkline data={card.sparkData} color={card.sparkColor} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Row 2: Order Status + Recent Orders ── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
                    {/* Order Status Donut */}
                    <div
                        className="anim-fade-up lg:col-span-2 bg-white rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow"
                        style={{ animationDelay: "380ms" }}
                    >
                        <p className="text-xs font-bold uppercase tracking-widest text-text_normal mb-5">Order Status</p>

                        <div className="flex items-center gap-6">
                            {/* Donut SVG */}
                            <div className="relative shrink-0">
                                <svg width="100" height="100" viewBox="0 0 100 100">
                                    {/* bg circle */}
                                    <circle cx="50" cy="50" r="36" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                                    {donutSegments.map(
                                        (seg, i) =>
                                            seg.count > 0 && (
                                                <circle
                                                    key={i}
                                                    cx="50"
                                                    cy="50"
                                                    r="36"
                                                    fill="none"
                                                    stroke={seg.color}
                                                    strokeWidth="12"
                                                    strokeDasharray={`${seg.dash} ${seg.gap}`}
                                                    strokeDashoffset={seg.offset}
                                                    strokeLinecap="butt"
                                                    transform="rotate(-90 50 50)"
                                                    style={{ transition: "stroke-dasharray 0.6s ease" }}
                                                />
                                            ),
                                    )}
                                </svg>
                                {/* Centre label */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-lg font-bold text-text_dark">{allOrders.length}</span>
                                    <span className="text-[9px] uppercase tracking-wider text-text_normal font-semibold">orders</span>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="flex-1 space-y-2.5">
                                {donutData.map((d) => (
                                    <div key={d.label} className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: d.color }} />
                                            <span className="text-xs text-text_normal font-medium">{d.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-bg_secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-700"
                                                    style={{
                                                        width: `${(d.count / total) * 100}%`,
                                                        background: d.color,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-text_dark w-5 text-right">{d.count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div
                        className="anim-fade-up lg:col-span-3 bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
                        style={{ animationDelay: "440ms" }}
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <p className="text-xs font-bold uppercase tracking-widest text-text_normal">Recent Orders</p>
                            <span className="text-xs text-text_normal bg-bg_secondary px-2 py-0.5 rounded-full font-medium">Last 5</span>
                        </div>

                        {ordersLoading ? (
                            <div className="p-4 space-y-3">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-10 rounded-xl shimmer" />
                                ))}
                            </div>
                        ) : recentOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-text_normal">
                                <svg className="w-8 h-8 mb-2 text-text_light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <p className="text-sm">No orders yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {recentOrders.map((order, i) => (
                                    <div
                                        key={order._id}
                                        className="flex items-center gap-3 px-6 py-3 hover:bg-bg_secondary/50 transition-colors"
                                        style={{ animationDelay: `${500 + i * 50}ms` }}
                                    >
                                        {/* Avatar */}
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                            style={{
                                                background: ["#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"][i % 5],
                                            }}
                                        >
                                            {order.fullName.charAt(0).toUpperCase()}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-text_dark truncate">{order.fullName}</p>
                                            <p className="text-xs text-text_normal">
                                                {order.items.length} item{order.items.length !== 1 ? "s" : ""} · {order.district}
                                            </p>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-bold text-text_dark">{fmt(order.grandTotal)}</p>
                                            <p className="text-[10px] text-text_normal">{fmtDate(order.createdAt)}</p>
                                        </div>

                                        <MiniStatus s={order.deliveryStatus} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Row 3: Top Products + Quick Stats ── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    {/* Top Products */}
                    <div
                        className="anim-fade-up lg:col-span-3 bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
                        style={{ animationDelay: "500ms" }}
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <p className="text-xs font-bold uppercase tracking-widest text-text_normal">Top Selling Products</p>
                            <span className="text-xs text-text_normal bg-bg_secondary px-2 py-0.5 rounded-full font-medium">By units</span>
                        </div>

                        {topProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-text_normal">
                                <svg className="w-8 h-8 mb-2 text-text_light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V11" />
                                </svg>
                                <p className="text-sm">No sales data yet</p>
                            </div>
                        ) : (
                            <div className="p-6 space-y-4">
                                {topProducts.map((p, i) => {
                                    const barColors = ["#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
                                    return (
                                        <div key={i} className="group">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span
                                                        className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black text-white shrink-0"
                                                        style={{ background: barColors[i] }}
                                                    >
                                                        {i + 1}
                                                    </span>
                                                    <p className="text-sm font-medium text-text_dark truncate">{p.name}</p>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0 ml-2">
                                                    <span className="text-xs text-text_normal">{p.count} units</span>
                                                    <span className="text-xs font-bold text-text_dark">{fmt(p.revenue)}</span>
                                                </div>
                                            </div>
                                            <div className="h-2 bg-bg_secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-700 group-hover:opacity-80"
                                                    style={{
                                                        width: `${(p.count / maxProductCount) * 100}%`,
                                                        background: `linear-gradient(90deg, ${barColors[i]}cc, ${barColors[i]})`,
                                                        animationDelay: `${600 + i * 80}ms`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Quick Metrics */}
                    <div className="anim-fade-up lg:col-span-2 space-y-4" style={{ animationDelay: "560ms" }}>
                        {/* Avg Order Value */}
                        <div className="bg-linear-to-br from-primary to-selected rounded-2xl p-6 text-white hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-[11px] uppercase tracking-widest text-white/60 font-semibold mb-1">Avg. Order Value</p>
                                    <p className="text-2xl font-bold">
                                        {allOrders.length > 0
                                            ? fmt(Math.round(revenue / allOrders.filter((o) => o.deliveryStatus !== "cancelled").length || 0))
                                            : "৳0"}
                                    </p>
                                </div>
                                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-white rounded-full transition-all duration-700"
                                        style={{ width: `${Math.min(100, (statusCount.delivered / total) * 100)}%` }}
                                    />
                                </div>
                                <span className="text-xs text-white/70 font-medium">
                                    {Math.round((statusCount.delivered / total) * 100) || 0}% fulfilled
                                </span>
                            </div>
                        </div>

                        {/* Delivery charge collected */}
                        <div className="bg-white rounded-2xl border border-border p-5 hover:shadow-lg transition-shadow">
                            <p className="text-[11px] uppercase tracking-widest text-text_normal font-semibold mb-1">Delivery Collected</p>
                            <p className="text-2xl font-bold text-emerald-600 mb-3">
                                {fmt(allOrders.filter((o) => o.deliveryStatus !== "cancelled").reduce((s, o) => s + o.deliveryCharge, 0))}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-bg_secondary rounded-xl px-3 py-2">
                                    <p className="text-[10px] text-text_normal font-semibold uppercase tracking-wide mb-0.5">Subtotal</p>
                                    <p className="text-sm font-bold text-text_dark">{fmt(allOrders.reduce((s, o) => s + o.subtotal, 0))}</p>
                                </div>
                                <div className="bg-bg_secondary rounded-xl px-3 py-2">
                                    <p className="text-[10px] text-text_normal font-semibold uppercase tracking-wide mb-0.5">Grand</p>
                                    <p className="text-sm font-bold text-text_dark">{fmt(revenue)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Stock overview */}
                        <div className="bg-white rounded-2xl border border-border p-5 hover:shadow-lg transition-shadow">
                            <p className="text-[11px] uppercase tracking-widest text-text_normal font-semibold mb-3">Stock Overview</p>
                            <div className="space-y-2">
                                {[
                                    {
                                        label: "In Stock",
                                        count: (products?.data ?? []).filter((p) => p.inStock).length,
                                        color: "bg-emerald-500",
                                        textColor: "text-emerald-600",
                                    },
                                    {
                                        label: "Out of Stock",
                                        count: (products?.data ?? []).filter((p) => !p.inStock).length,
                                        color: "bg-red-400",
                                        textColor: "text-red-500",
                                    },
                                    {
                                        label: "Featured",
                                        count: (products?.data ?? []).filter((p) => p.isFeatured).length,
                                        color: "bg-violet-500",
                                        textColor: "text-violet-600",
                                    },
                                    {
                                        label: "Best Selling",
                                        count: (products?.data ?? []).filter((p) => p.isBestSelling).length,
                                        color: "bg-amber-500",
                                        textColor: "text-amber-600",
                                    },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${item.color}`} />
                                            <span className="text-xs text-text_normal">{item.label}</span>
                                        </div>
                                        <span className={`text-xs font-bold ${item.textColor}`}>{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashBoard;
