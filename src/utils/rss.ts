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
 * Map a raw RSS XML document to an array of `BearMdData` ready for the
 * Bear middle column + right pane.
 *
 * Parsing order per item: `content:encoded` → `description` → fallback
 * text. Each item carries a `source` field (the human-readable name of
 * the feed) for the chip in the Middlebar. IDs are source-namespaced
 * and de-duplicated within a single feed.
 */
export const mapRssXml = (xmlText: string, source: string): BearMdData[] => {
  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  if (xml.querySelector("parsererror")) throw new Error("Invalid RSS response.");

  const safeText = (node: Element, tags: string[]): string => {
    for (const tag of tags) {
      const value = node.getElementsByTagName(tag)[0]?.textContent?.trim();
      if (value) return value;
    }
    return "";
  };

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

/**
 * Map a jina.ai-style markdown RSS response to `BearMdData[]`.
 *
 * r.jina.ai (https://r.jina.ai/) is a free public CORS-friendly proxy
 * that returns RSS feeds as a structured markdown document:
 *
 *   Title: <feed name>
 *   URL Source: <feed url>
 *   Published Time: <feed-level date, optional>
 *
 *   Markdown Content:
 *   # <feed name>
 *
 *   ### [Item title](https://item-url)
 *   Item summary (optional)...
 *   [https://item-url](https://item-url)
 *
 *   Tue, 16 Jun 2026 11:26:27 +0000
 *
 *   ### [Next item](...)
 *   ...
 *
 * This parser walks the markdown looking for `### [title](url)` lines
 * (each marks the start of an item) and grabs the date line that
 * immediately precedes the next `###` heading.
 */
export const mapRssJina = (mdText: string, source: string): BearMdData[] => {
  if (!mdText || mdText.startsWith("{")) {
    // jina returns a JSON error envelope (e.g. DNS failures) — bail.
    throw new Error("Invalid jina response.");
  }

  const lines = mdText.split(/\r?\n/);
  const usedIds = new Set<string>();

  type Draft = {
    index: number;
    title: string;
    link: string;
    pubDate: string;
    bodyLines: string[];
  };

  const drafts: Draft[] = [];
  let current: Draft | null = null;

  // Recognize the start of an item: `### [title](url)` (markdown H3
  // with an inline link). jina also sometimes renders titles as
  // `### [](url)` (empty alt text) — handle both.
  const itemHeader = /^###\s+\[([^\]]*)\]\((https?:[^)]+)\)/;
  // Recognize a date line right above the next item or at the end of
  // the body. Matches ISO 8601 and the common RFC-822 forms used by
  // RSS feeds (e.g. "Tue, 16 Jun 2026 11:26:27 +0000").
  const dateLine =
    /^(?:\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}|[A-Z][a-z]{2},\s+\d{1,2}\s+[A-Z][a-z]{2}\s+\d{4}\s+\d{2}:\d{2})/;

  for (const line of lines) {
    const m = line.match(itemHeader);
    if (m) {
      if (current) drafts.push(current);
      const title = m[1].trim() || `Untitled Post ${drafts.length + 1}`;
      current = {
        index: drafts.length,
        title,
        link: m[2].trim(),
        pubDate: "",
        bodyLines: []
      };
      continue;
    }

    if (current) {
      if (dateLine.test(line.trim())) {
        current.pubDate = line.trim();
      } else {
        current.bodyLines.push(line);
      }
    }
  }
  if (current) drafts.push(current);

  return drafts.map((d, index) => {
    const body = d.bodyLines
      // jina echoes the link again on a line of its own right after
      // the heading — strip that duplicate, but keep any other body
      // content (paragraphs, sub-headings, etc.) untouched.
      .filter((l) => l.trim() !== d.link && l.trim() !== `<${d.link}>`)
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    const summary = stripHtml(body || d.title);
    const excerpt = summary.slice(0, 140) + (summary.length > 140 ? "..." : "");

    let id = toFeedId(source, d.link || d.title, index);
    if (usedIds.has(id)) id = `${id}-${index}`;
    usedIds.add(id);

    const content = [
      d.pubDate ? `Published: ${d.pubDate}` : "",
      body,
      d.link ? `## Read Full Article\n\n[${d.link}](${d.link})` : ""
    ]
      .filter(Boolean)
      .join("\n\n");

    return {
      id,
      title: d.title,
      file: d.link,
      icon: "i-material-symbols:rss-feed-rounded",
      excerpt: excerpt || "No excerpt available.",
      link: d.link || undefined,
      content,
      source,
      pubDate: d.pubDate
    };
  });
};
