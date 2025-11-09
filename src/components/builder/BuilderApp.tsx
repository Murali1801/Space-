"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { BuilderShell } from "@/components/builder/BuilderShell";
import { BuilderCanvas } from "@/components/builder/BuilderCanvas";
import { ComponentPanel } from "@/components/builder/ComponentPanel";
import { InspectorPanel } from "@/components/builder/InspectorPanel";
import { useBuilderPersistence } from "@/hooks/useBuilderPersistence";
import { usePublish } from "@/hooks/usePublish";
import { useBuilderStore, selectHasChanges } from "@/lib/builder/store";

const formatTimestamp = (iso?: string) => {
  if (!iso) {
    return "never";
  }

  try {
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch (error) {
    return "unknown";
  }
};

const SaveBadge = ({ status, lastSavedAt }: { status: string; lastSavedAt?: string }) => {
  switch (status) {
    case "loading":
      return <span className="text-xs text-slate-400">Loading draft…</span>;
    case "saving":
      return <span className="text-xs text-indigo-300">Saving…</span>;
    case "saved":
      return <span className="text-xs text-slate-400">Saved {formatTimestamp(lastSavedAt)}</span>;
    case "error":
      return <span className="text-xs text-red-300">Save failed</span>;
    default:
      return <span className="text-xs text-slate-500">Draft up to date</span>;
  }
};

const PublishBadge = ({ status, error }: { status: string; error?: string | null }) => {
  switch (status) {
    case "loading":
      return <span className="text-xs text-indigo-300">Publishing…</span>;
    case "success":
      return <span className="text-xs text-emerald-300">Published</span>;
    case "error":
      return <span className="text-xs text-red-400">{error ?? "Publish failed"}</span>;
    default:
      return null;
  }
};

const HeaderActions = ({
  saveStatus,
  lastSavedAt,
  publishStatus,
  publishError,
  onPublish,
  publishDisabled,
}: {
  saveStatus: string;
  lastSavedAt?: string;
  publishStatus: string;
  publishError?: string | null;
  onPublish: () => void;
  publishDisabled: boolean;
}) => (
  <div className="flex items-center gap-3 text-sm">
    <Link
      href="/app"
      className="rounded-md border border-slate-700 px-3 py-1.5 text-slate-300 transition hover:border-indigo-500 hover:text-indigo-200"
    >
      Dashboard
    </Link>
    <div className="flex flex-col gap-0.5">
      <SaveBadge status={saveStatus} lastSavedAt={lastSavedAt} />
      <PublishBadge status={publishStatus} error={publishError} />
    </div>
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
      className="rounded-md bg-indigo-500 px-3 py-1.5 font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-700"
      onClick={onPublish}
      disabled={publishDisabled}
    >
      Publish draft
    </button>
  </div>
);

const MissingShopNotice = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 text-slate-200">
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-8 py-10 text-center">
      <h1 className="text-lg font-semibold">Missing Shopify store context</h1>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        Install the Space Page Builder app from your Shopify admin to load and edit drafts for a store. Make sure the
        `shop` parameter is present in the URL (e.g. `?shop=my-store.myshopify.com`).
      </p>
    </div>
  </div>
);

export function BuilderApp() {
  const searchParams = useSearchParams();
  const shop = searchParams.get("shop");
  const pageId = searchParams.get("page") ?? "landing-page";

  const persistence = useBuilderPersistence({ shop, pageId });
  const {
    publish: triggerPublish,
    status: publishStatus,
    error: publishError,
  } = usePublish({ shop, pageId });
  const hasChanges = useBuilderStore(selectHasChanges);

  const publishDisabled =
    !shop ||
    hasChanges ||
    persistence.status === "saving" ||
    persistence.status === "loading" ||
    publishStatus === "loading";

  const header = useMemo(
    () => (
      <HeaderActions
        saveStatus={persistence.status}
        lastSavedAt={persistence.lastSavedAt}
        publishStatus={publishStatus}
        publishError={publishError}
        onPublish={() => triggerPublish()}
        publishDisabled={publishDisabled}
      />
    ),
    [persistence.status, persistence.lastSavedAt, publishStatus, publishError, triggerPublish, publishDisabled],
  );

  if (!shop) {
    return <MissingShopNotice />;
  }

  return <BuilderShell header={header} componentPanel={<ComponentPanel />} canvas={<BuilderCanvas />} inspector={<InspectorPanel />} />;
}
