/*
 * Utility for loading and resolving markdown content at build time via Vite's
 * import.meta.glob. Supports multiple content types (pages, blogs) with a
 * shared slug-based lookup API.
 *
 * Adding a new content type:
 *  1. Add the glob entry to `modules`
 *  2. Add the type to `ContentType`
 *  3. Add a `buildMap` call to `contentMap`
 *
 * Note: import.meta.glob paths must be static literals — Vite resolves
 * them at build time and cannot accept dynamic values.
 */
type ContentType = "pages" | "blogs";

const modules: Record<ContentType, Record<string, string>> = {
  pages: import.meta.glob("@/content/pages/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }) as Record<string, string>,
  blogs: import.meta.glob("@/content/blogs/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }) as Record<string, string>,
};

const VALID_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function buildMap(raw: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(raw)
      .filter(([, content]) => typeof content === "string")
      .map(([path, content]) => {
        const slug = path.split("/").pop()?.replace(/\.md$/, "") ?? "";
        return [slug, content];
      })
      .filter(([slug]) => slug.length > 0)
  );
}

const contentMap: Record<ContentType, Record<string, string>> = {
  pages: buildMap(modules.pages),
  blogs: buildMap(modules.blogs),
};

export function getMarkdownContent(type: ContentType, slug: string): string | null {
  if (!VALID_SLUG.test(slug)) return null;
  return contentMap[type][slug] ?? null;
}

export function getAllSlugs(type: ContentType): string[] {
  return Object.keys(contentMap[type]);
}
