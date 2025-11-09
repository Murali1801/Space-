import { Suspense } from "react";
import { BuilderApp } from "@/components/builder/BuilderApp";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">Loading builder…</div>}>
      <BuilderApp />
    </Suspense>
  );
}
