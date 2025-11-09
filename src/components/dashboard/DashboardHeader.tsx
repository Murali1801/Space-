"use client";

import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";
import { SignOutButton } from "@/components/auth/SignOutButton";

export function DashboardHeader() {
  const { user, profile } = useAuth();
  const lastShop = profile?.lastConnectedShop;
  const builderHref = lastShop ? `/app/builder?shop=${encodeURIComponent(lastShop)}` : "/app/builder";

  return (
    <header className="border-b border-white/5 bg-slate-950/70">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/app" className="text-lg font-semibold text-white">
          Space Workspace
        </Link>
        <div className="flex items-center gap-3 text-sm text-slate-300">
          {user ? (
            <>
              <span className="hidden sm:inline-flex max-w-[180px] truncate">
                {user.displayName ?? user.email ?? "Member"}
              </span>
              <Link
                href={builderHref}
                className="rounded-md bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-400"
              >
                Open builder
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link href="/login" className="text-xs font-semibold text-indigo-300 hover:text-indigo-200">
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

