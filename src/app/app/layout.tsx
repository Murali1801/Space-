import type { ReactNode } from "react";

import { RequireAuth } from "@/components/auth/RequireAuth";

export const metadata = {
  title: "Dashboard | Space Builder",
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-[#F4F6FB] text-[#111827]">{children}</div>
    </RequireAuth>
  );
}
