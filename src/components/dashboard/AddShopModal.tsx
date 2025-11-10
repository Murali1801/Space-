"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

import { normalizeShopDomain } from "@/lib/shopify/utils";

type AddShopModalProps = {
  onClose: () => void;
  onComplete: (details: { name: string; domain: string | null; usesShopify: boolean }) => void;
};

export function AddShopModal({ onClose, onComplete }: AddShopModalProps) {
  const [shopName, setShopName] = useState("");
  const [selection, setSelection] = useState<"yes" | "no" | null>(null);
  const [shopDomain, setShopDomain] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [selection, shopName, shopDomain]);

  const handleSubmit = () => {
    if (!shopName.trim() || selection === null) {
      return;
    }

    if (selection === "yes") {
      const normalized = normalizeShopDomain(shopDomain);
      if (!normalized) {
        setError("Enter a valid Shopify store domain.");
        return;
      }
      onComplete({ name: shopName.trim(), domain: normalized, usesShopify: true });
      return;
    }

    onComplete({ name: shopName.trim(), domain: null, usesShopify: false });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-10" onClick={onClose}>
      <div
        className="w-full max-w-3xl rounded-2xl border border-[#DDE4F2] bg-white p-8 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#111827]">Tell us about your shop</h2>
            <p className="mt-2 text-sm text-[#6B7280]">
              We&apos;ll use this info to tailor recommendations for you.
            </p>
          </div>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#1F2937]">
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[#374151]">What&apos;s the name of your business?</span>
            <input
              placeholder="Enter your shop's name"
              value={shopName}
              onChange={(event) => setShopName(event.target.value)}
              className="rounded-lg border border-[#D1D5DB] px-4 py-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none"
            />
          </label>

          <div className="space-y-3">
            <p className="text-sm font-medium text-[#374151]">Does your business use Shopify?</p>
            <div className="grid gap-4 md:grid-cols-2">
              <OptionCard
                title="No"
                description="I don't use Shopify for my business."
                selected={selection === "no"}
                onClick={() => setSelection("no")}
              />
              <OptionCard
                title="Yes"
                description="I have an existing Shopify store I use for my business."
                selected={selection === "yes"}
                onClick={() => setSelection("yes")}
                gradient
              />
            </div>
          </div>

          {selection === "yes" ? (
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[#374151]">Shopify store domain</span>
              <input
                placeholder="your-brand.myshopify.com"
                value={shopDomain}
                onChange={(event) => setShopDomain(event.target.value)}
                className="rounded-lg border border-[#D1D5DB] px-4 py-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none"
              />
              <span className="text-xs text-[#6B7280]">
                We&apos;ll send you to Shopify to connect the Space app using this store.
              </span>
            </label>
          ) : null}

          {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button className="text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8]" onClick={onClose}>
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              !shopName.trim() || selection === null || (selection === "yes" && !shopDomain.trim())
            }
            className="inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1E3A8A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}

type OptionCardProps = {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  gradient?: boolean;
};

const OptionCard = ({ title, description, selected, onClick, gradient }: OptionCardProps) => (
  <button
    onClick={onClick}
    className={clsx(
      "relative flex w-full flex-col overflow-hidden rounded-2xl border px-5 py-6 text-left transition",
      gradient
        ? "border-[#F4A261]/60 bg-gradient-to-br from-[#2D0B43] via-[#28154D] to-[#FF7E28] text-white"
        : "border-[#DDE4F2] bg-white text-[#1F2937]",
      selected ? "ring-2 ring-[#2563EB]" : "hover:border-[#2563EB]",
    )}
  >
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className={clsx("text-lg font-semibold", gradient ? "text-white" : "text-[#111827]")}>{title}</p>
        <p className={clsx("mt-2 text-sm", gradient ? "text-[#E5E7EB]" : "text-[#6B7280]")}>{description}</p>
      </div>
      <span className="text-4xl" role="img" aria-hidden>
        {gradient ? "🛍️" : "🏪"}
      </span>
    </div>
  </button>
);


