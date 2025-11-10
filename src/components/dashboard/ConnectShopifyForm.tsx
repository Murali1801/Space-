"use client";

import { FormEvent, useMemo, useState } from "react";

import { useAuth } from "@/hooks/useAuth";

const normalizeShopDomain = (input: string) => {
  let value = input.trim().toLowerCase();
  if (!value) {
    return "";
  }

  value = value.replace(/^https?:\/\//, "");
  value = value.replace(/^www\./, "");

  const firstSegment = value.split("/")[0]?.trim() ?? "";
  if (!firstSegment) {
    return "";
  }

  if (firstSegment.endsWith(".myshopify.com")) {
    return firstSegment;
  }

  return `${firstSegment.replace(/\.myshopify\.com$/, "")}.myshopify.com`;
};

export function ConnectShopifyForm() {
  const { user, profile } = useAuth();
  const [shopInput, setShopInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const connectedShops = useMemo(
    () => (profile?.shops ? Object.values(profile.shops).map((shop) => shop.domain) : []),
    [profile?.shops],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!user) {
      setError("You need to be logged in before connecting a store.");
      return;
    }

    const normalized = normalizeShopDomain(shopInput);
    if (!normalized) {
      setError("Enter a valid Shopify store domain.");
      return;
    }

    if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(normalized)) {
      setError("Shop domains can only contain letters, numbers, and hyphens.");
      return;
    }

    setLoading(true);
    const installUrl = `/api/shopify/install?shop=${encodeURIComponent(normalized)}&userId=${encodeURIComponent(
      user.uid,
    )}`;
    window.location.href = installUrl;
  };

  return (
    <form
      className="space-y-4 rounded-xl border border-[#E5EBF3] bg-white p-6 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-[#111827]">Connect your Shopify store</h2>
        <p className="text-sm text-[#4B5563]">
          Install the Space app on your store to sync drafts, publish sections, and manage Shopify templates directly from
          the builder.
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-500/20 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      ) : null}

      <label className="space-y-1 text-sm">
        <span className="text-[#111827]">Shopify store domain</span>
        <input
          type="text"
          placeholder="your-brand.myshopify.com"
          value={shopInput}
          onChange={(event) => setShopInput(event.target.value)}
          className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2 text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-md bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Redirecting…" : "Connect or reinstall store"}
      </button>

      <p className="text-xs text-[#6B7280]">
        You&apos;ll be redirected to Shopify to approve the installation. If the app was previously uninstalled, this will
        reinstall it and refresh the access token.
      </p>
    </form>
  );
}

