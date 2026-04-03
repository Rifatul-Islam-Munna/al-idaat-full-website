"use client";

import { useAuth } from "@/components/shared/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";

// Eye icons as inline SVG to avoid extra dependencies
const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

const RegisterPage = () => {
  const router = useRouter();
  const { register, user, loading } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/profile");
    }
  }, [loading, router, user]);

  const handleChange =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSubmitting(true);

    try {
      const result = await register({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      if (!result.success) {
        toast.error(result.message || "Registration failed");
        return;
      }

      toast.success("Account created successfully");
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
            Join Al Idaad
          </span>
          <h1 className="mt-4 font-playfair text-[2rem] font-bold leading-tight text-text_dark sm:text-4xl">
            Create your account
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Save favourites, track orders, and checkout faster.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-[28px] border border-border bg-white p-6 sm:p-9 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={handleChange("name")}
                className="w-full rounded-2xl border border-border bg-gray-50 px-4 py-3.5 text-sm text-text_dark outline-none transition focus:border-brand focus:bg-white"
                placeholder="Your full name"
                autoComplete="name"
                required
              />
            </div>

            {/* Email */}
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
                value={form.email}
                onChange={handleChange("email")}
                className="w-full rounded-2xl border border-border bg-gray-50 px-4 py-3.5 text-sm text-text_dark outline-none transition focus:border-brand focus:bg-white"
                placeholder="you@example.com"
                autoComplete="email"
                inputMode="email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange("password")}
                  className="w-full rounded-2xl border border-border bg-gray-50 px-4 py-3.5 pr-11 text-sm text-text_dark outline-none transition focus:border-brand focus:bg-white"
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600 active:text-brand"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  className="w-full rounded-2xl border border-border bg-gray-50 px-4 py-3.5 pr-11 text-sm text-text_dark outline-none transition focus:border-brand focus:bg-white"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600 active:text-brand"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Submit */}
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
                  Creating account…
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider + login link */}
          <div className="mt-6 border-t border-border pt-5 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-brand transition hover:opacity-80"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Benefit pills */}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {["Faster checkout", "Wishlist synced", "Full order history"].map(
            (item) => (
              <span
                key={item}
                className="rounded-full border border-border bg-white px-3 py-1 text-[11px] font-medium text-gray-400"
              >
                {item}
              </span>
            ),
          )}
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;
