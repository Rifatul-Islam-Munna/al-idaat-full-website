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

export default function ProfilePurchaseHistoryPage() {
  const { orders, ordersLoading } = useProfileShell();

  const totalSpent = orders.reduce((sum, order) => sum + order.grandTotal, 0);
  const activeOrders = orders.filter(
    (order) => (order.deliveryStatus || "pending").toLowerCase() !== "delivered",
  ).length;

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-border bg-white p-7 sm:p-9">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-brand/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              Purchase History
            </span>
            <h2 className="mt-5 font-playfair text-3xl font-bold text-text_dark sm:text-4xl">
              Your orders, arranged like a clean timeline.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500">
              Review totals, delivery progress, and item details for every
              logged-in order without leaving your profile.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:w-[320px]">
            <div className="rounded-2xl border border-border bg-gray-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                Total Orders
              </p>
              <p className="mt-2 text-2xl font-bold text-text_dark">
                {ordersLoading ? "..." : orders.length}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-gray-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                Total Spent
              </p>
              <p className="mt-2 text-2xl font-bold text-text_dark">
                {ordersLoading ? "..." : `৳ ${totalSpent.toLocaleString()}`}
              </p>
            </div>
            <div className="col-span-2 rounded-2xl border border-border bg-gray-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                Active Deliveries
              </p>
              <p className="mt-2 text-lg font-bold text-text_dark">
                {ordersLoading ? "Checking..." : `${activeOrders} order(s) still in motion`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {ordersLoading ? (
        <section className="rounded-[32px] border border-border bg-white px-7 py-14 text-center text-sm text-gray-500 sm:px-10">
          Loading your orders...
        </section>
      ) : orders.length === 0 ? (
        <section className="rounded-[32px] border border-dashed border-border bg-white px-7 py-14 text-center sm:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand/8 text-brand">
            <FiPackage size={26} />
          </div>
          <h3 className="mt-5 font-playfair text-3xl font-bold text-text_dark">
            No logged-in purchases yet.
          </h3>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-gray-500">
            Guest checkout still works, but the orders placed while signed in
            will appear here with their current delivery status.
          </p>
          <Link
            href="/all-products"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Start Shopping
            <FiArrowRight size={15} />
          </Link>
        </section>
      ) : (
        <section className="space-y-6">
          {orders.map((order) => (
            <article
              key={order._id}
              className="grid gap-4 rounded-[32px] border border-border bg-white p-6 lg:grid-cols-[150px_minmax(0,1fr)] lg:p-7"
            >
              <div className="rounded-[28px] bg-gray-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                  Ordered On
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-text_dark">
                  {formatOrderDate(order.createdAt)}
                </p>

                <div className="mt-5 inline-flex rounded-full bg-brand/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                  {formatStatusLabel(order.deliveryStatus)}
                </div>
              </div>

              <div className="rounded-[28px] border border-border bg-gray-50/70 p-5 sm:p-6">
                <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                      Order Reference
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-text_dark">
                      #{order._id.slice(-8).toUpperCase()}
                    </h3>
                    {order.steadfastTrackingCode ? (
                      <a
                        href={`https://steadfast.com.bd/t/${order.steadfastTrackingCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand transition hover:opacity-80"
                      >
                        Track Parcel
                        <FiArrowRight size={15} />
                      </a>
                    ) : (
                      <p className="mt-3 inline-flex items-center gap-2 text-sm text-gray-500">
                        <FiClock size={14} />
                        Tracking code will appear once assigned
                      </p>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-white px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                        Total
                      </p>
                      <p className="mt-2 text-lg font-bold text-text_dark">
                        ৳ {order.grandTotal.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-white px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                        Items
                      </p>
                      <p className="mt-2 text-lg font-bold text-text_dark">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {order.items.map((item, index) => (
                    <div
                      key={`${order._id}-${index}`}
                      className="flex flex-col gap-3 rounded-2xl border border-border bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-text_dark">
                          {item.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Qty {item.quantity}
                          {item.variant?.size ? ` · ${item.variant.size}` : ""}
                          {item.variant?.color ? ` · ${item.variant.color}` : ""}
                          {item.attarSize?.ml ? ` · ${item.attarSize.ml} ml` : ""}
                        </p>
                      </div>

                      <span className="shrink-0 text-sm font-semibold text-text_dark">
                        ৳ {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
