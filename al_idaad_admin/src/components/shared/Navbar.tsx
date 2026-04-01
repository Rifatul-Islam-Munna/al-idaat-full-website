"use client";

import { api } from "@/libs/axios";
import { AxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { useAuth } from "./AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────
type Panel = "menu" | "verify-step1" | "verify-step2" | "change-password";

// Shape of every error response from the backend
interface ApiErrorResponse {
    status: "error";
    message: string;
    errors?: { path: string; message: string }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract a human-readable message from an Axios error thrown by the backend. */
const extractError = (err: unknown): string => {
    if (err instanceof AxiosError) {
        const data = err.response?.data as ApiErrorResponse | undefined;
        if (data?.errors && data.errors.length > 0) {
            // Return all zod / validation messages joined
            return data.errors.map((e) => e.message).join("\n");
        }
        if (data?.message) return data.message;
        return err.message;
    }
    if (err instanceof Error) return err.message;
    return "An unexpected error occurred.";
};

/**
 * Password rules that mirror the backend zod changePasswordSchema:
 * min 8, max 32, uppercase, lowercase, number, special char
 */
const validatePassword = (pw: string): string | null => {
    if (pw.length < 8) return "Password must be at least 8 characters long.";
    if (pw.length > 32) return "Password cannot exceed 32 characters.";
    if (!/[A-Z]/.test(pw)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(pw)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(pw)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pw)) return "Password must contain at least one special character.";
    return null;
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = () => <span className="inline-block w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />;

// ─── Eye toggle SVG ───────────────────────────────────────────────────────────
const EyeOff = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
        />
    </svg>
);
const EyeOn = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
    </svg>
);

