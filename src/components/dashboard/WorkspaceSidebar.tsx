"use client";

import clsx from "clsx";

import type { WorkspaceSummary } from "@/hooks/useWorkspaces";

type NavKey = "pages" | "analytics" | "ab-testing" | "settings";

const NAV_ITEMS: Array<{ key: NavKey; label: string; icon: string }> = [
  { key: "pages", label: "Pages", icon: "📄" },
  { key: "analytics", label: "Analytics", icon: "📈" },
  { key: "ab-testing", label: "A/B Testing", icon: "🧪" },
  { key: "settings", label: "Settings", icon: "⚙️" },
];

type WorkspaceSidebarProps = {
  workspace: WorkspaceSummary;
  activeNav: NavKey;
  onSelectNav: (key: NavKey) => void;
  onOpenSwitcher: () => void;
  onToggleCollapsed?: () => void;
};

export function WorkspaceSidebar({
  workspace,
  activeNav,
  onSelectNav,
  onOpenSwitcher,
  onToggleCollapsed,
}: WorkspaceSidebarProps) {
  return (
    <aside className="hidden w-64 flex-col rounded-xl border border-[#DDE4F2] bg-white/95 px-5 py-6 shadow-sm sm:flex">
      <div className="rounded-xl border border-[#E4EBF5] bg-white/80 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#EDF2FF] text-[#2563EB]">
                <LogoMark />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#6B7280]">Workspace</p>
                <p className="text-sm font-semibold text-[#111827]">{workspace.name}</p>
                <p className="text-xs text-[#6B7280]">{workspace.owner}</p>
              </div>
            </div>
            <button
              onClick={onOpenSwitcher}
              className="mt-4 inline-flex items-center gap-1 rounded-lg border border-[#E4EBF5] bg-white px-3 py-1.5 text-xs font-semibold text-[#2563EB] transition hover:border-[#2563EB] hover:text-[#1D4ED8]"
            >
              Workspace settings
            </button>
          </div>
          {onToggleCollapsed ? (
            <button
              onClick={onToggleCollapsed}
              className="rounded-full border border-[#E4EBF5] bg-white p-1 text-[#6B7280] hover:text-[#1D4ED8]"
            >
              <span className="sr-only">Toggle collapse</span>
              «
            </button>
          ) : null}
        </div>
      </div>

      <nav className="mt-6 space-y-2 text-sm text-[#374151]">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => onSelectNav(item.key)}
            className={clsx(
              "flex w-full items-center justify-between rounded-lg px-3 py-2 transition",
              activeNav === item.key
                ? "bg-[#EDF2FF] text-[#1D4ED8] shadow-sm"
                : "hover:bg-[#F4F6FB] hover:text-[#1D4ED8]",
            )}
          >
            <span className="flex items-center gap-2">
              <span className="text-base">{item.icon}</span>
              {item.label}
            </span>
            {item.key === "pages" ? (
              <span className="inline-flex h-2 w-2 rounded-full bg-[#34D399]" />
            ) : (
              <span className="inline-flex h-2 w-2 rounded-full bg-[#D1D5DB]" />
            )}
          </button>
        ))}
      </nav>

      <div className="mt-8 space-y-3 rounded-xl border border-[#E4EBF5] bg-white/80 p-4">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-[#9CA3AF]">
          <span>Connected Stores</span>
          <span>{workspace.shops.length}</span>
        </div>
        <ul className="space-y-2 text-sm text-[#1F2937]">
          {workspace.shops.length === 0 ? (
            <li className="rounded-lg border border-dashed border-[#CBD5F5] bg-[#F8FAFF] px-3 py-2 text-xs text-[#6B7280]">
              No stores yet
            </li>
          ) : (
            workspace.shops.map((shop) => (
              <li
                key={shop.id}
                className="flex items-center justify-between rounded-lg border border-[#E4EBF5] px-3 py-2 text-sm"
              >
                <span className="truncate">{shop.name}</span>
                <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-[#34D399]" />
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="mt-auto space-y-3 pt-8 text-xs text-[#4B5563]">
        <FooterLink label="Learn More" />
        <FooterLink label={workspace.owner} />
      </div>
    </aside>
  );
}

const FooterLink = ({ label }: { label: string }) => (
  <div className="flex cursor-pointer items-center justify-between rounded-lg border border-transparent px-2 py-1 hover:border-[#E4EBF5] hover:bg-[#F4F6FB]">
    <span>{label}</span>
    <span>›</span>
  </div>
);

const LogoMark = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="20" height="20" rx="6" fill="currentColor" opacity="0.12" />
    <path
      d="M11.7734 5.125L10.1914 11.5859L8.18945 5.125H6.34766L9.19141 14.8281H11.041L12.7383 8.74219L14.418 14.8281H16.2734L19.1133 5.125H17.3125L15.292 11.5859L13.7109 5.125H11.7734Z"
      fill="currentColor"
    />
  </svg>
);


