"use client";

import { useCallback, useState } from "react";

type PublishStatus = "idle" | "loading" | "success" | "error";

type PublishResponse = {
  publishedAt: string;
  themeId: number;
  assets: {
    section: string;
    template: string;
  };
};

export const usePublish = ({ shop, pageId }: { shop?: string | null; pageId: string }) => {
  const [status, setStatus] = useState<PublishStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PublishResponse | null>(null);

  const publish = useCallback(
    async ({ publishToThemeId }: { publishToThemeId?: number } = {}) => {
    if (!shop) {
      setError("Missing shop context");
      setStatus("error");
      return null;
    }

    setStatus("loading");
    setError(null);

      try {
        const response = await fetch(`/api/shopify/publish?shop=${encodeURIComponent(shop)}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pageId,
            publishToThemeId,
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          const message = payload?.error ? JSON.stringify(payload.error) : `Publish failed (${response.status})`;
          throw new Error(message);
        }

        const payload = (await response.json()) as PublishResponse;
        setStatus("success");
        setResult(payload);
        return payload;
      } catch (publishError) {
        console.error("Publish failed", publishError);
        setStatus("error");
        setResult(null);
        setError(publishError instanceof Error ? publishError.message : "Unknown publish error");
        return null;
      }
    },
    [shop, pageId],
  );

  return {
    publish,
    status,
    error,
    result,
  };
};

export type { PublishStatus, PublishResponse };
