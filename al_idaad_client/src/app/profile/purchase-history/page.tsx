"use client";

import { useProfileShell } from "@/components/profile/ProfileShell";
import Link from "next/link";
import { FiArrowRight, FiClock, FiPackage } from "react-icons/fi";

const formatOrderDate = (value: string) =>
  new Date(value).toLocaleDateString("en-BD", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const formatStatusLabel = (value?: string) => {
  if (!value) return "Pending";
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const statusColor = (status?: string) => {
  const s = (status ?? "pending").toLowerCase();
  if (s === "delivered") return "bg-green-50 text-green-600";
  if (s === "cancelled") return "bg-red-50 text-red-500";
  return "bg-brand/10 text-brand";
};

export default function ProfilePurchaseHistoryPage() {
  const { orders, ordersLoading } = useProfileShell();

  const totalSpent = orders.reduce((sum, order) => sum + order.grandTotal, 0);
  const activeOrders = orders.filter(
    (order) =>
      (order.deliveryStatus || "pending").toLowerCase() !== "delivered",
  ).length;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (ordersLoading) {
    return (
      <div className="rounded-3xl border border-border bg-white px-6 py-16 text-center text-sm text-gray-400">
        Loading your orders…
      </div>
    );
  }

  // ── Empty ─────────────────────────────────────────────────────────────────
  if (orders.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-white px-6 py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
          <FiPackage size={20} className="text-brand" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-text_dark">
          No orders yet
        </h3>
        <p className="mt-1.5 text-sm text-gray-400">
          Orders placed while signed in will appear here.
        </p>
        <Link
          href="/all-products"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Start Shopping
          <FiArrowRight size={14} />
        </Link>
      </div>
    );
  }

  // ── Orders ────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-3xl border border-border bg-white p-6 sm:p-8">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text_dark">
            Order History
          </h2>
          <p className="mt-0.5 text-sm text-gray-400">
            {orders.length} {orders.length === 1 ? "order" : "orders"} · ৳
            {totalSpent.toLocaleString()} total
          </p>
        </div>
        {activeOrders > 0 && (
          <span className="rounded-2xl bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand">
            {activeOrders} active
          </span>
        )}
      </div>

      {/* Order list */}
      <div className="space-y-4">
        {orders.map((order) => {
          const totalQty = order.items.reduce(
            (sum, item) => sum + item.quantity,
            0,
          );

          return (
            <article
              key={order._id}
              className="rounded-2xl border border-border overflow-hidden"
            >
              {/* Order meta bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <p className="text-xs font-bold text-text_dark">
                    #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <span className="text-gray-300">·</span>
                  <p className="text-xs text-gray-400">
                    {formatOrderDate(order.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-xl px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${statusColor(order.deliveryStatus)}`}
                  >
                    {formatStatusLabel(order.deliveryStatus)}
                  </span>
                </div>
              </div>

              {/* Order body */}
              <div className="px-4 py-4 space-y-3">
                {/* Summary row */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    {totalQty} {totalQty === 1 ? "item" : "items"}
                  </p>
                  <p className="text-sm font-bold text-text_dark">
                    ৳ {order.grandTotal.toLocaleString()}
                  </p>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div
                      key={`${order._id}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text_dark">
                          {item.name}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400">
                          Qty {item.quantity}
                          {item.variant?.size ? ` · ${item.variant.size}` : ""}
                          {item.variant?.color
                            ? ` · ${item.variant.color}`
                            : ""}
                          {item.attarSize?.ml
                            ? ` · ${item.attarSize.ml} ml`
                            : ""}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-text_dark">
                        ৳ {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Tracking */}
                <div className="pt-1">
                  {order.steadfastTrackingCode ? (
                    <a
                      href={`https://steadfast.com.bd/t/${order.steadfastTrackingCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand transition hover:opacity-75"
                    >
                      Track Parcel
                      <FiArrowRight size={12} />
                    </a>
                  ) : (
                    <p className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                      <FiClock size={12} />
                      Tracking code pending
                    </p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
