"use client";

import Link from "next/link";
import { useState } from "react";

import { useAuth } from "@/hooks/useAuth";

export function ConnectedShopsList() {
  const { profile, user } = useAuth();
  const [pendingShop, setPendingShop] = useState<string | null>(null);

  const shops = profile?.shops ? Object.values(profile.shops) : [];

  const handleReinstall = (domain: string) => {
    if (!user) {
      return;
    }
    setPendingShop(domain);
    window.location.href = `/api/shopify/install?shop=${encodeURIComponent(domain)}&userId=${encodeURIComponent(
      user.uid,
    )}`;
  };

  if (shops.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#D1D5DB] bg-white p-6 text-sm text-[#4B5563] shadow-sm">
        <p className="text-base font-semibold text-[#111827]">No stores connected yet</p>
        <p className="mt-2">
          Install the Space app on your Shopify store to pull drafts and publish sections from the builder.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-[#E5EBF3] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#111827]">Connected stores</h2>
        <p className="text-xs text-[#6B7280]">{shops.length} connected</p>
      </div>
      <ul className="space-y-3 text-sm">
        {shops.map((shop) => (
          <li
            key={shop.domain}
            className="flex flex-col gap-3 rounded-lg border border-[#E5EBF3] bg-[#F9FAFB] px-4 py-3 transition hover:border-[#2563EB] sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-[#111827]">{shop.domain}</p>
              <p className="text-xs text-[#6B7280]">
                Connected {shop.installedAt ? new Date(shop.installedAt).toLocaleDateString() : "recently"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleReinstall(shop.domain)}
                disabled={pendingShop === shop.domain}
                className="inline-flex items-center justify-center rounded-md border border-[#D1D5DB] px-3 py-1.5 text-xs font-semibold text-[#4B5563] transition hover:border-[#2563EB] hover:text-[#2563EB] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pendingShop === shop.domain ? "Redirecting…" : "Reinstall app"}
              </button>
              <Link
                href={`/app/builder?shop=${encodeURIComponent(shop.domain)}`}
                className="inline-flex items-center justify-center rounded-md bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#1D4ED8]"
              >
                Open builder
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

