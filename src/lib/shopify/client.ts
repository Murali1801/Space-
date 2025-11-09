import { shopifyApi, LATEST_API_VERSION } from "@shopify/shopify-api";
import { env } from "@/lib/env";

const normalizeHost = (host: string) => host.replace(/^https?:\/\//, "");

export const shopify = shopifyApi({
  apiKey: env.SHOPIFY_API_KEY,
  apiSecretKey: env.SHOPIFY_API_SECRET,
  scopes: env.SHOPIFY_SCOPES.split(",").map((scope) => scope.trim()),
  hostName: normalizeHost(env.SHOPIFY_HOST),
  hostScheme: env.SHOPIFY_HOST.startsWith("https://") ? "https" : "http",
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: false,
});
