"use client";

import { FormEvent, useMemo, useState } from "react";

import { useAuth } from "@/hooks/useAuth";

const normalizeShopDomain = (input: string) => {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) {
    return "";
  }

  if (trimmed.endsWith(".myshopify.com")) {
    return trimmed;
  }

  return `${trimmed.replace(/\.myshopify\.com$/, "")}.myshopify.com`;
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

    if (connectedShops.includes(normalized)) {
      setError("This store is already connected to your account.");
      return;
    }

    setLoading(true);
    const installUrl = `/api/shopify/install?shop=${encodeURIComponent(normalized)}&userId=${encodeURIComponent(
      user.uid,
    )}`;
    window.location.href = installUrl;
  };

  return (
    <form className="space-y-4 rounded-xl border border-white/10 bg-slate-900/60 p-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Connect your Shopify store</h2>
        <p className="text-sm text-slate-400">
          Install the Space app on your store to sync drafts, publish sections, and manage Shopify templates directly from
          the builder.
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>
      ) : null}

      <label className="space-y-1 text-sm">
        <span className="text-slate-200">Shopify store domain</span>
        <input
          type="text"
          placeholder="your-brand.myshopify.com"
          value={shopInput}
          onChange={(event) => setShopInput(event.target.value)}
          className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Redirecting…" : "Connect Shopify store"}
      </button>

      <p className="text-xs text-slate-500">
        You&apos;ll be redirected to Shopify to approve the installation. After accepting, come back here to open the builder.
      </p>
    </form>
  );
}

