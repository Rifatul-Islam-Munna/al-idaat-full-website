"use client";

import { useAuth } from "@/components/shared/AuthContext";
import { GetOrdersResponseType, OrderType, UserType } from "@/utils/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { IconType } from "react-icons"
import toast from "react-hot-toast"
import { FiHeart, FiLogOut, FiPackage, FiUser } from "react-icons/fi"

type ProfileUpdatePayload = {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
};

type ProfileUpdateResult = {
  success: boolean;
  message?: string;
};

type ProfileContextValue = {
  user: UserType;
  orders: OrderType[];
  ordersLoading: boolean;
  updateProfile: (
    payload: ProfileUpdatePayload,
  ) => Promise<ProfileUpdateResult>;
};

type ProfileSection = {
  href: string;
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: IconType;
};

const profileSections: ProfileSection[] = [
  {
    href: "/profile",
    label: "Settings",
    eyebrow: "Account Settings",
    title: "Keep your checkout details polished and ready.",
    description:
      "Update your saved name, delivery information, and contact details so every future order feels faster and cleaner.",
    icon: FiUser,
  },
  {
    href: "/profile/wishlist",
    label: "Wishlist",
    eyebrow: "Saved Pieces",
    title: "Everything you bookmarked, arranged in one calm gallery.",
    description:
      "Come back to your saved products, remove what no longer fits, and jump straight back into the product page when you are ready.",
    icon: FiHeart,
  },
  {
    href: "/profile/purchase-history",
    label: "Purchase History",
    eyebrow: "Order Archive",
    title: "Track every logged-in purchase from one timeline.",
    description:
      "See totals, statuses, tracking codes, and the exact items inside each order without digging through checkout emails.",
    icon: FiPackage,
  },
];

const ProfileContext = createContext<ProfileContextValue | null>(null);

const isSectionActive = (pathname: string, href: string) => {
  if (href === "/profile") {
    return pathname === href;
  }

  return pathname.startsWith(href);
};

export const useProfileShell = () => {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfileShell must be used inside ProfileShell");
  }

  return context;
};

export default function ProfileShell({ children }: { children: ReactNode }) {
  const { user, loading, authFetch, updateProfile, logout } = useAuth();
  const pathname = usePathname();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    let active = true;

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

  const activeSection =
    profileSections.find((section) => isSectionActive(pathname, section.href)) ??
    profileSections[0];

  const firstName = user?.name.split(" ")[0] ?? "Friend";
  const completionFields = [
    user?.name,
    user?.phone,
    user?.address,
    user?.city,
    user?.district,
  ];
  const completionScore = user
    ? Math.round(
        (completionFields.filter((value) => Boolean(value?.trim())).length /
          completionFields.length) *
          100,
      )
    : 0;

  const contextValue = useMemo<ProfileContextValue | null>(() => {
    if (!user) return null;

    return {
      user,
      orders,
      ordersLoading,
      updateProfile,
    };
  }, [orders, ordersLoading, updateProfile, user]);

  if (loading) {
    return (
      <main className="min-h-screen bg-bg_main px-4 py-12">
        <div className="mx-auto max-w-6xl rounded-[32px] border border-border bg-white p-10 text-center text-gray-500">
          Loading your account...
        </div>
      </main>
    );
  }

  if (!user || !contextValue) {
    return (
      <main className="min-h-screen bg-bg_main px-4 py-12">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-border bg-white p-8 text-center sm:p-12">
          <span className="inline-flex rounded-full bg-brand/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            My Profile
          </span>
          <h1 className="mt-5 font-playfair text-3xl font-bold text-text_dark sm:text-5xl">
            Sign in to view your settings, wishlist, and order history.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-500 sm:text-base">
            Your account keeps your saved details, synced wishlist items, and
            purchase history ready every time you return.
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
    <ProfileContext.Provider value={contextValue}>
      <main className="min-h-screen bg-bg_main px-4 py-8 md:py-12">
        <div className="mx-auto max-w-6xl space-y-6">
          <section className="overflow-hidden rounded-[36px] border border-border bg-white">
            <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
              <div className="relative overflow-hidden px-7 py-8 sm:px-10 sm:py-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(163,122,74,0.12),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.04),transparent_38%)]" />
                <div className="relative">
                  <span className="inline-flex rounded-full bg-brand/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                    {activeSection.eyebrow}
                  </span>
                  <h1 className="mt-5 max-w-2xl font-playfair text-3xl font-bold leading-tight text-text_dark sm:text-5xl">
                    {activeSection.title}
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500 sm:text-base">
                    {activeSection.description}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    {profileSections.map((section) => {
                      const active = isSectionActive(pathname, section.href);

                      return (
                        <Link
                          key={section.href}
                          href={section.href}
                          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                            active
                              ? "border-brand bg-brand text-white"
                              : "border-border bg-white text-text_dark hover:border-brand hover:text-brand"
                          }`}
                        >
                          <section.icon size={15} />
                          {section.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="border-t border-border bg-gray-50 px-7 py-8 sm:px-10 lg:border-l lg:border-t-0">
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

                <div className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  <div className="rounded-2xl border border-border bg-white px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                      Wishlist
                    </p>
                    <p className="mt-2 text-2xl font-bold text-text_dark">
                      {user.wishlist.length}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-white px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                      Orders
                    </p>
                    <p className="mt-2 text-2xl font-bold text-text_dark">
                      {ordersLoading ? "..." : orders.length}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-white px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                      Profile
                    </p>
                    <p className="mt-2 text-2xl font-bold text-text_dark">
                      {completionScore}%
                    </p>
                  </div>
                </div>

                <div className="mt-7 rounded-[28px] border border-border bg-white p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                        Welcome Back
                      </p>
                      <p className="mt-2 font-playfair text-2xl font-bold text-text_dark">
                        {firstName}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await logout();
                        toast.success("Logged out successfully");
                      }}
                      className="inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-text_dark transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                    >
                      <FiLogOut size={16} />
                      Logout
                    </button>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-gray-500">
                    Keep your delivery information fresh so the next checkout is
                    quick, clear, and less repetitive.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
            <aside className="space-y-6">
              <div className="rounded-[28px] border border-border bg-white p-4">
                <p className="px-2 pb-3 text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                  Account Sections
                </p>
                <div className="space-y-2">
                  {profileSections.map((section) => {
                    const active = isSectionActive(pathname, section.href);

                    return (
                      <Link
                        key={section.href}
                        href={section.href}
                        className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                          active
                            ? "bg-brand text-white"
                            : "bg-gray-50 text-text_dark hover:bg-brand/8 hover:text-brand"
                        }`}
                      >
                        <span className="inline-flex items-center gap-3">
                          <section.icon size={16} />
                          {section.label}
                        </span>
                        <span className="text-xs uppercase tracking-[0.16em]">
                          {active ? "Open" : "Go"}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[28px] border border-border bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                  Account Notes
                </p>
                <div className="mt-4 space-y-3 text-sm text-gray-500">
                  <div className="rounded-2xl bg-gray-50 px-4 py-3">
                    Logged-in orders appear in purchase history automatically.
                  </div>
                  <div className="rounded-2xl bg-gray-50 px-4 py-3">
                    Wishlist stays synced to this account across sessions.
                  </div>
                </div>
              </div>
            </aside>

            <div>{children}</div>
          </section>
        </div>
      </main>
    </ProfileContext.Provider>
  );
}