// ─── Password field with show/hide ────────────────────────────────────────────
const PasswordInput = ({
    label,
    value,
    onChange,
    placeholder,
    autoFocus,
    borderClass,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    autoFocus?: boolean;
    borderClass?: string;
}) => {
    const [show, setShow] = useState(false);
    return (
        <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-text_normal mb-1.5">{label}</label>
            <div className="relative">
                <input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    className={`w-full px-3 py-2.5 pr-10 text-sm rounded-xl border bg-bg_secondary text-text_dark placeholder-text_light focus:outline-none focus:bg-white transition-colors ${borderClass ?? "border-border focus:border-primary"}`}
                />
                <button
                    type="button"
                    onClick={() => setShow((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text_light hover:text-text_normal transition-colors"
                >
                    {show ? <EyeOff /> : <EyeOn />}
                </button>
            </div>
        </div>
    );
};

// ─── Password strength bar ────────────────────────────────────────────────────
const StrengthBar = ({ password }: { password: string }) => {
    if (!password.length) return null;
    const checks = [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[a-z]/.test(password),
        /[0-9]/.test(password),
        /[!@#$%^&*(),.?":{}|<>]/.test(password),
    ];
    const score = checks.filter(Boolean).length; // 0-5
    const level = score <= 1 ? 0 : score <= 2 ? 1 : score <= 3 ? 2 : score <= 4 ? 3 : 4;
    const colors = ["bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-lime-400", "bg-emerald-500"];
    const labels = ["Very weak", "Weak", "Fair", "Good", "Strong"];
    return (
        <div className="mt-1.5">
            <div className="flex gap-1 mb-1">
                {[0, 1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= level ? colors[level] : "bg-bg_secondary"}`}
                    />
                ))}
            </div>
            <p className={`text-[10px] font-semibold ${colors[level].replace("bg-", "text-")}`}>{labels[level]}</p>
        </div>
    );
};

// ─── Back button ──────────────────────────────────────────────────────────────
const BackBtn = ({ onClick }: { onClick: () => void }) => (
    <button
        onClick={onClick}
        className="w-7 h-7 rounded-lg hover:bg-bg_secondary flex items-center justify-center text-text_normal transition-colors"
    >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
    </button>
);

// ─── Panel header ─────────────────────────────────────────────────────────────
const PanelHeader = ({ onBack, title, subtitle }: { onBack: () => void; title: string; subtitle?: string }) => (
    <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <BackBtn onClick={onBack} />
        <div>
            <p className="text-sm font-semibold text-text_dark">{title}</p>
            {subtitle && <p className="text-[11px] text-text_normal">{subtitle}</p>}
        </div>
    </div>
);

// ─── Main Navbar ──────────────────────────────────────────────────────────────
const Navbar = () => {
    const { user, logout, logoutLoading } = useAuth();

    const [open, setOpen] = useState(false);
    const [panel, setPanel] = useState<Panel>("menu");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Verify step 1
    const [sendingCode, setSendingCode] = useState(false);

    // Verify step 2
    const [verifyCode, setVerifyCode] = useState("");
    const [verifying, setVerifying] = useState(false);

    // Change password
    const [oldPw, setOldPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [changingPw, setChangingPw] = useState(false);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Reset state when dropdown closes
    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setPanel("menu");
                setVerifyCode("");
                setOldPw("");
                setNewPw("");
                setConfirmPw("");
            }, 200);
        }
    }, [open]);

    // ── Swal wrappers ──────────────────────────────────────────────────────────
    const swalSuccess = (msg: string) =>
        Swal.fire({
            icon: "success",
            title: "Success",
            text: msg,
            confirmButtonColor: "var(--color-primary)",
            timer: 2500,
            timerProgressBar: true,
        });

    const swalError = (msg: string) =>
        Swal.fire({
            icon: "error",
            title: "Error",
            text: msg,
            confirmButtonColor: "var(--color-primary)",
        });

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleSendCode = async () => {
        if (!user) return;
        setSendingCode(true);
        try {
            await api.patch("/auth/send-verification-code", { email: user.email });
            setPanel("verify-step2");
            await swalSuccess("Verification code sent to your email.");
        } catch (err) {
            await swalError(extractError(err));
        } finally {
            setSendingCode(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!user || verifyCode.length !== 6) return;
        setVerifying(true);
        try {
            // Backend schema expects providedCode as number (integer)
            await api.patch("/auth/verify-verification-code", {
                email: user.email,
                providedCode: parseInt(verifyCode, 10),
            });
            setVerifyCode("");
            setOpen(false);
            await swalSuccess("Account verified successfully!");
            window.location.reload();
        } catch (err) {
            await swalError(extractError(err));
        } finally {
            setVerifying(false);
        }
    };

    const handleChangePassword = async () => {
        if (!user) return;

        if (!oldPw || !newPw || !confirmPw) {
            await swalError("Please fill in all fields.");
            return;
        }
        if (newPw !== confirmPw) {
            await swalError("New passwords do not match.");
            return;
        }

        // Validate against the same rules as the backend schema
        const pwError = validatePassword(newPw);
        if (pwError) {
            await swalError(pwError);
            return;
        }

        setChangingPw(true);
        try {
            await api.patch(`/auth/change-password/${user._id}`, {
                oldPassword: oldPw,
                newPassword: newPw,
            });
            setOldPw("");
            setNewPw("");
            setConfirmPw("");
            setOpen(false);
            await swalSuccess("Password changed successfully.");
        } catch (err) {
            await swalError(extractError(err));
        } finally {
            setChangingPw(false);
        }
    };

    // ── Loading skeleton ───────────────────────────────────────────────────────
    if (!user) {
        return (
            <nav className="h-25 flex justify-between items-center px-6 bg-white border-b border-border">
                <div className="h-5 w-28 rounded-lg bg-bg_secondary animate-pulse" />
                <div className="w-9 h-9 rounded-full bg-bg_secondary animate-pulse" />
            </nav>
        );
    }

    const initials = user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const pwMismatch = confirmPw.length > 0 && newPw !== confirmPw;
    const pwMatch = confirmPw.length > 0 && newPw === confirmPw;

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <>
            <style>{`
                @keyframes dropdown-in {
                    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-dropdown { animation: dropdown-in .2s cubic-bezier(.22,1,.36,1) forwards; }

                @keyframes panel-slide {
                    from { opacity: 0; transform: translateX(10px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                .animate-panel { animation: panel-slide .18s ease forwards; }
            `}</style>

            <nav className="h-25 flex justify-between items-center px-6 bg-white border-b border-border font-outfit sticky top-0 z-50">
                {/* Left: greeting */}
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs text-text_normal leading-none">Welcome back,</p>
                        <p className="text-sm font-semibold text-text_dark leading-tight">{user.name}</p>
                    </div>
                </div>
                <p className="font-dm-serif text-3xl">Al Idaad</p>
                {/* Right: profile button */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setOpen((p) => !p)}
                        className={`flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-2xl border transition-all duration-150
                            ${open ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40 hover:bg-bg_secondary"}`}
                    >
                        <div className="w-7 h-7 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0 select-none">
                            {initials}
                        </div>
                        <div className="text-left hidden sm:block">
                            <p className="text-xs font-semibold text-text_dark leading-none">{user.name}</p>
                            <p className="text-[10px] text-text_normal capitalize leading-tight">{user.role}</p>
                        </div>
                        <svg
                            className={`w-3.5 h-3.5 text-text_normal transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* ── Dropdown ── */}
                    {open && (
                        <div className="animate-dropdown absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-border shadow-2xl shadow-black/10 overflow-hidden">
                            {/* ── MENU ── */}
                            {panel === "menu" && (
                                <div className="animate-panel">
                                    {/* User card */}
                                    <div className="px-5 pt-5 pb-4 border-b border-border">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-primary to-selected text-white text-base font-bold flex items-center justify-center shrink-0">
                                                {initials}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-text_dark truncate">{user.name}</p>
                                                <p className="text-xs text-text_normal truncate">{user.email}</p>
                                                <div className="flex items-center gap-1.5 mt-1.5">
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-primary/10 text-primary">
                                                        {user.role}
                                                    </span>
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border
                                                            ${
                                                                user.verified
                                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                                                    : "bg-amber-50 text-amber-600 border-amber-200"
                                                            }`}
                                                    >
                                                        {user.verified ? (
                                                            <>
                                                                <svg
                                                                    className="w-2.5 h-2.5"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                    strokeWidth={3}
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                Verified
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg
                                                                    className="w-2.5 h-2.5"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                    strokeWidth={3}
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z"
                                                                    />
                                                                </svg>
                                                                Unverified
                                                            </>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu items */}
                                    <div className="p-2">
                                        {!user.verified && (
                                            <button
                                                onClick={() => setPanel("verify-step1")}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50 text-left group transition-colors"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                                        />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-text_dark group-hover:text-amber-700 transition-colors">
                                                        Verify Account
                                                    </p>
                                                    <p className="text-[11px] text-text_normal">Send a code to your email</p>
                                                </div>
                                                <svg
                                                    className="w-4 h-4 text-text_light ml-auto"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        )}

                                        <button
                                            onClick={() => setPanel("change-password")}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg_secondary text-left group transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-text_dark">Change Password</p>
                                                <p className="text-[11px] text-text_normal">Update your credentials</p>
                                            </div>
                                            <svg
                                                className="w-4 h-4 text-text_light ml-auto"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Logout */}
                                    <div className="px-2 pb-2 border-t border-border pt-2 mt-1">
                                        <button
                                            onClick={logout}
                                            disabled={logoutLoading}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-left group transition-colors disabled:opacity-60"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                                                {logoutLoading ? (
                                                    <Spinner />
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                                        />
                                                    </svg>
                                                )}
                                            </div>
                                            <p className="text-sm font-medium text-red-500">{logoutLoading ? "Logging out…" : "Log Out"}</p>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── VERIFY — Step 1: Send code ── */}
                            {panel === "verify-step1" && (
                                <div className="animate-panel">
                                    <PanelHeader onBack={() => setPanel("menu")} title="Verify Account" subtitle="Step 1 of 2" />
                                    <div className="px-5 py-5 space-y-4">
                                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 flex gap-3">
                                            <svg
                                                className="w-4 h-4 text-amber-500 shrink-0 mt-0.5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <div>
                                                <p className="text-xs font-semibold text-amber-700">Sending to</p>
                                                <p className="text-xs text-amber-600 font-mono mt-0.5">{user.email}</p>
                                                <p className="text-[11px] text-amber-500 mt-1">A 6-digit code will be sent. Valid for 10 minutes.</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleSendCode}
                                            disabled={sendingCode}
                                            className="w-full py-2.5 rounded-xl bg-primary hover:bg-selected text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                                        >
                                            {sendingCode ? (
                                                <>
                                                    <Spinner /> Sending…
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                    Send Verification Code
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── VERIFY — Step 2: Enter code ── */}
                            {panel === "verify-step2" && (
                                <div className="animate-panel">
                                    <PanelHeader onBack={() => setPanel("verify-step1")} title="Enter Code" subtitle="Step 2 of 2" />
                                    <div className="px-5 py-5 space-y-4">
                                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex gap-2">
                                            <svg
                                                className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <p className="text-xs text-emerald-700 font-medium">Code sent! Check your inbox.</p>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold uppercase tracking-wider text-text_normal mb-1.5">
                                                6-Digit Code
                                            </label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={6}
                                                value={verifyCode}
                                                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                                                placeholder="000000"
                                                autoFocus
                                                className="w-full px-3 py-3 text-center text-xl font-bold tracking-[0.5em] rounded-xl border border-border bg-bg_secondary text-text_dark placeholder-text_light focus:outline-none focus:border-primary focus:bg-white transition-colors font-mono"
                                            />
                                        </div>

                                        <button
                                            onClick={handleVerifyCode}
                                            disabled={verifying || verifyCode.length !== 6}
                                            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {verifying ? (
                                                <>
                                                    <Spinner /> Verifying…
                                                </>
                                            ) : (
                                                "Verify Account"
                                            )}
                                        </button>

                                        <button
                                            onClick={handleSendCode}
                                            disabled={sendingCode}
                                            className="w-full py-2 text-xs text-text_normal hover:text-text_dark transition-colors disabled:opacity-50"
                                        >
                                            {sendingCode ? "Resending…" : "Didn't receive it? Resend code"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── CHANGE PASSWORD ── */}
                            {panel === "change-password" && (
                                <div className="animate-panel">
                                    <PanelHeader onBack={() => setPanel("menu")} title="Change Password" />
                                    <div className="px-5 py-5 space-y-3.5">
                                        <PasswordInput
                                            label="Current Password"
                                            value={oldPw}
                                            onChange={setOldPw}
                                            placeholder="Enter current password"
                                            autoFocus
                                        />

                                        <div>
                                            <PasswordInput
                                                label="New Password"
                                                value={newPw}
                                                onChange={setNewPw}
                                                placeholder="Min 8 chars, A-Z, 0-9, symbol"
                                            />
                                            <StrengthBar password={newPw} />
                                        </div>

                                        <div>
                                            <PasswordInput
                                                label="Confirm New Password"
                                                value={confirmPw}
                                                onChange={setConfirmPw}
                                                placeholder="Repeat new password"
                                                borderClass={
                                                    pwMismatch
                                                        ? "border-red-300 focus:border-red-400"
                                                        : pwMatch
                                                          ? "border-emerald-300 focus:border-emerald-400"
                                                          : "border-border focus:border-primary"
                                                }
                                            />
                                            {pwMismatch && <p className="text-[11px] text-red-500 mt-1">Passwords do not match</p>}
                                        </div>

                                        {/* Requirements hint */}
                                        <div className="bg-bg_secondary rounded-xl p-3 space-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-text_normal mb-1.5">Requirements</p>
                                            {[
                                                { label: "At least 8 characters", ok: newPw.length >= 8 },
                                                { label: "Uppercase letter (A–Z)", ok: /[A-Z]/.test(newPw) },
                                                { label: "Lowercase letter (a–z)", ok: /[a-z]/.test(newPw) },
                                                { label: "Number (0–9)", ok: /[0-9]/.test(newPw) },
                                                { label: "Special character (!@#$…)", ok: /[!@#$%^&*(),.?":{}|<>]/.test(newPw) },
                                            ].map((r) => (
                                                <div key={r.label} className="flex items-center gap-2">
                                                    <svg
                                                        className={`w-3 h-3 shrink-0 transition-colors ${newPw.length > 0 ? (r.ok ? "text-emerald-500" : "text-red-400") : "text-text_light"}`}
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={3}
                                                    >
                                                        {r.ok ? (
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        ) : (
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                        )}
                                                    </svg>
                                                    <span
                                                        className={`text-[11px] transition-colors ${newPw.length > 0 ? (r.ok ? "text-emerald-600" : "text-red-500") : "text-text_normal"}`}
                                                    >
                                                        {r.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={handleChangePassword}
                                            disabled={changingPw || !oldPw || !newPw || !confirmPw || pwMismatch}
                                            className="w-full py-2.5 rounded-xl bg-primary hover:bg-selected text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {changingPw ? (
                                                <>
                                                    <Spinner /> Updating…
                                                </>
                                            ) : (
                                                "Update Password"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </nav>
        </>
    );
};

export default Navbar;
