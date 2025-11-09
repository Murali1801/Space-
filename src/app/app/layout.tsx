import type { ReactNode } from "react";

import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export const metadata = {
  title: "Dashboard | Space Builder",
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
        <DashboardHeader />
        <main className="flex flex-1 flex-col">
          <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</div>
        </main>
      </div>
    </RequireAuth>
  );
}

