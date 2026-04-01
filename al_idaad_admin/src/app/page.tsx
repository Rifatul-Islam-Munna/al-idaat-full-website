"use client";

import { api, clearAccessToken, setAccessToken } from "@/libs/axios";
import { useAuth } from "@/components/shared/AuthContext";
import Loading from "@/components/shared/Loading";
import { AxiosError } from "axios";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

// ─── Backend error shape ──────────────────────────────────────────────────────
interface ApiErrorResponse {
    status: "error";
    message: string;
    errors?: { path: string; message: string }[];
}

interface LoginResponse {
    accessToken: string;
}

interface UserResponse {
    data: Array<{
        _id: string;
        id: string;
        name: string;
        email: string;
        role: string;
    }>;
}

// ─── View state ───────────────────────────────────────────────────────────────
type View = "login" | "forgot-email" | "forgot-code";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const extractError = (err: unknown): string => {
    if (err instanceof AxiosError) {
        const data = err.response?.data as ApiErrorResponse | undefined;
        if (data?.errors && data.errors.length > 0) {
            return data.errors.map((e) => e.message).join("\n");
        }
        if (data?.message) return data.message;
        return err.message;
    }
    if (err instanceof Error) return err.message;
    return "An unexpected error occurred.";
};

/**
 * Mirror of the backend forgotPasswordSchema / changePasswordSchema rules:
 * min 8, max 32, uppercase, lowercase, number, special char
 */
const validatePassword = (pw: string): string | null => {
    if (pw.length < 8) return "Password must be at least 8 characters long.";
    if (pw.length > 32) return "Password cannot exceed 32 characters.";
    if (!/[A-Z]/.test(pw)) return "Must contain at least one uppercase letter.";
    if (!/[a-z]/.test(pw)) return "Must contain at least one lowercase letter.";
    if (!/[0-9]/.test(pw)) return "Must contain at least one number.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pw)) return "Must contain at least one special character.";
    return null;
};

// ─── SweetAlert2 wrappers ─────────────────────────────────────────────────────
const swalSuccess = (msg: string) =>
    Swal.fire({
        icon: "success",
        title: "Success",
        text: msg,
        confirmButtonColor: "#2563eb",
        timer: 2500,
        timerProgressBar: true,
    });

const swalError = (msg: string) =>
    Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
        confirmButtonColor: "#2563eb",
    });

// ─── Inline icons ─────────────────────────────────────────────────────────────
const MailIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
        <rect x="2" y="4" width="20" height="16" rx="2" />
    </svg>
);

const KeyIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
        <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
);

const EyeOnIcon = ({ className }: { className?: string }) => (
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
        className={className}
    >
        <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const EyeOffIcon = ({ className }: { className?: string }) => (
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
        className={className}
    >
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

const ArrowLeftIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
);

// ─── Small reusable field components ─────────────────────────────────────────

/** Dark glass input used across all views */
const GlassInput = ({
    type = "text",
    placeholder,
    value,
    onChange,
    disabled,
    autoFocus,
    onFocus,
    onBlur,
    isFocused,
    icon,
    rightSlot,
    delay = 0,
}: {
    type?: string;
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
    disabled?: boolean;
    autoFocus?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
    isFocused?: boolean;
    icon?: React.ReactNode;
    rightSlot?: React.ReactNode;
    delay?: number;
}) => {
    const showIcon = icon && !isFocused && !value;
    return (
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay, duration: 0.4 }} className="relative">
            <AnimatePresence>
                {showIcon && (
                    <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.15 } }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
                    >
                        {icon}
                    </motion.span>
                )}
            </AnimatePresence>

            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                autoFocus={autoFocus}
                onFocus={onFocus}
                onBlur={onBlur}
                style={{ paddingLeft: showIcon ? "2.25rem" : "0.75rem", paddingRight: rightSlot ? "2.5rem" : "0.75rem" }}
                className="w-full h-11 bg-white/4 border border-white/10 rounded-lg text-white text-sm placeholder-white/25 focus:outline-none focus:border-blue-500/60 focus:bg-white/6 transition-all duration-200"
            />

            {rightSlot && <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</span>}

            <motion.div
                animate={{ opacity: isFocused ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 rounded-lg pointer-events-none shadow-[0_0_0_1px_rgba(59,130,246,0.3),0_0_16px_rgba(59,130,246,0.08)]"
            />
        </motion.div>
    );
};

