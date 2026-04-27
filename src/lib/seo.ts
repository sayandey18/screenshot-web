/*
 * Centralised SEO helper for TanStack Router's head() API.
 * Generates title, description, and Open Graph / Twitter meta tags.
 * Child routes always override parent — set defaults in __root.tsx.
 */

const APP_NAME = "ScreenshotAPI";
const APP_DESCRIPTION = "A powerful screenshot API tool";

interface SeoProps {
  title?: string;
  description?: string;
  noIndex?: boolean; // for auth/error pages you don't want indexed
  withTemplate?: boolean; // appends "| ScreenshotAPI" — default true
}

export function seo({ title, description, noIndex = false, withTemplate = true }: SeoProps) {
  const fullTitle = title ? (withTemplate ? `${title} | ${APP_NAME}` : title) : APP_NAME;

  const metaDescription = description ?? APP_DESCRIPTION;

  return [
    { title: fullTitle },
    { name: "description", content: metaDescription },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: metaDescription },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: metaDescription },
    ...(noIndex ? [{ name: "robots", content: "noindex,nofollow" }] : []),
  ];
}
