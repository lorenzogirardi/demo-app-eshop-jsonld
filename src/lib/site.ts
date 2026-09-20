export const STORE_NAME = process.env.STORE_NAME || "GD Platform Engineering";
export const STORE_CURRENCY = "GBP";

export function siteUrl(): string {
  return (process.env.URL || "http://localhost:3000").replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
