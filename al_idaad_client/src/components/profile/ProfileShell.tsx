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
import type { IconType } from "react-icons";
import toast from "react-hot-toast";
import { FiHeart, FiLogOut, FiPackage, FiUser } from "react-icons/fi";

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
  icon: IconType;
};

const profileSections: ProfileSection[] = [
  { href: "/profile", label: "Settings", icon: FiUser },
  { href: "/profile/wishlist", label: "Wishlist", icon: FiHeart },
  { href: "/profile/purchase-history", label: "Orders", icon: FiPackage },
];

const ProfileContext = createContext<ProfileContextValue | null>(null);

const isSectionActive = (pathname: string, href: string) =>
  href === "/profile" ? pathname === href : pathname.startsWith(href);

export const useProfileShell = () => {
  const context = useContext(ProfileContext);
  if (!context)
    throw new Error("useProfileShell must be used inside ProfileShell");
  return context;
};

export default function ProfileShell({ children }: { children: ReactNode }) {
  const { user, loading, authFetch, updateProfile, logout } = useAuth();
  const pathname = usePathname();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
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

  const completionFields = [
    user?.name,
    user?.phone,
    user?.address,
    user?.city,
    user?.district,
  ];
  const completionScore = user
    ? Math.round(
        (completionFields.filter((v) => Boolean(v?.trim())).length /
          completionFields.length) *
          100,
      )
    : 0;

  const contextValue = useMemo<ProfileContextValue | null>(() => {
    if (!user) return null;
    return { user, orders, ordersLoading, updateProfile };
  }, [orders, ordersLoading, updateProfile, user]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen bg-bg_main flex items-center justify-center px-4">
        <p className="text-sm text-gray-400">Loading your account…</p>
      </main>
    );
  }

  // ── Guest ────────────────────────────────────────────────────────────────
  if (!user || !contextValue) {
    return (
      <main className="min-h-screen bg-bg_main flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-3xl border border-border bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
            <FiUser size={20} className="text-brand" />
          </div>
          <h1 className="font-playfair text-xl font-bold text-text_dark">
            Sign in to your account
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            Access your settings, wishlist, and order history.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/login"
              className="rounded-2xl bg-brand py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-2xl border border-border py-3 text-sm font-semibold text-text_dark transition hover:bg-gray-50"
            >
              Create Account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Authenticated ────────────────────────────────────────────────────────
  return (
    <ProfileContext.Provider value={contextValue}>
      <main className="min-h-screen bg-bg_main">
        {/* ── Mobile header (hidden on lg) ── */}
        <div className="lg:hidden bg-white border-b border-border px-4 pt-6 pb-0">
          {/* User row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text_dark">
                  {user.name}
                </p>
                <p className="truncate text-xs text-gray-400">{user.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                await logout();
                toast.success("Logged out successfully");
              }}
              className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-500 hover:border-red-200"
            >
              <FiLogOut size={13} />
              Logout
            </button>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-2xl overflow-hidden mb-4">
            {[
              { label: "Wishlist", value: user.wishlist.length },
              { label: "Orders", value: ordersLoading ? "…" : orders.length },
              { label: "Profile", value: `${completionScore}%` },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center py-2.5">
                <span className="text-sm font-bold text-text_dark">
                  {value}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-gray-400 mt-0.5">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Horizontal tab bar — scrollable on tiny screens */}
          <nav className="flex gap-1 overflow-x-auto scrollbar-none -mx-4 px-4">
            {profileSections.map((section) => {
              const active = isSectionActive(pathname, section.href);
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className={`flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                    active
                      ? "border-brand text-brand"
                      : "border-transparent text-gray-400 hover:text-text_dark"
                  }`}
                >
                  <section.icon size={14} />
                  {section.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ── Mobile content ── */}
        <div className="lg:hidden px-4 py-6">{children}</div>

        {/* ── Desktop layout (sidebar + content) ── */}
        <div className="hidden lg:block px-6 py-12">
          <div className="mx-auto max-w-5xl flex gap-6 items-start">
            {/* Sidebar */}
            <aside className="w-60 shrink-0">
              <div className="rounded-3xl border border-border bg-white p-5 space-y-5">
                {/* Identity */}
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text_dark">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 divide-x divide-border rounded-2xl border border-border overflow-hidden">
                  {[
                    { label: "Wishlist", value: user.wishlist.length },
                    {
                      label: "Orders",
                      value: ordersLoading ? "…" : orders.length,
                    },
                    { label: "Profile", value: `${completionScore}%` },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center py-3 px-1"
                    >
                      <span className="text-sm font-bold text-text_dark">
                        {value}
                      </span>
                      <span className="mt-0.5 text-[9px] uppercase tracking-widest text-gray-400">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Nav */}
                <nav className="space-y-1">
                  {profileSections.map((section) => {
                    const active = isSectionActive(pathname, section.href);
                    return (
                      <Link
                        key={section.href}
                        href={section.href}
                        className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                          active
                            ? "bg-brand text-white"
                            : "text-gray-500 hover:bg-gray-50 hover:text-text_dark"
                        }`}
                      >
                        <section.icon size={15} />
                        {section.label}
                      </Link>
                    );
                  })}
                </nav>

                {/* Logout */}
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    toast.success("Logged out successfully");
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                >
                  <FiLogOut size={15} />
                  Logout
                </button>
              </div>
            </aside>

            {/* Content */}
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </div>
      </main>
    </ProfileContext.Provider>
  );
}
