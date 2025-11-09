import crypto from "node:crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { env } from "@/lib/env";
import { getFirebaseAdminFirestore } from "@/lib/firebase/server";

const SHOP_PARAM_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;

const getRedirectUri = () => {
  const baseUrl = env.SHOPIFY_APP_URL.replace(/\/$/, "");
  return `${baseUrl}/app`;
};

const validateHmac = (searchParams: URLSearchParams) => {
  const hmac = searchParams.get("hmac");

  if (!hmac) {
    return false;
  }

  const params = [...searchParams.entries()]
    .filter(([key]) => key !== "signature" && key !== "hmac")
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join("&");

  const digest = crypto
    .createHmac("sha256", env.SHOPIFY_API_SECRET)
    .update(params)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(digest, "hex"), Buffer.from(hmac, "hex"));
  } catch (error) {
    return false;
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get("shop");
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!shop || !SHOP_PARAM_REGEX.test(shop)) {
    return NextResponse.json({ error: "Invalid shop parameter" }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
  }

  if (!validateHmac(searchParams)) {
    return NextResponse.json({ error: "Invalid HMAC signature" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const storedStateRaw = cookieStore.get("shopify_oauth_state")?.value ?? null;

  if (!storedStateRaw) {
    return NextResponse.json({ error: "Missing state cookie" }, { status: 400 });
  }

  let parsedState: { value: string; userId?: string | null } | null = null;
  try {
    parsedState = JSON.parse(storedStateRaw);
  } catch (error) {
    return NextResponse.json({ error: "Failed to parse state cookie" }, { status: 400 });
  }

  if (!parsedState?.value || parsedState.value !== state) {
    return NextResponse.json({ error: "State validation failed" }, { status: 400 });
  }

  cookieStore.delete("shopify_oauth_state");

  const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: env.SHOPIFY_API_KEY,
      client_secret: env.SHOPIFY_API_SECRET,
      code,
    }),
  });

  if (!tokenResponse.ok) {
    const text = await tokenResponse.text();
    console.error("Failed to exchange access token", text);
    return NextResponse.json({ error: "Failed to exchange access token" }, { status: 500 });
  }

  const tokenPayload: { access_token: string; scope: string } = await tokenResponse.json();

  const db = getFirebaseAdminFirestore();
  const installedAt = new Date().toISOString();

  const shopUpdate: Record<string, unknown> = {
    accessToken: tokenPayload.access_token,
    scopes: tokenPayload.scope?.split(",") ?? [],
    installedAt,
    updatedAt: installedAt,
  };

  if (parsedState?.userId) {
    shopUpdate.userIds = FieldValue.arrayUnion(parsedState.userId);
  }

  await db.collection("shops").doc(shop).set(shopUpdate, { merge: true });

  if (parsedState?.userId) {
    await db
      .collection("users")
      .doc(parsedState.userId)
      .set(
        {
          [`shops.${shop}`]: {
            domain: shop,
            installedAt,
          },
          lastConnectedShop: shop,
          updatedAt: installedAt,
        },
        { merge: true },
      );
  }

  const redirectUrl = new URL(getRedirectUri());
  redirectUrl.searchParams.set("shop", shop);

  return NextResponse.redirect(redirectUrl.toString());
}
