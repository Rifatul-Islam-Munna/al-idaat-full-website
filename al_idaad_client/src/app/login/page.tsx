"use client";

import { useAuth } from "@/components/shared/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";

const LoginPage = () => {
  const router = useRouter();
  const { login, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/profile");
    }
  }, [loading, router, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const result = await login(email, password);

      if (!result.success) {
        toast.error(result.message || "Login failed");
        return;
      }

      toast.success("Welcome back");
      router.push("/profile");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg_main flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        {/* Top brand badge + heading */}
        <div className="text-center mb-8">
          <span className="inline-flex rounded-full bg-brand/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Customer Account
          </span>
          <h1 className="mt-4 font-playfair text-[2rem] font-bold leading-tight text-text_dark sm:text-4xl">
            Welcome back
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Sign in to manage your orders and wishlist.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-[28px] border border-border bg-white p-6 sm:p-9 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-border bg-gray-50 px-4 py-3.5 text-sm text-text_dark outline-none transition focus:border-brand focus:bg-white"
                placeholder="you@example.com"
                autoComplete="email"
                inputMode="email"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-border bg-gray-50 px-4 py-3.5 text-sm text-text_dark outline-none transition focus:border-brand focus:bg-white"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 inline-flex w-full items-center justify-center rounded-2xl bg-brand px-5 py-4 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] active:opacity-80 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                    />
                  </svg>
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-border pt-5 text-center">
            <p className="text-sm text-gray-500">
              New here?{" "}
              <Link
                href="/register"
                className="font-semibold text-brand transition hover:opacity-80"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Benefit pills */}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {[
            "Track purchase history",
            "Save to wishlist",
            "Stay signed in 10 days",
          ].map((item) => (
            <span
              key={item}
              className="rounded-full border border-border bg-white px-3 py-1 text-[11px] font-medium text-gray-400"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
