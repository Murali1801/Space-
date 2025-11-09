"use client";

import { useMemo } from "react";

import { useAuth } from "@/hooks/useAuth";
import { ConnectShopifyForm } from "@/components/dashboard/ConnectShopifyForm";
import { ConnectedShopsList } from "@/components/dashboard/ConnectedShopsList";

export default function DashboardPage() {
  const { user, profile } = useAuth();

  const greeting = useMemo(() => {
    if (user?.displayName) {
      return `Hey ${user.displayName.split(" ")[0]}!`;
    }
    if (user?.email) {
      return `Hey ${user.email}!`;
    }
    return "Welcome back!";
  }, [user]);

  return (
    <div className="flex flex-col gap-10">
      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-slate-900/70 to-slate-950 p-8 shadow-xl shadow-indigo-500/10">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-white">{greeting}</h1>
          <p className="max-w-2xl text-sm text-slate-300">
            Connect your Shopify store, collaborate with teammates, and launch new pages faster than ever. Space keeps your
            drafts, assets, and theme templates in sync—once you install the app you can jump straight into the builder.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="rounded-full border border-white/10 px-3 py-1 uppercase tracking-widest text-indigo-200">
              1. Connect store
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1 uppercase tracking-widest text-indigo-200">
              2. Design pages
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1 uppercase tracking-widest text-indigo-200">
              3. Publish to Shopify
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <ConnectedShopsList />
        <ConnectShopifyForm />
      </section>

      <section className="rounded-xl border border-white/10 bg-slate-900/60 p-6 text-sm text-slate-300">
        <h2 className="text-lg font-semibold text-white">Next steps</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5">
          <li>Use the form above to install the Space app on your Shopify store.</li>
          <li>After approving the install, refresh this dashboard—you should see the store in your connected list.</li>
          <li>Click “Open builder” next to the store to jump into your drag-and-drop editor.</li>
          <li>Design your page, publish to Shopify, and swap between drafts directly from the builder interface.</li>
        </ol>
      </section>
    </div>
  );
}

