"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  selectBlocks,
  selectHasChanges,
  selectLastSavedAt,
  useBuilderStore,
} from "@/lib/builder/store";

const ONE_SECOND = 1000;

type SaveStatus = "idle" | "loading" | "saving" | "saved" | "error";

interface UseBuilderPersistenceOptions {
  shop?: string | null;
  pageId: string;
}

interface BuilderPersistenceState {
  status: SaveStatus;
  lastSavedAt?: string;
  error?: string | null;
}

export const useBuilderPersistence = ({ shop, pageId }: UseBuilderPersistenceOptions) => {
  const blocks = useBuilderStore(selectBlocks);
  const hasChanges = useBuilderStore(selectHasChanges);
  const lastSavedAt = useBuilderStore(selectLastSavedAt);
  const hydrate = useBuilderStore((state) => state.hydrate);
  const markSaved = useBuilderStore((state) => state.markSaved);

  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const serializedBlocks = useMemo(() => JSON.stringify(blocks), [blocks]);

  useEffect(() => {
    if (!shop) {
      return;
    }

    const load = async () => {
      setStatus("loading");
      setError(null);

      try {
        const response = await fetch(`/api/pages/${pageId}?shop=${encodeURIComponent(shop)}`);

        if (!response.ok) {
          throw new Error(`Failed to load layout (${response.status})`);
        }

        const payload = await response.json();
        if (Array.isArray(payload.blocks)) {
          hydrate(payload.blocks);
        }

        if (payload.updatedAt) {
          markSaved(payload.updatedAt);
        } else {
          markSaved(new Date().toISOString());
        }

        setStatus("idle");
      } catch (loadError) {
        console.error("Failed to load builder layout", loadError);
        setError(loadError instanceof Error ? loadError.message : "Unknown error");
        setStatus("error");
      }
    };

    load();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shop, pageId, hydrate, markSaved]);

  useEffect(() => {
    if (!shop || !hasChanges) {
      return;
    }

    const save = async () => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setStatus("saving");
      setError(null);

      try {
        const response = await fetch(`/api/pages/${pageId}?shop=${encodeURIComponent(shop)}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            blocks: JSON.parse(serializedBlocks),
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to save layout (${response.status})`);
        }

        const payload = await response.json();
        const timestamp = payload?.updatedAt ?? new Date().toISOString();
        markSaved(timestamp);
        setStatus("saved");
      } catch (saveError) {
        if ((saveError as Error).name === "AbortError") {
          return;
        }
        console.error("Failed to save builder layout", saveError);
        setError(saveError instanceof Error ? saveError.message : "Unknown error");
        setStatus("error");
      }
    };

    const timeout = setTimeout(save, ONE_SECOND * 1.5);
    return () => {
      clearTimeout(timeout);
      controllerRef.current?.abort();
    };
  }, [shop, pageId, hasChanges, serializedBlocks, markSaved]);

  return {
    status,
    lastSavedAt,
    error,
  } satisfies BuilderPersistenceState;
};

export type { SaveStatus, BuilderPersistenceState };
