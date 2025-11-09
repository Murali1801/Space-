import type { ReactNode } from "react";

interface BuilderShellProps {
  header?: ReactNode;
  componentPanel: ReactNode;
  canvas: ReactNode;
  inspector: ReactNode;
}

export function BuilderShell({
  header,
  componentPanel,
  canvas,
  inspector,
}: BuilderShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded bg-indigo-500 text-lg font-semibold uppercase tracking-wide text-white">
              S
            </span>
            <div>
              <h1 className="text-base font-semibold">Space Page Builder</h1>
              <p className="text-xs text-slate-400">
                Drag components, customize settings, and publish to Shopify.
              </p>
            </div>
          </div>
          {header ? <div className="flex items-center gap-2">{header}</div> : null}
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-7xl flex-1 gap-4 px-6 py-6">
        <section className="flex h-full w-72 flex-col gap-3">
          {componentPanel}
        </section>
        <section className="flex min-h-[70vh] flex-1 flex-col gap-3">
          {canvas}
        </section>
        <section className="flex h-full w-80 flex-col gap-3">
          {inspector}
        </section>
      </main>
    </div>
  );
}
