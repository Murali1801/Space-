import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";

import { env } from "@/lib/env";
import { getFirebaseAdminFirestore } from "@/lib/firebase/server";

const SHOP_PARAM_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;

const getRedirectUri = () => `${env.SHOPIFY_APP_URL}`;

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

  const cookieStore = cookies();
  const storedState = cookieStore.get("shopify_oauth_state")?.value;

  if (!storedState || storedState !== state) {
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
  await db
    .collection("shops")
    .doc(shop)
    .set(
      {
        accessToken: tokenPayload.access_token,
        scopes: tokenPayload.scope?.split(",") ?? [],
        installedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

  const redirectUrl = new URL(getRedirectUri());
  redirectUrl.searchParams.set("shop", shop);

  return NextResponse.redirect(redirectUrl.toString());
}
