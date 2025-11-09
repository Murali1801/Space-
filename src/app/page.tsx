import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-slate-900 to-slate-950" />
      <header className="relative z-10 border-b border-white/5 bg-slate-950/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-lg font-semibold tracking-tight text-white">
            Space Builder
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/login"
              className="rounded-md border border-white/10 px-4 py-2 font-medium text-slate-200 transition hover:border-indigo-500 hover:text-white"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-indigo-500 px-4 py-2 font-medium text-white transition hover:bg-indigo-400"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col">
        <section className="flex flex-1 items-center">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-10 px-6 py-16 lg:flex-row lg:items-center">
            <div className="flex-1 space-y-6">
              <span className="inline-flex items-center rounded-full border border-white/10 bg-slate-900/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300">
                Shopify page builder
              </span>
              <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                Design, publish, and iterate on Shopify pages without code.
              </h1>
              <p className="max-w-xl text-base text-slate-300 sm:text-lg">
                Space brings a Replo-like drag-and-drop experience to your storefront. Collaborate with team members,
                reuse templates, and publish changes instantly to your theme.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-md bg-indigo-500 px-5 py-3 text-base font-semibold text-white transition hover:bg-indigo-400"
                >
                  Create your account
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-md border border-white/10 px-5 py-3 text-base font-semibold text-slate-200 transition hover:border-indigo-500 hover:text-white"
                >
                  See how it works
                </Link>
              </div>
              <dl className="grid grid-cols-2 gap-6 text-sm text-slate-400 sm:max-w-lg">
                <div>
                  <dt className="font-semibold text-slate-200">Drag-and-drop builder</dt>
                  <dd>Ship landing pages in minutes with reusable sections.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-200">Shopify native</dt>
                  <dd>Publish theme sections and templates straight to your store.</dd>
                </div>
              </dl>
            </div>

            <div className="flex-1">
              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-lg shadow-indigo-500/20">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 text-lg font-semibold text-white">
                      S
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white">Visual canvas</p>
                      <p className="text-xs text-slate-400">Sections, headings, buttons, embeds & more</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-400">
                    Live preview
                  </span>
                </div>
                <div className="mt-5 space-y-4 text-sm text-slate-200">
                  <div className="rounded-lg border border-white/5 bg-slate-950/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Drag components</p>
                    <p className="mt-2 text-sm text-slate-300">Choose from hero sections, product spotlights, FAQs, and more.</p>
                  </div>
                  <div className="rounded-lg border border-white/5 bg-slate-950/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Connect Shopify</p>
                    <p className="mt-2 text-sm text-slate-300">
                      Publish to Online Store 2.0 themes with one click—no copy-pasting Liquid.
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/5 bg-slate-950/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Collaborate</p>
                    <p className="mt-2 text-sm text-slate-300">Invite teammates and maintain brand consistency across launches.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-t border-white/5 bg-slate-950/80 py-16">
          <div className="mx-auto w-full max-w-6xl px-6">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">How Space works</h2>
            <div className="mt-8 grid gap-8 lg:grid-cols-3">
              <article className="rounded-xl border border-white/10 bg-slate-900/70 p-6">
                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">1. Create</span>
                <h3 className="mt-3 text-lg font-semibold text-white">Sign up and connect your team</h3>
                <p className="mt-2 text-sm text-slate-300">
                  Log in with email or Google, invite collaborators, and sync brand assets with your workspace.
                </p>
              </article>
              <article className="rounded-xl border border-white/10 bg-slate-900/70 p-6">
                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">2. Design</span>
                <h3 className="mt-3 text-lg font-semibold text-white">Build pages visually</h3>
                <p className="mt-2 text-sm text-slate-300">
                  Drag components onto the canvas, edit content in the inspector, and preview sections instantly.
                </p>
              </article>
              <article className="rounded-xl border border-white/10 bg-slate-900/70 p-6">
                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">3. Publish</span>
                <h3 className="mt-3 text-lg font-semibold text-white">Deploy to Shopify</h3>
                <p className="mt-2 text-sm text-slate-300">
                  Connect your store once, then publish sections and templates directly to your theme.
                </p>
              </article>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/5 bg-slate-950/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-slate-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Space Labs. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="transition hover:text-white">
              Log in
            </Link>
            <Link href="/signup" className="transition hover:text-white">
              Create account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
