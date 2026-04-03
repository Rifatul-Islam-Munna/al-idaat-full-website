"use client";

import { useAuth } from "@/components/shared/AuthContext";
import WishlistButton from "@/components/shared/WishlistButton";
import { GetOrdersResponseType, OrderType } from "@/utils/types";
import { getProductDetailsPath } from "@/utils/helper";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { FiHeart, FiLogOut, FiPackage, FiUser } from "react-icons/fi";

const ProfilePage = () => {
  const { user, loading, authFetch, updateProfile, logout } = useAuth();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }

    let active = true;
    setOrdersLoading(true);

    authFetch("/orders/my-orders")
      .then(async (res) => {
        if (!active) return;

        if (!res.ok) {
          setOrders([]);
          setOrdersLoading(false);
          return;
        }

        const data: GetOrdersResponseType = await res.json();
        setOrders(data.data);
        setOrdersLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setOrders([]);
        setOrdersLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authFetch, user]);

  const profile = useMemo(
    () => ({
      name: draft.name ?? user?.name ?? "",
      phone: draft.phone ?? user?.phone ?? "",
      address: draft.address ?? user?.address ?? "",
      city: draft.city ?? user?.city ?? "",
      district: draft.district ?? user?.district ?? "",
    }),
    [draft, user],
  );

  const handleProfileSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

    try {
      const result = await updateProfile(profile);

      if (!result.success) {
        toast.error(result.message || "Profile update failed");
        return;
      }

      toast.success(result.message || "Profile updated");
      setDraft({});
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-bg_main px-4 py-12">
        <div className="mx-auto max-w-6xl rounded-[32px] border border-border bg-white p-10 text-center text-gray-500">
          Loading your account...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-bg_main px-4 py-12">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-border bg-white p-8 text-center sm:p-12">
          <span className="inline-flex rounded-full bg-brand/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            My Profile
          </span>
          <h1 className="mt-5 font-playfair text-3xl font-bold text-text_dark sm:text-5xl">
            Sign in to view your profile, wishlist, and order history.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-500 sm:text-base">
            Your account gives you saved details, synced wishlist items, and
            purchase history whenever you come back.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="rounded-2xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-2xl border border-border px-6 py-3 text-sm font-semibold text-text_dark transition hover:bg-gray-50"
            >
              Create Account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg_main px-4 py-8 md:py-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-border bg-white p-7 sm:p-10">
            <span className="inline-flex rounded-full bg-brand/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              My Profile
            </span>
            <h1 className="mt-5 font-playfair text-3xl font-bold text-text_dark sm:text-5xl">
              Welcome back, {user.name.split(" ")[0]}.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-gray-500 sm:text-base">
              Manage your account details, wishlist, and all of your purchase
              history from one place.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-gray-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                  Wishlist
                </p>
                <p className="mt-2 text-2xl font-bold text-text_dark">
                  {user.wishlist.length}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-gray-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                  Orders
                </p>
                <p className="mt-2 text-2xl font-bold text-text_dark">
                  {orders.length}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-gray-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                  Session
                </p>
                <p className="mt-2 text-sm font-semibold text-text_dark">
                  Up to 10 days
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-border bg-white p-7 sm:p-10">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-xl font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-lg font-semibold text-text_dark">
                  {user.name}
                </p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                await logout();
                toast.success("Logged out successfully");
              }}
              className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-text_dark transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
            >
              <FiLogOut size={16} />
              Logout
            </button>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[32px] border border-border bg-white p-7 sm:p-10">
            <div className="mb-6 flex items-center gap-3">
              <FiUser className="text-brand" />
              <h2 className="text-2xl font-bold text-text_dark">
                Account Details
              </h2>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-border bg-gray-50 px-4 py-3 text-sm text-text_dark outline-none transition focus:border-brand focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full rounded-2xl border border-border bg-gray-100 px-4 py-3 text-sm text-gray-500 outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        phone: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-border bg-gray-50 px-4 py-3 text-sm text-text_dark outline-none transition focus:border-brand focus:bg-white"
                    placeholder="01XXXXXXXXX"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                    District
                  </label>
                  <input
                    type="text"
                    value={profile.district}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        district: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-border bg-gray-50 px-4 py-3 text-sm text-text_dark outline-none transition focus:border-brand focus:bg-white"
                    placeholder="District"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                    City / Thana
                  </label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, city: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-border bg-gray-50 px-4 py-3 text-sm text-text_dark outline-none transition focus:border-brand focus:bg-white"
                    placeholder="City or thana"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                    Address
                  </label>
                  <input
                    type="text"
                    value={profile.address}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        address: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-border bg-gray-50 px-4 py-3 text-sm text-text_dark outline-none transition focus:border-brand focus:bg-white"
                    placeholder="House, road, area"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Saving..." : "Update Details"}
              </button>
            </form>
          </div>

          <div className="rounded-[32px] border border-border bg-white p-7 sm:p-10">
            <div className="mb-6 flex items-center gap-3">
              <FiHeart className="text-brand" />
              <h2 className="text-2xl font-bold text-text_dark">Wishlist</h2>
            </div>

            {user.wishlist.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-gray-50 px-5 py-10 text-center text-sm text-gray-500">
                No wishlist items yet. Save products from the shop to see them
                here.
              </div>
            ) : (
              <div className="space-y-4">
                {user.wishlist.map((product) => (
                  <div
                    key={product._id}
                    className="flex gap-4 rounded-2xl border border-border bg-gray-50 p-4"
                  >
                    <Link
                      href={getProductDetailsPath(product)}
                      className="shrink-0"
                    >
                      <Image
                        src={product.thumbnail}
                        alt={product.name}
                        width={72}
                        height={108}
                        className="h-[108px] w-[72px] rounded-xl object-cover"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link href={getProductDetailsPath(product)}>
                        <p className="line-clamp-2 text-sm font-semibold text-text_dark transition hover:text-brand">
                          {product.name}
                        </p>
                      </Link>
                      <p className="mt-1 text-xs text-gray-500">
                        {product.category.name}
                      </p>
                      <div className="mt-4">
                        <WishlistButton
                          productId={product._id}
                          label="Remove"
                          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-text_dark transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[32px] border border-border bg-white p-7 sm:p-10">
          <div className="mb-6 flex items-center gap-3">
            <FiPackage className="text-brand" />
            <h2 className="text-2xl font-bold text-text_dark">
              Purchase History
            </h2>
          </div>

          {ordersLoading ? (
            <div className="rounded-2xl border border-border bg-gray-50 px-5 py-8 text-center text-sm text-gray-500">
              Loading your orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-gray-50 px-5 py-10 text-center text-sm text-gray-500">
              No purchases yet. Guest checkout still works, but logged-in
              account orders will appear here.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="rounded-2xl border border-border bg-gray-50 p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-text_dark">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("en-BD", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      {order.steadfastTrackingCode ? (
                        <p className="mt-2 text-xs font-semibold text-brand">
                          Tracking: {order.steadfastTrackingCode}
                        </p>
                      ) : null}
                    </div>

                    <div className="text-sm sm:text-right">
                      <p className="font-semibold text-text_dark">
                        ৳ {order.grandTotal.toLocaleString()}
                      </p>
                      <p className="mt-1 inline-flex rounded-full bg-brand/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                        {order.deliveryStatus || "pending"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {order.items.map((item, index) => (
                      <div
                        key={`${order._id}-${index}`}
                        className="flex items-center justify-between gap-4 text-sm text-gray-600"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-text_dark">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty {item.quantity}
                            {item.variant?.size ? ` · ${item.variant.size}` : ""}
                            {item.attarSize?.ml ? ` · ${item.attarSize.ml} ml` : ""}
                          </p>
                        </div>
                        <span className="shrink-0 font-semibold text-text_dark">
                          ৳ {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default ProfilePage;
