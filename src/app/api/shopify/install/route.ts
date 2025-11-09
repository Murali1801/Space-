import crypto from "node:crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { env } from "@/lib/env";

const SHOP_PARAM_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;

const getCallbackUrl = () => `${env.SHOPIFY_APP_URL.replace(/\/$/, "")}/api/shopify/callback`;
const createState = () => crypto.randomBytes(16).toString("hex");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get("shop");
  const userId = searchParams.get("userId");

  if (!shop || !SHOP_PARAM_REGEX.test(shop)) {
    return NextResponse.json({ error: "Invalid or missing shop parameter" }, { status: 400 });
  }

  if (!userId) {
    return NextResponse.json({ error: "Missing user identifier" }, { status: 400 });
  }

  const state = createState();
  const scope = env.SHOPIFY_SCOPES;
  const redirectUri = encodeURIComponent(getCallbackUrl());

  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${env.SHOPIFY_API_KEY}&scope=${encodeURIComponent(
    scope,
  )}&redirect_uri=${redirectUri}&state=${state}&access_mode=offline`;

  const statePayload = JSON.stringify({
    value: state,
    userId,
    createdAt: Date.now(),
  });

  const cookieStore = await cookies();
  cookieStore.set("shopify_oauth_state", statePayload, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 5 * 60,
  });

  return NextResponse.redirect(installUrl);
}
