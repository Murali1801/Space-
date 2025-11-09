import { NextResponse } from "next/server";
import { z } from "zod";

import { env } from "@/lib/env";
import { getFirebaseAdminFirestore } from "@/lib/firebase/server";
import type { BlockType } from "@/lib/builder/schema";

const SHOP_PARAM_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;

const blockSchema = z.object({
  id: z.string().min(1),
  type: z.custom<BlockType>((value) => typeof value === "string" && value.length > 0, {
    message: "Invalid block type",
  }),
  props: z.record(z.any()),
});

const payloadSchema = z.object({
  blocks: z.array(blockSchema),
  metadata: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
});

const ensureShopInstalled = async (shop: string) => {
  const db = getFirebaseAdminFirestore();
  const doc = await db.collection("shops").doc(shop).get();

  if (!doc.exists) {
    return false;
  }

  const data = doc.data();
  return Boolean(data?.accessToken);
};

const getPageRef = (shop: string, pageId: string) =>
  getFirebaseAdminFirestore().collection("shops").doc(shop).collection("pages").doc(pageId);

export async function GET(request: Request, { params }: { params: { pageId: string } }) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get("shop");
  const pageId = params.pageId;

  if (!shop || !SHOP_PARAM_REGEX.test(shop)) {
    return NextResponse.json({ error: "Invalid or missing shop parameter" }, { status: 400 });
  }

  if (!pageId) {
    return NextResponse.json({ error: "Missing page identifier" }, { status: 400 });
  }

  const installed = await ensureShopInstalled(shop);
  if (!installed) {
    return NextResponse.json({ error: "Shop is not installed" }, { status: 403 });
  }

  const pageRef = getPageRef(shop, pageId);
  const snapshot = await pageRef.get();

  if (!snapshot.exists) {
    return NextResponse.json({ blocks: [], metadata: null, updatedAt: null, createdAt: null });
  }

  const data = snapshot.data();

  return NextResponse.json({
    blocks: data?.blocks ?? [],
    metadata: data?.metadata ?? null,
    createdAt: data?.createdAt ?? null,
    updatedAt: data?.updatedAt ?? null,
  });
}

export async function POST(request: Request, { params }: { params: { pageId: string } }) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get("shop");
  const pageId = params.pageId;

  if (!shop || !SHOP_PARAM_REGEX.test(shop)) {
    return NextResponse.json({ error: "Invalid or missing shop parameter" }, { status: 400 });
  }

  if (!pageId) {
    return NextResponse.json({ error: "Missing page identifier" }, { status: 400 });
  }

  const installed = await ensureShopInstalled(shop);
  if (!installed) {
    return NextResponse.json({ error: "Shop is not installed" }, { status: 403 });
  }

  const json = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { blocks, metadata } = parsed.data;

  const pageRef = getPageRef(shop, pageId);
  const existing = await pageRef.get();

  const timestamp = new Date().toISOString();
  const payload = {
    blocks,
    metadata: metadata ?? null,
    updatedAt: timestamp,
    createdAt: existing.exists ? existing.data()?.createdAt ?? timestamp : timestamp,
  };

  await pageRef.set(payload, { merge: true });

  return NextResponse.json(payload, { status: 200 });
}
