export function CanvasPlaceholder() {
  return (
    <div className="flex flex-1 flex-col rounded-lg border border-dashed border-slate-700 bg-slate-900/30">
      <div className="border-b border-slate-800 bg-slate-900/60 px-4 py-2 text-xs uppercase tracking-wide text-slate-400">
        Page canvas
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/60 text-2xl font-semibold text-slate-200">
          {'</>'}
        </div>
        <div className="space-y-2">
          <p className="text-base font-semibold text-slate-100">Start building your Shopify section</p>
          <p className="text-sm text-slate-400">
            Drag components from the left panel or choose a template to kickstart your landing page.
          </p>
        </div>
      </div>
    </div>
  );
}