/** Password strength bar — mirrors backend schema rules */
const StrengthBar = ({ password }: { password: string }) => {
    if (!password.length) return null;
    const rules = [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[a-z]/.test(password),
        /[0-9]/.test(password),
        /[!@#$%^&*(),.?":{}|<>]/.test(password),
    ];
    const score = rules.filter(Boolean).length; // 0-5
    const level = score <= 1 ? 0 : score <= 2 ? 1 : score <= 3 ? 2 : score <= 4 ? 3 : 4;
    const colors = ["bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-lime-400", "bg-emerald-500"];
    const labels = ["Very weak", "Weak", "Fair", "Good", "Strong"];
    const textColors = ["text-red-400", "text-orange-400", "text-yellow-400", "text-lime-400", "text-emerald-400"];
    return (
        <div className="mt-2 space-y-1.5">
            <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                    <motion.div
                        key={i}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: i <= level ? 1 : 0.15 }}
                        transition={{ duration: 0.3, delay: i * 0.04 }}
                        className={`flex-1 h-1 rounded-full origin-left transition-colors duration-300 ${i <= level ? colors[level] : "bg-white/10"}`}
                    />
                ))}
            </div>
            <div className="flex items-center justify-between">
                <span className={`text-[10px] font-semibold ${textColors[level]}`}>{labels[level]}</span>
                <span className="text-[10px] text-white/30">{score}/5 rules met</span>
            </div>
        </div>
    );
};

