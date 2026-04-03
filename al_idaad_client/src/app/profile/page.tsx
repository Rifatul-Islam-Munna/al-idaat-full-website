"use client";

import { useProfileShell } from "@/components/profile/ProfileShell";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { FiMapPin, FiShield, FiUser } from "react-icons/fi";

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
    (completionFields.filter((value) => Boolean(value.trim())).length /
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

  return (
    <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
      <section className="rounded-[32px] border border-border bg-[#faf6ee] p-7 sm:p-9">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              Settings Snapshot
            </span>
            <h2 className="mt-5 font-playfair text-3xl font-bold text-text_dark">
              Your account details, kept neat.
            </h2>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="mt-8 rounded-[28px] border border-white/80 bg-white p-5">
          <div className="flex items-center gap-3">
            <FiUser className="text-brand" />
            <div>
              <p className="text-sm font-semibold text-text_dark">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
              <span>Profile Completion</span>
              <span>{completionScore}%</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-gray-100">
              <div
                className="h-2 rounded-full bg-brand transition-all duration-300"
                style={{ width: `${completionScore}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-[28px] border border-white/80 bg-white p-5">
            <div className="flex items-center gap-3">
              <FiMapPin className="text-brand" />
              <div>
                <p className="text-sm font-semibold text-text_dark">
                  Delivery Profile
                </p>
                <p className="text-xs leading-6 text-gray-500">
                  Saved contact and address data will flow into checkout for a
                  faster order placement experience.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/80 bg-white p-5">
            <div className="flex items-center gap-3">
              <FiShield className="text-brand" />
              <div>
                <p className="text-sm font-semibold text-text_dark">
                  Email Stays Locked
                </p>
                <p className="text-xs leading-6 text-gray-500">
                  Your login email is shown for reference here and is not
                  editable from this screen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-border bg-white p-7 sm:p-9">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
              Account Form
            </p>
            <h2 className="mt-2 text-2xl font-bold text-text_dark">
              Update Your Saved Information
            </h2>
          </div>
          <span className="rounded-full bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
            Used at checkout
          </span>
        </div>

        <form onSubmit={handleProfileSave} className="mt-6 space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
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
                placeholder="Your full name"
              />
            </div>

            <div className="sm:col-span-2">
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

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                Phone
              </label>
              <input
                type="text"
                value={profile.phone}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, phone: event.target.value }))
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

          <div className="rounded-[28px] border border-border bg-gray-50/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
              Delivery Address
            </p>

            <div className="mt-4 grid gap-5 sm:grid-cols-2">
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
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text_dark outline-none transition focus:border-brand"
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
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text_dark outline-none transition focus:border-brand"
                  placeholder="House, road, area"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-sm leading-7 text-gray-500">
              These details are stored in your account and reused during
              checkout so you do not have to type the same information every
              time.
            </p>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving..." : "Update Details"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
