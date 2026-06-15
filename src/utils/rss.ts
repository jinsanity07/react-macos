import type { BearMdData } from "~/types";

/**
 * Strip HTML tags from a string and collapse whitespace.
 * Used for the Bear middle-list `excerpt` summaries.
 */
export const stripHtml = (input: string): string => {
  const doc = new DOMParser().parseFromString(input, "text/html");
  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
};

/**
 * Decode HTML entities in a string (e.g. `&amp;` → `&`).
 * Used for the right-pane body content.
 */
export const decodeEntities = (input: string): string => {
  const doc = new DOMParser().parseFromString(input, "text/html");
  return (doc.documentElement.textContent || "").replace(/ /g, " ");
};

/**
 * Return the first non-empty `textContent` for any of the candidate tag
 * names on `node`. Used to walk RSS fields in preference order
 * (e.g. `content:encoded` → `description`).
 */
export const safeText = (node: Element, tags: string[]): string => {
  for (const tag of tags) {
    const value = node.getElementsByTagName(tag)[0]?.textContent?.trim();
    if (value) return value;
  }
  return "";
};

const slugify = (seed: string): string =>
  seed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const slugifySource = (source: string): string => {
  const slug = slugify(source);
  return slug || "feed";
};

/**
 * Build a deterministic, source-namespaced id for an RSS item.
 * Format: `rss-<source-slug>-<seed-slug>`, falling back to
 * `rss-<source-slug>-<index>` when the seed slugifies to empty.
 */
export const toFeedId = (source: string, seed: string, index: number): string => {
  const sourceSlug = slugifySource(source);
  const seedSlug = slugify(seed);
  return seedSlug ? `rss-${sourceSlug}-${seedSlug}` : `rss-${sourceSlug}-${index}`;
};

/**
 * Map an RSS XML document to an array of `BearMdData` ready for the
 * Bear middle column + right pane.
 *
 * Parsing order per item: `content:encoded` → `description` → fallback
 * text. Each item carries a `source` field (the human-readable name of
 * the feed) for the chip in the Middlebar. IDs are source-namespaced
 * and de-duplicated within a single feed.
 */
export const mapRssItems = (xmlText: string, source: string): BearMdData[] => {
  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  if (xml.querySelector("parsererror")) throw new Error("Invalid RSS response.");

  const usedIds = new Set<string>();

  return Array.from(xml.querySelectorAll("item")).map((item, index) => {
    const title = safeText(item, ["title"]) || `Untitled Post ${index + 1}`;
    const link = safeText(item, ["link"]);
    const guid = safeText(item, ["guid"]);
    const pubDate = safeText(item, ["pubDate"]);
    const rawBody =
      safeText(item, ["content:encoded"]) ||
      safeText(item, ["description"]) ||
      "No article summary is available.";

    const body = decodeEntities(rawBody);
    const summary = stripHtml(body);
    const excerpt = summary.slice(0, 140) + (summary.length > 140 ? "..." : "");

    let id = toFeedId(source, guid || link || title, index);
    if (usedIds.has(id)) id = `${id}-${index}`;
    usedIds.add(id);

    const content = [
      pubDate ? `Published: ${pubDate}` : "",
      body,
      link ? `## Read Full Article\n\n[${link}](${link})` : ""
    ]
      .filter(Boolean)
      .join("\n\n");

    return {
      id,
      title,
      file: link || "",
      icon: "i-material-symbols:rss-feed-rounded",
      excerpt: excerpt || "No excerpt available.",
      link: link || undefined,
      content,
      source,
      pubDate
    };
  });
};