/** Checklist of password requirements */
const PwRequirements = ({ password }: { password: string }) => {
    const rules = [
        { label: "At least 8 characters", ok: password.length >= 8 },
        { label: "Uppercase letter (A–Z)", ok: /[A-Z]/.test(password) },
        { label: "Lowercase letter (a–z)", ok: /[a-z]/.test(password) },
        { label: "Number (0–9)", ok: /[0-9]/.test(password) },
        { label: "Special character (!@#$…)", ok: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];
    return (
        <div className="mt-2 p-3 bg-white/3 border border-white/8 rounded-lg space-y-1.5">
            {rules.map((r) => (
                <div key={r.label} className="flex items-center gap-2">
                    <svg
                        className={`w-3 h-3 shrink-0 transition-colors ${password.length > 0 ? (r.ok ? "text-emerald-400" : "text-red-400") : "text-white/20"}`}
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
                        className={`text-[11px] transition-colors ${password.length > 0 ? (r.ok ? "text-emerald-400/80" : "text-red-400/80") : "text-white/30"}`}
                    >
                        {r.label}
                    </span>
                </div>
            ))}
        </div>
    );
};

/** Animated submit button */
const SubmitBtn = ({ loading, disabled, loadingLabel, label }: { loading: boolean; disabled?: boolean; loadingLabel: string; label: string }) => (
    <motion.button
        type="submit"
        disabled={loading || disabled}
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="relative w-full h-11 rounded-lg bg-blue-600 text-white text-sm font-medium overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
    >
        <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
        <AnimatePresence mode="wait">
            {loading ? (
                <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2"
                >
                    <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    {loadingLabel}
                </motion.span>
            ) : (
                <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {label}
                </motion.span>
            )}
        </AnimatePresence>
    </motion.button>
);

// ─── Page variants for AnimatePresence ────────────────────────────────────────
const viewVariants = {
    initial: { opacity: 0, x: 28 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -28 },
};
const transition = { duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LoginPage() {
    const router = useRouter();
    const { setUser, user, loading: authLoading } = useAuth();

    // ── Global view state ──────────────────────────────────────────────────────
    const [view, setView] = useState<View>("login");

    // ── Login state ────────────────────────────────────────────────────────────
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [showLoginPw, setShowLoginPw] = useState(false);

    // ── Forgot — step 1: email ──────────────────────────────────────────────
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotEmailFocused, setForgotEmailFocused] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);

    // ── Forgot — step 2: code + new password ──────────────────────────────
    const [forgotCode, setForgotCode] = useState("");
    const [forgotCodeFocused, setForgotCodeFocused] = useState(false);
    const [newPw, setNewPw] = useState("");
    const [newPwFocused, setNewPwFocused] = useState(false);
    const [confirmPw, setConfirmPw] = useState("");
    const [confirmPwFocused, setConfirmPwFocused] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [resettingPw, setResettingPw] = useState(false);

    // ── Auth guard ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!authLoading && user) router.replace("/dashboard");
    }, [user, authLoading, router]);

    if (authLoading || user) return <Loading />;

    // ── Reset forgot state when going back ─────────────────────────────────
    const goToLogin = () => {
        setView("login");
        setForgotEmail("");
        setForgotCode("");
        setNewPw("");
        setConfirmPw("");
    };

    // ── Handlers ───────────────────────────────────────────────────────────
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginLoading(true);
        setLoginError("");
        try {
            const loginRes = await api.post<LoginResponse>("/auth/login", { email, password });
            clearAccessToken();
            setAccessToken(loginRes.data.accessToken);
            const userRes = await api.get<UserResponse>("/auth/user");
            const userData = userRes.data.data?.[0] ?? null;
            if (userData) {
                setUser({ ...userData, role: userData.role as "user" | "admin" });
            }
        } catch (err) {
            setLoginError(extractError(err));
            clearAccessToken();
        } finally {
            setLoginLoading(false);
        }
    };

    const handleSendForgotCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!forgotEmail.trim()) return;
        setSendingCode(true);
        try {
            await api.patch("/auth/send-forgot-password-verification-code", { email: forgotEmail.trim() });
            await swalSuccess("Verification code sent! Check your inbox.");
            setView("forgot-code");
        } catch (err) {
            await swalError(extractError(err));
        } finally {
            setSendingCode(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (forgotCode.length !== 6) {
            await swalError("Please enter the 6-digit code.");
            return;
        }
        if (newPw !== confirmPw) {
            await swalError("Passwords do not match.");
            return;
        }
        const pwErr = validatePassword(newPw);
        if (pwErr) {
            await swalError(pwErr);
            return;
        }

        setResettingPw(true);
        try {
            // Backend expects providedCode as number (z.number().int())
            await api.patch("/auth/verify-forgot-password-verification-code", {
                email: forgotEmail,
                providedCode: parseInt(forgotCode, 10),
                newPassword: newPw,
            });
            await swalSuccess("Password reset successfully! Please log in.");
            goToLogin();
        } catch (err) {
            await swalError(extractError(err));
        } finally {
            setResettingPw(false);
        }
    };

    const pwMismatch = confirmPw.length > 0 && newPw !== confirmPw;
    const pwMatch = confirmPw.length > 0 && newPw === confirmPw;

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <main className="h-screen flex items-center justify-center bg-[#080808] relative overflow-hidden">
            {/* Ambient glows */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full bg-blue-600/10 blur-[120px]" />
                <div className="absolute bottom-1/4 left-1/4 w-75 h-75 rounded-full bg-indigo-500/8 blur-[100px]" />
                <AnimatePresence>
                    {view !== "login" && (
                        <motion.div
                            key="forgot-glow"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6 }}
                            className="absolute top-1/2 right-1/4 w-80 h-80 rounded-full bg-violet-600/8 blur-[100px]"
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Grid overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                    backgroundSize: "60px 60px",
                }}
            />

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 32, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 w-full max-w-sm mx-4"
            >
                {/* Top glow border */}
                <div className="absolute -top-px left-1/2 -translate-x-1/2 w-3/4 h-px bg-linear-to-r from-transparent via-blue-500/60 to-transparent" />

                <div className="bg-white/3 border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-2xl shadow-black/60 overflow-hidden">
                    {/* ── Animated view switcher ── */}
                    <AnimatePresence mode="wait">
                        {/* ════════════ LOGIN ════════════ */}
                        {view === "login" && (
                            <motion.div key="login" variants={viewVariants} initial="initial" animate="animate" exit="exit" transition={transition}>
                                <form onSubmit={handleLogin}>
                                    {/* Header */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15, duration: 0.4 }}
                                        className="mb-8 text-center"
                                    >
                                        <h1 className="text-white text-xl font-semibold tracking-tight">Al Idaad Admin Panel</h1>
                                        <p className="text-white/30 text-sm mt-1">Log in to continue</p>
                                    </motion.div>

                                    {/* Login error */}
                                    <AnimatePresence>
                                        {loginError && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                                animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                                transition={{ duration: 0.25 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-xs flex items-center gap-2">
                                                    <span className="inline-block w-1 h-1 rounded-full bg-red-400 shrink-0" />
                                                    {loginError}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="space-y-3">
                                        {/* Email */}
                                        <GlassInput
                                            type="email"
                                            placeholder="Email"
                                            value={email}
                                            onChange={setEmail}
                                            disabled={loginLoading}
                                            isFocused={emailFocused}
                                            onFocus={() => setEmailFocused(true)}
                                            onBlur={() => setEmailFocused(false)}
                                            icon={<MailIcon />}
                                            delay={0.2}
                                        />

                                        {/* Password */}
                                        <GlassInput
                                            type={showLoginPw ? "text" : "password"}
                                            placeholder="Password"
                                            value={password}
                                            onChange={setPassword}
                                            disabled={loginLoading}
                                            isFocused={passwordFocused}
                                            onFocus={() => setPasswordFocused(true)}
                                            onBlur={() => setPasswordFocused(false)}
                                            icon={<KeyIcon />}
                                            delay={0.25}
                                            rightSlot={
                                                password && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowLoginPw((p) => !p)}
                                                        className="text-white/25 hover:text-white/50 transition-colors"
                                                    >
                                                        {showLoginPw ? <EyeOffIcon /> : <EyeOnIcon />}
                                                    </button>
                                                )
                                            }
                                        />
                                    </div>

                                    {/* Forgot password link */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3, duration: 0.4 }}
                                        className="mt-3 flex justify-end"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setForgotEmail(email); // pre-fill if typed
                                                setView("forgot-email");
                                            }}
                                            className="text-xs text-blue-400/70 hover:text-blue-400 transition-colors"
                                        >
                                            Forgot password?
                                        </button>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.32, duration: 0.4 }}
                                        className="mt-4"
                                    >
                                        <SubmitBtn loading={loginLoading} loadingLabel="Logging in…" label="Log in" />
                                    </motion.div>
                                </form>
                            </motion.div>
                        )}

                        {/* ════════════ FORGOT — Step 1: Email ════════════ */}
                        {view === "forgot-email" && (
                            <motion.div
                                key="forgot-email"
                                variants={viewVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={transition}
                            >
                                <form onSubmit={handleSendForgotCode}>
                                    {/* Header */}
                                    <div className="mb-7">
                                        <button
                                            type="button"
                                            onClick={goToLogin}
                                            className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs mb-5 transition-colors"
                                        >
                                            <ArrowLeftIcon />
                                            Back to login
                                        </button>
                                        <h2 className="text-white text-lg font-semibold tracking-tight">Forgot Password</h2>
                                        <p className="text-white/30 text-sm mt-1">Enter your email and we&apos;ll send a reset code.</p>
                                    </div>

                                    {/* Step indicator */}
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                                                1
                                            </div>
                                            <span className="text-[11px] text-blue-400 font-medium">Email</span>
                                        </div>
                                        <div className="flex-1 h-px bg-white/10" />
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/30">
                                                2
                                            </div>
                                            <span className="text-[11px] text-white/25 font-medium">Reset</span>
                                        </div>
                                    </div>

                                    <GlassInput
                                        type="email"
                                        placeholder="Your account email"
                                        value={forgotEmail}
                                        onChange={setForgotEmail}
                                        disabled={sendingCode}
                                        isFocused={forgotEmailFocused}
                                        onFocus={() => setForgotEmailFocused(true)}
                                        onBlur={() => setForgotEmailFocused(false)}
                                        icon={<MailIcon />}
                                        autoFocus
                                    />

                                    <div className="mt-5">
                                        <SubmitBtn
                                            loading={sendingCode}
                                            disabled={!forgotEmail.trim()}
                                            loadingLabel="Sending code…"
                                            label="Send Reset Code"
                                        />
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {/* ════════════ FORGOT — Step 2: Code + New Password ════════════ */}
                        {view === "forgot-code" && (
                            <motion.div
                                key="forgot-code"
                                variants={viewVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={transition}
                            >
                                <form onSubmit={handleResetPassword}>
                                    {/* Header */}
                                    <div className="mb-6">
                                        <button
                                            type="button"
                                            onClick={() => setView("forgot-email")}
                                            className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs mb-5 transition-colors"
                                        >
                                            <ArrowLeftIcon />
                                            Back
                                        </button>
                                        <h2 className="text-white text-lg font-semibold tracking-tight">Reset Password</h2>
                                        <p className="text-white/30 text-sm mt-1">
                                            Enter the code sent to <span className="text-blue-400/80 font-mono text-xs">{forgotEmail}</span>
                                        </p>
                                    </div>

                                    {/* Step indicator */}
                                    <div className="flex items-center gap-2 mb-5">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center">
                                                <svg
                                                    className="w-2.5 h-2.5 text-white"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={3}
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="text-[11px] text-emerald-400 font-medium">Email</span>
                                        </div>
                                        <div className="flex-1 h-px bg-blue-500/40" />
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                                                2
                                            </div>
                                            <span className="text-[11px] text-blue-400 font-medium">Reset</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {/* 6-digit code */}
                                        <div>
                                            <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-1.5">
                                                Verification Code
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={6}
                                                    placeholder="000000"
                                                    value={forgotCode}
                                                    onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, ""))}
                                                    onFocus={() => setForgotCodeFocused(true)}
                                                    onBlur={() => setForgotCodeFocused(false)}
                                                    autoFocus
                                                    className="w-full h-12 bg-white/4 border border-white/10 rounded-lg text-white text-xl font-bold text-center tracking-[0.5em] placeholder-white/15 focus:outline-none focus:border-blue-500/60 focus:bg-white/6 transition-all duration-200 font-mono"
                                                />
                                                <motion.div
                                                    animate={{ opacity: forgotCodeFocused ? 1 : 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="absolute inset-0 rounded-lg pointer-events-none shadow-[0_0_0_1px_rgba(59,130,246,0.3),0_0_16px_rgba(59,130,246,0.08)]"
                                                />
                                            </div>
                                            {/* Code progress dots */}
                                            <div className="flex justify-center gap-1.5 mt-2">
                                                {[0, 1, 2, 3, 4, 5].map((i) => (
                                                    <div
                                                        key={i}
                                                        className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${i < forgotCode.length ? "bg-blue-500 scale-110" : "bg-white/15"}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* New password */}
                                        <div>
                                            <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-1.5">
                                                New Password
                                            </label>
                                            <GlassInput
                                                type={showNewPw ? "text" : "password"}
                                                placeholder="New password"
                                                value={newPw}
                                                onChange={setNewPw}
                                                disabled={resettingPw}
                                                isFocused={newPwFocused}
                                                onFocus={() => setNewPwFocused(true)}
                                                onBlur={() => setNewPwFocused(false)}
                                                rightSlot={
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewPw((p) => !p)}
                                                        className="text-white/25 hover:text-white/50 transition-colors"
                                                    >
                                                        {showNewPw ? <EyeOffIcon /> : <EyeOnIcon />}
                                                    </button>
                                                }
                                            />
                                            {/* Strength bar */}
                                            <StrengthBar password={newPw} />
                                            {/* Requirements — show when typing */}
                                            {newPw.length > 0 && <PwRequirements password={newPw} />}
                                        </div>

                                        {/* Confirm password */}
                                        <div>
                                            <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-1.5">
                                                Confirm Password
                                            </label>
                                            <div className="relative">
                                                <GlassInput
                                                    type={showConfirmPw ? "text" : "password"}
                                                    placeholder="Repeat new password"
                                                    value={confirmPw}
                                                    onChange={setConfirmPw}
                                                    disabled={resettingPw}
                                                    isFocused={confirmPwFocused}
                                                    onFocus={() => setConfirmPwFocused(true)}
                                                    onBlur={() => setConfirmPwFocused(false)}
                                                    rightSlot={
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowConfirmPw((p) => !p)}
                                                            className="text-white/25 hover:text-white/50 transition-colors"
                                                        >
                                                            {showConfirmPw ? <EyeOffIcon /> : <EyeOnIcon />}
                                                        </button>
                                                    }
                                                />
                                            </div>
                                            <AnimatePresence>
                                                {pwMismatch && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -4 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -4 }}
                                                        className="text-[11px] text-red-400 mt-1"
                                                    >
                                                        Passwords do not match
                                                    </motion.p>
                                                )}
                                                {pwMatch && (
                                                    <motion.p
                                                        initial={{ opacity: 0, y: -4 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -4 }}
                                                        className="text-[11px] text-emerald-400 mt-1"
                                                    >
                                                        Passwords match ✓
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    <div className="mt-5 space-y-2">
                                        <SubmitBtn
                                            loading={resettingPw}
                                            disabled={forgotCode.length !== 6 || !newPw || pwMismatch}
                                            loadingLabel="Resetting password…"
                                            label="Reset Password"
                                        />

                                        {/* Resend link */}
                                        <button
                                            type="button"
                                            onClick={handleSendForgotCode}
                                            disabled={sendingCode}
                                            className="w-full text-xs text-white/25 hover:text-white/50 transition-colors py-1 disabled:opacity-40"
                                        >
                                            {sendingCode ? "Resending…" : "Didn't receive it? Resend code"}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bottom glow border */}
                <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-1/2 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
            </motion.div>
        </main>
    );
}
