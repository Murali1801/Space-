"use client";

import { BLOCK_GROUPS } from "@/lib/builder/definitions";
import { useBuilderStore } from "@/lib/builder/store";

export function ComponentPanel() {
  const addBlock = useBuilderStore((state) => state.addBlock);

  return (
    <div className="flex flex-1 flex-col rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Components</h2>
        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">beta</span>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {BLOCK_GROUPS.map((group) => (
          <div key={group.name} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{group.name}</p>
            <div className="space-y-2">
              {group.blocks.map((block) => (
                <button
                  key={block.type}
                  type="button"
                  onClick={() => addBlock(block.type)}
                  className="w-full rounded-md border border-slate-800 bg-slate-900/70 px-3 py-2 text-left transition hover:border-indigo-500 hover:bg-slate-900"
                >
                  <p className="text-sm font-medium text-slate-100">{block.label}</p>
                  <p className="text-xs text-slate-500">{block.description}</p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
