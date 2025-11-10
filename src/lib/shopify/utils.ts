export const normalizeShopDomain = (input: string) => {
  let value = input.trim().toLowerCase();
  if (!value) {
    return "";
  }

  value = value.replace(/^https?:\/\//, "");
  value = value.replace(/^www\./, "");

  const firstSegment = value.split("/")[0]?.trim() ?? "";
  if (!firstSegment) {
    return "";
  }

  if (firstSegment.endsWith(".myshopify.com")) {
    return firstSegment;
  }

  return `${firstSegment.replace(/\.myshopify\.com$/, "")}.myshopify.com`;
};


