"use client";

import { useProfileShell } from "@/components/profile/ProfileShell";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";

export default function ProfileSettingsPage() {
  const { user, updateProfile } = useProfileShell();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const profile = {
    name: draft.name ?? user.name ?? "",
    phone: draft.phone ?? user.phone ?? "",
    address: draft.address ?? user.address ?? "",
    city: draft.city ?? user.city ?? "",
    district: draft.district ?? user.district ?? "",
  };

  const completionFields = [
    profile.name,
    profile.phone,
    profile.address,
    profile.city,
    profile.district,
  ];
  const completionScore = Math.round(
    (completionFields.filter((v) => Boolean(v.trim())).length /
      completionFields.length) *
      100,
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

  const field = (
    label: string,
    key: string,
    placeholder: string,
    type = "text",
  ) => (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-400">
        {label}
      </label>
      <input
        type={type}
        value={profile[key as keyof typeof profile]}
        onChange={(e) =>
          setDraft((prev) => ({ ...prev, [key]: e.target.value }))
        }
        placeholder={placeholder}
        className="w-full rounded-2xl border border-border bg-gray-50 px-4 py-3 text-sm text-text_dark outline-none transition focus:border-brand focus:bg-white"
      />
    </div>
  );

  return (
    <div className="rounded-3xl border border-border bg-white p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-text_dark">
          Account Settings
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          These details are saved to your account and reused at checkout.
        </p>
      </div>

      {/* Completion bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-gray-400">
            Profile completion
          </span>
          <span className="text-xs font-semibold text-brand">
            {completionScore}%
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-100">
          <div
            className="h-1.5 rounded-full bg-brand transition-all duration-300"
            style={{ width: `${completionScore}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleProfileSave} className="space-y-5">
        {/* Personal */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            {field("Full Name", "name", "Your full name")}
          </div>

          {/* Email — read only */}
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-400">
              Email Address
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full rounded-2xl border border-border bg-gray-100 px-4 py-3 text-sm text-gray-400 outline-none cursor-not-allowed"
            />
          </div>

          {field("Phone", "phone", "01XXXXXXXXX")}
          {field("District", "district", "District")}
        </div>

        {/* Delivery address */}
        <div className="rounded-2xl border border-border bg-gray-50 p-4 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Delivery Address
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("City / Thana", "city", "City or thana")}
            {field("Street Address", "address", "House, road, area")}
          </div>
        </div>

        {/* Save */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
