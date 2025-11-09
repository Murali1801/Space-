"use client";

import { Suspense, useEffect, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { BuilderApp } from "@/components/builder/BuilderApp";
import { useAuth } from "@/hooks/useAuth";

const ShopGuard = ({ children }: { children: ReactNode }) => {
  const { profile, loading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const shopParam = searchParams.get("shop");
  const shops = profile?.shops ? Object.keys(profile.shops) : [];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p className="text-sm text-slate-400">Preparing your workspace…</p>
      </div>
    );
  }

  useEffect(() => {
    if (!shopParam && shops.length === 1) {
      const shop = shops[0];
      router.replace(`/app/builder?shop=${encodeURIComponent(shop)}`);
    }
  }, [router, shopParam, shops]);

  if (!shopParam) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-semibold">Select a Shopify store</h1>
          <p className="text-sm text-slate-400">
            Choose a connected Shopify store from your dashboard and use the “Open builder” button to launch the editor.
          </p>
        </div>
      </div>
    );
  }

  if (!profile?.shops || !profile.shops[shopParam]) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-semibold">Store not connected</h1>
          <p className="text-sm text-slate-400">
            We couldn&apos;t find that Shopify store in your account. Go back to the dashboard and connect it before opening the builder.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-slate-100">Loading builder...</div>}>
      <ShopGuard>
        <BuilderApp />
      </ShopGuard>
    </Suspense>
  );
}

