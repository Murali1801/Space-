import { NextRequest, NextResponse } from "next/server";
import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { z } from "zod";

import { getFirebaseAdminFirestore } from "@/lib/firebase/server";
import { generateSectionAssets } from "@/lib/publish/generator";
import type { BlockInstance } from "@/lib/builder/schema";

export const runtime = "nodejs";

const SHOP_PARAM_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;

const payloadSchema = z.object({
  pageId: z.string().min(1, "pageId is required"),
  publishToThemeId: z.number().optional(),
});

const getShopDocument = async (shop: string) => {
  const db = getFirebaseAdminFirestore();
  const doc = await db.collection("shops").doc(shop).get();
  return doc.exists ? doc.data() : null;
};

const getPageDocument = async (shop: string, pageId: string) => {
  const db = getFirebaseAdminFirestore();
  const doc = await db.collection("shops").doc(shop).collection("pages").doc(pageId).get();
  return doc.exists ? doc.data() : null;
};

type ShopifyTheme = {
  id: number;
  role: string;
  name: string;
};

const fetchThemes = async (shop: string, token: string): Promise<ShopifyTheme[]> => {
  const response = await fetch(`https://${shop}/admin/api/${LATEST_API_VERSION}/themes.json`, {
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch themes (${response.status})`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload.themes)) {
    return [];
  }

  return payload.themes
    .map((theme: Record<string, unknown>) => ({
      id: Number(theme.id),
      role: String(theme.role ?? ""),
      name: String(theme.name ?? ""),
    }))
    .filter((theme) => !Number.isNaN(theme.id));
};

const uploadAsset = async (shop: string, token: string, themeId: number, key: string, value: string) => {
  const response = await fetch(`https://${shop}/admin/api/${LATEST_API_VERSION}/themes/${themeId}/assets.json`, {
    method: "PUT",
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      asset: {
        key,
        value,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Failed to upload asset ${key} (${response.status}) to theme ${themeId}: ${text || "[no response text]"}`,
    );
  }
};

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get("shop");

    if (!shop || !SHOP_PARAM_REGEX.test(shop)) {
      return NextResponse.json({ error: "Invalid or missing shop parameter" }, { status: 400 });
    }

    const json = await request.json().catch(() => null);
    const parsed = payloadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    const { pageId, publishToThemeId } = parsed.data;

    const shopDoc = await getShopDocument(shop);

    if (!shopDoc?.accessToken) {
      return NextResponse.json({ error: "Shop has not installed the app" }, { status: 403 });
    }

    const pageDoc = await getPageDocument(shop, pageId);

    if (!pageDoc || !Array.isArray(pageDoc.blocks)) {
      return NextResponse.json({ error: "No draft found for this page" }, { status: 404 });
    }

    if (!pageDoc.blocks.length) {
      return NextResponse.json({ error: "Draft is empty. Add blocks before publishing." }, { status: 400 });
    }

    const blocks = pageDoc.blocks as BlockInstance[];
    const assets = generateSectionAssets(pageId, blocks);

    const themes = await fetchThemes(shop, shopDoc.accessToken);

    if (!themes.length) {
      return NextResponse.json({ error: "No themes found for this store" }, { status: 404 });
    }

    let themeId: number;

    if (publishToThemeId !== undefined) {
      const match = themes.find((theme) => theme.id === publishToThemeId);
      if (!match) {
        return NextResponse.json(
          {
            error: `Theme ${publishToThemeId} was not found. Available theme IDs: ${themes
              .map((theme) => `${theme.id} (${theme.role})`)
              .join(", ")}`,
          },
          { status: 404 },
        );
      }
      themeId = publishToThemeId;
    } else {
      const mainTheme = themes.find((theme) => theme.role === "main") ?? themes[0];
      if (!mainTheme) {
        return NextResponse.json({ error: "No eligible theme found to publish to" }, { status: 404 });
      }
      themeId = mainTheme.id;
    }

    await uploadAsset(shop, shopDoc.accessToken, themeId, assets.sectionKey, assets.sectionLiquid);
    await uploadAsset(shop, shopDoc.accessToken, themeId, assets.templateKey, assets.templateJson);

    const db = getFirebaseAdminFirestore();
    await db
      .collection("shops")
      .doc(shop)
      .collection("pages")
      .doc(pageId)
      .set(
        {
          publishedAt: new Date().toISOString(),
          publishedThemeId: themeId,
          publishedAssets: {
            section: assets.sectionKey,
            template: assets.templateKey,
          },
        },
        { merge: true },
      );

    return NextResponse.json({
      publishedAt: new Date().toISOString(),
      themeId,
      assets: {
        section: assets.sectionKey,
        template: assets.templateKey,
      },
    });
  } catch (error) {
    console.error("Publish failed:", error);
    const message =
      error instanceof Error && error.message ? error.message : "Unexpected error while publishing to Shopify";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
