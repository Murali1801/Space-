"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";
import { ConnectShopifyForm } from "@/components/dashboard/ConnectShopifyForm";
import { ConnectedShopsList } from "@/components/dashboard/ConnectedShopsList";

type PageRow = {
  id: string;
  name: string;
  lastEdited: string;
  type: "Page" | "Product template" | "Section" | "Blog";
  status?: "live" | "draft";
};

const defaultPages: PageRow[] = [
  { id: "shipping-policy", name: "Shipping Policy", lastEdited: "5 months ago", type: "Page", status: "live" },
  { id: "support", name: "Support", lastEdited: "5 months ago", type: "Page", status: "live" },
  { id: "home-temp", name: "Home Temp", lastEdited: "5 months ago", type: "Page" },
  { id: "return-policy", name: "Return Policy", lastEdited: "5 months ago", type: "Page", status: "live" },
  { id: "home", name: "Home", lastEdited: "5 months ago", type: "Page" },
];

const TABS = [
  { key: "all", label: "All" },
  { key: "pages", label: "Pages" },
  { key: "templates", label: "Product Templates" },
  { key: "sections", label: "Sections" },
  { key: "blogs", label: "Blogs" },
];

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("all");

  const primaryShop = useMemo(() => {
    if (profile?.lastConnectedShop && profile.shops?.[profile.lastConnectedShop]) {
      return profile.shops[profile.lastConnectedShop];
    }
    const first = profile?.shops ? Object.values(profile.shops)[0] : null;
    return first ?? null;
  }, [profile]);

  const shopLabel = primaryShop?.domain ?? "Space Workspace";
  const greeting = user?.displayName ?? user?.email ?? "Welcome back";

  const filteredPages = useMemo(() => {
    switch (activeTab) {
      case "pages":
        return defaultPages.filter((page) => page.type === "Page");
      case "templates":
        return defaultPages.filter((page) => page.type === "Product template");
      case "sections":
        return defaultPages.filter((page) => page.type === "Section");
      case "blogs":
        return defaultPages.filter((page) => page.type === "Blog");
      default:
        return defaultPages;
    }
  }, [activeTab]);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="hidden w-60 flex-col border-r border-white/5 bg-slate-950/80 px-6 py-8 text-sm md:flex">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-slate-500">Workspace</p>
          <p className="text-lg font-semibold text-white">{shopLabel}</p>
          <p className="text-xs text-slate-500">{greeting}</p>
        </div>

        <nav className="mt-10 space-y-1">
          <NavItem label="Pages" active />
          <NavItem label="Analytics" />
          <NavItem label="A/B Testing" />
          <NavItem label="Settings" />
        </nav>

        <div className="mt-auto">
          <div className="rounded-lg border border-white/10 bg-slate-900/70 px-4 py-3 text-xs text-slate-400">
            <p className="font-medium text-slate-200">Need help?</p>
            <p className="mt-1">
              Our team is happy to help configure your theme or answer any questions about Space.
            </p>
            <Link
              href="mailto:support@spacebuilder.app"
              className="mt-3 inline-flex items-center gap-1 text-indigo-300 hover:text-indigo-200"
            >
              Contact support →
            </Link>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
          <header className="flex flex-col gap-6 rounded-2xl border border-white/5 bg-gradient-to-br from-indigo-500/10 via-slate-900/70 to-slate-950 p-8 shadow-lg shadow-indigo-500/10 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <span className="inline-flex items-center rounded-full border border-white/10 bg-slate-900/60 px-3 py-1 text-xs uppercase tracking-[0.32em] text-indigo-200">
                Updates
              </span>
              <h1 className="text-3xl font-semibold text-white">
                Updates to our plans and pricing
              </h1>
              <p className="max-w-2xl text-sm text-slate-300">
                We&apos;re consolidating our Shopify theme editor and Space Page Builder into one simple plan. Manage sections,
                templates, and analytics without leaving this dashboard.
              </p>
              <Link
                href="https://spacebuilder.app/changelog"
                className="inline-flex items-center text-xs font-medium text-indigo-300 transition hover:text-indigo-200"
              >
                See full details →
              </Link>
            </div>
            <div className="self-start rounded-xl border border-white/10 bg-slate-900/60 px-6 py-4 text-sm text-slate-400">
              <p className="text-xs uppercase tracking-widest text-slate-500">Quick actions</p>
              <ul className="mt-3 space-y-2">
                <li>• Import sections from Replo</li>
                <li>• Sync your Shopify theme</li>
                <li>• Create A/B experiments</li>
              </ul>
              <Link
                href="/app/builder"
                className="mt-4 inline-flex rounded-md bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-400"
              >
                Open builder
              </Link>
            </div>
          </header>

          <section className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 items-center gap-3">
                <label className="relative flex w-full max-w-xs items-center">
                  <input
                    type="search"
                    placeholder="Search pages"
                    className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                  />
                  <span className="pointer-events-none absolute right-3 text-xs uppercase tracking-widest text-slate-500">
                    ⌘K
                  </span>
                </label>
                <div className="relative hidden text-xs text-slate-400 sm:inline-flex">
                  <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900 px-3 py-2">
                    <span>Last Modified</span>
                    <svg
                      className="h-3 w-3 text-slate-500"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </label>
                </div>
              </div>
              <button className="inline-flex items-center justify-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 transition hover:bg-indigo-400">
                + New Page
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={clsx(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                    activeTab === tab.key
                      ? "bg-indigo-500 text-white"
                      : "border border-white/10 bg-slate-900/60 text-slate-300 hover:border-indigo-400 hover:text-indigo-200",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/80">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-xs uppercase tracking-widest text-slate-500">
                    <th className="px-5 py-3 text-left font-semibold">Name</th>
                    <th className="px-5 py-3 text-left font-semibold">Last Edited</th>
                    <th className="px-5 py-3 text-left font-semibold">Type</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPages.map((page) => (
                    <tr
                      key={page.id}
                      className="border-b border-white/5 transition hover:bg-slate-900/60 last:border-b-0"
                    >
                      <td className="flex items-center gap-3 px-5 py-4 font-medium text-white">
                        {page.status === "live" ? (
                          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
                        ) : (
                          <span className="inline-flex h-2 w-2 rounded-full bg-slate-600"></span>
                        )}
                        {page.name}
                      </td>
                      <td className="px-5 py-4 text-slate-400">{page.lastEdited}</td>
                      <td className="px-5 py-4 text-slate-400">{page.type}</td>
                      <td className="px-5 py-4 text-right">
                        <button className="rounded-md border border-white/10 px-3 py-1 text-xs text-slate-300 transition hover:border-indigo-400 hover:text-indigo-200">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <ConnectedShopsList />
            <ConnectShopifyForm />
          </section>
        </div>
      </main>
    </div>
  );
}

const NavItem = ({ label, active = false }: { label: string; active?: boolean }) => (
  <div
    className={clsx(
      "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition",
      active
        ? "border border-white/15 bg-indigo-500/20 text-white shadow-sm shadow-indigo-500/20"
        : "text-slate-400 hover:border hover:border-white/10 hover:text-white",
    )}
  >
    <span>{label}</span>
    {active ? (
      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
    ) : (
      <span className="inline-flex h-2 w-2 rounded-full bg-slate-600"></span>
    )}
  </div>
);

