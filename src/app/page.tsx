import Link from "next/link";

import { BuilderShell } from "@/components/builder/BuilderShell";
import { BuilderCanvas } from "@/components/builder/BuilderCanvas";
import { ComponentPanel } from "@/components/builder/ComponentPanel";
import { InspectorPanel } from "@/components/builder/InspectorPanel";

const HeaderActions = () => (
  <div className="flex items-center gap-2 text-sm">
    <Link
      href="https://partners.shopify.com/"
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-md border border-slate-700 px-3 py-1.5 text-slate-300 transition hover:border-indigo-500 hover:text-indigo-200"
    >
      Shopify partner console
    </Link>
    <button
      type="button"
      className="rounded-md bg-indigo-500 px-3 py-1.5 font-medium text-white transition hover:bg-indigo-400"
      disabled
    >
      Publish draft
    </button>
  </div>
);

export default function Home() {
  return (
    <BuilderShell
      header={<HeaderActions />}
      componentPanel={<ComponentPanel />}
      canvas={<BuilderCanvas />}
      inspector={<InspectorPanel />}
    />
  );
}
