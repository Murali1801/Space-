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

const getMainThemeId = async (shop: string, token: string): Promise<number> => {
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
  const mainTheme = Array.isArray(payload.themes)
    ? payload.themes.find((theme: { role: string }) => theme.role === "main")
    : null;

  if (!mainTheme) {
    throw new Error("Main theme not found");
  }

  return Number(mainTheme.id);
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
    throw new Error(`Failed to upload asset ${key} (${response.status}): ${text}`);
  }
};

export async function POST(request: NextRequest) {
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

  const themeId = publishToThemeId ?? (await getMainThemeId(shop, shopDoc.accessToken));

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
}
