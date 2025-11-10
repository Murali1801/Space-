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
    <div className="flex min-h-screen bg-[#F6F8FA] text-[#111827]">
      <aside className="hidden w-60 flex-col border-r border-[#E5EBF3] bg-white px-6 py-8 text-sm md:flex">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-[#6B7280]">Workspace</p>
          <p className="text-lg font-semibold text-[#111827]">{shopLabel}</p>
          <p className="text-xs text-[#6B7280]">{greeting}</p>
        </div>

        <nav className="mt-10 space-y-1">
          <NavItem label="Pages" active />
          <NavItem label="Analytics" />
          <NavItem label="A/B Testing" />
          <NavItem label="Settings" />
        </nav>

        <div className="mt-auto">
          <div className="rounded-lg border border-[#E5EBF3] bg-[#F4F6FB] px-4 py-3 text-xs text-[#4B5563]">
            <p className="font-medium text-[#111827]">Need help?</p>
            <p className="mt-1">
              Our team is happy to help configure your theme or answer any questions about Space.
            </p>
            <Link
              href="mailto:support@spacebuilder.app"
              className="mt-3 inline-flex items-center gap-1 text-[#2563EB] hover:text-[#1D4ED8]"
            >
              Contact support →
            </Link>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
          <header className="flex flex-col gap-6 rounded-2xl border border-[#E5EBF3] bg-white p-8 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <span className="inline-flex items-center rounded-full border border-[#E5EBF3] bg-[#F4F6FB] px-3 py-1 text-[10px] uppercase tracking-[0.32em] text-[#2563EB]">
                Updates
              </span>
              <h1 className="text-3xl font-semibold text-[#111827]">
                Updates to our plans and pricing
              </h1>
              <p className="max-w-2xl text-sm text-[#4B5563]">
                We&apos;re consolidating our Shopify theme editor and Space Page Builder into one simple plan. Manage sections,
                templates, and analytics without leaving this dashboard.
              </p>
              <Link
                href="https://spacebuilder.app/changelog"
                className="inline-flex items-center text-xs font-medium text-[#2563EB] transition hover:text-[#1D4ED8]"
              >
                See full details →
              </Link>
            </div>
            <div className="self-start rounded-xl border border-[#E5EBF3] bg-[#F9FAFB] px-6 py-4 text-sm text-[#4B5563]">
              <p className="text-xs uppercase tracking-widest text-[#6B7280]">Quick actions</p>
              <ul className="mt-3 space-y-2">
                <li>• Import sections from Replo</li>
                <li>• Sync your Shopify theme</li>
                <li>• Create A/B experiments</li>
              </ul>
              <Link
                href="/app/builder"
                className="mt-4 inline-flex rounded-md bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
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
                    className="w-full rounded-lg border border-[#E5EBF3] bg-white px-3 py-2 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none"
                  />
                  <span className="pointer-events-none absolute right-3 text-xs uppercase tracking-widest text-[#9CA3AF]">
                    ⌘K
                  </span>
                </label>
                <div className="relative hidden text-xs text-[#4B5563] sm:inline-flex">
                  <label className="flex items-center gap-2 rounded-lg border border-[#E5EBF3] bg-white px-3 py-2">
                    <span className="font-medium text-[#111827]">Last Modified</span>
                    <svg
                      className="h-3 w-3 text-[#9CA3AF]"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </label>
                </div>
              </div>
              <button className="inline-flex items-center justify-center rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1D4ED8]">
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
                      ? "bg-[#2563EB] text-white shadow-sm"
                      : "border border-[#E5EBF3] bg-white text-[#4B5563] hover:border-[#2563EB] hover:text-[#2563EB]",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-[#E5EBF3] bg-white shadow-sm">
              <table className="min-w-full text-sm text-[#1F2937]">
                <thead>
                  <tr className="border-b border-[#E5EBF3] bg-[#F9FAFB] text-xs uppercase tracking-widest text-[#6B7280]">
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
                      className="border-b border-[#F3F4F6] transition hover:bg-[#F9FAFB] last:border-b-0"
                    >
                      <td className="flex items-center gap-3 px-5 py-4 font-medium text-[#111827]">
                        {page.status === "live" ? (
                          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#22C55E]"></span>
                        ) : (
                          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#D1D5DB]"></span>
                        )}
                        {page.name}
                      </td>
                      <td className="px-5 py-4 text-[#6B7280]">{page.lastEdited}</td>
                      <td className="px-5 py-4 text-[#6B7280]">{page.type}</td>
                      <td className="px-5 py-4 text-right">
                        <button className="rounded-md border border-[#E5EBF3] px-3 py-1 text-xs text-[#2563EB] transition hover:border-[#2563EB] hover:bg-[#EEF2FF]">
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
        ? "border border-[#D4DEEE] bg-[#E9F0FF] text-[#1D4ED8] shadow-sm"
        : "text-[#6B7280] hover:border hover:border-[#D4DEEE] hover:bg-[#EEF2FF]",
    )}
  >
    <span>{label}</span>
    {active ? (
      <span className="inline-flex h-2 w-2 rounded-full bg-[#34D399]"></span>
    ) : (
      <span className="inline-flex h-2 w-2 rounded-full bg-[#D1D5DB]"></span>
    )}
  </div>
);

