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

const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Check if a line is essentially just a URL echo (in any of: bare,
 * angle-bracketed, or markdown link form). Used to filter out jina's
 * habit of repeating the article URL on its own line right after the
 * `### [title](url)` header — and to skip empty separator lines.
 */
const isUrlEcho = (line: string, url: string): boolean => {
  const t = line.trim();
  if (!t) return true;
  if (!url) return false;
  const urlRe = escapeRegex(url);
  return (
    new RegExp(`^\\[\\s*<?${urlRe}>?\\s*\\]\\(\\s*<?${urlRe}>?\\s*\\)$`).test(t) ||
    new RegExp(`^\\s*<${urlRe}>\\s*$`).test(t) ||
    new RegExp(`^\\s*${urlRe}\\s*$`).test(t)
  );
};

/**
 * Strip markdown link syntax from a line, but only for links whose
 * URL matches the item's URL. Converts:
 *   [text](url)         → text
 *   [url](url)          → ""  (self-link, redundant)
 *   [<url>](<url>)      → ""
 *   [text](<url>)       → text
 * Also drops the line entirely if it reduces to a bare URL echo.
 */
const stripMarkdownLinks = (line: string, url: string): string => {
  if (!url) return line;
  const urlRe = escapeRegex(url);
  const result = line.replace(
    new RegExp(`\\[([^\\]]*)\\]\\(\\s*<?${urlRe}>?\\s*\\)`, "g"),
    (_match, text) => {
      const cleaned = text.trim().replace(/^<|>$/g, "");
      return cleaned === url ? "" : cleaned;
    }
  );
  if (new RegExp(`^\\s*<${urlRe}>\\s*$`).test(result)) return "";
  if (new RegExp(`^\\s*${urlRe}\\s*$`).test(result)) return "";
  return result.trim();
};

/**
 * Derive a fallback title from the URL when jina's `### [](url)` header
 * has an empty alt text (notably BBC News). Extracts the most specific
 * path segment that isn't "articles", a hash-like id, or the generic
 * "news" section, and formats it as "{source} — {Section}".
 *
 * Returns "" if no useful section is found — caller falls back to the
 * source name.
 */
const deriveTitleFromUrl = (url: string, source: string): string => {
  if (!url) return "";
  try {
    const u = new URL(url);
    const segments = u.pathname.split("/").filter(Boolean);
    const section = segments
      .filter(
        (s) =>
          s.length > 2 &&
          !/^articles?$/.test(s) &&
          !/^[a-z0-9]{8,}$/.test(s) &&
          !/^news$/.test(s)
      )
      .pop();
    if (section) {
      const readable = section
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return `${source} — ${readable}`;
    }
  } catch {
    // ignore
  }
  return "";
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
      current = {
        index: drafts.length,
        title: m[1].trim(),
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
    // Clean the body: drop URL echoes (jina's habit of repeating the
    // article URL on its own line right after the header, sometimes
    // wrapped in a `### [text](url)` link, sometimes in a bare
    // `[url](url)` self-link) and strip remaining markdown links that
    // point back at the item's URL. See the function-level docstring
    // for why this is needed.
    const cleanBody = d.bodyLines
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !isUrlEcho(l, d.link))
      .map((l) => stripMarkdownLinks(l, d.link))
      .filter((l) => l.length > 0)
      .join("\n\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // Title fallback chain:
    //   1. jina-provided title
    //   2. first non-URL paragraph from the cleaned body
    //   3. URL-derived section hint (e.g. "BBC News — Football")
    //   4. the source name itself (e.g. "BBC News")
    const firstPara = cleanBody
      .split(/\n\n+/)
      .map((p) => p.trim())
      .find((p) => p && !p.startsWith("[") && !p.startsWith("!"));
    const title = d.title || firstPara || deriveTitleFromUrl(d.link, source) || source;

    // Excerpt: prefer body text, fall back to title (handles feeds
    // like Hacker News where the body is just a URL echo and would
    // otherwise leak the raw URL into the middle column).
    //
    // If the title fell back to just the source name (e.g. "BBC News"
    // for items where jina gave us an empty alt text), append the
    // pubDate so the excerpt carries at least some distinguishing
    // information.
    const isGenericTitle = title === source;
    const summarySource =
      cleanBody || (isGenericTitle && d.pubDate ? `${title} · ${d.pubDate}` : title);
    const summary = stripHtml(summarySource);
    const excerpt = summary.slice(0, 140) + (summary.length > 140 ? "..." : "");

    let id = toFeedId(source, d.link || title, index);
    if (usedIds.has(id)) id = `${id}-${index}`;
    usedIds.add(id);

    // Right-pane content is a structured "card" view: title at the top
    // (as an H1), source + pubDate metadata, then the body when
    // available (LWN / The Guardian) or the excerpt as a fallback
    // (Hacker News / Ars Technica, whose jina response has no prose
    // beyond the URL echo). Read Full Article link at the bottom.
    const cardParts: string[] = [];
    cardParts.push(`# ${title}`);

    const metaLines: string[] = [`**Source:** ${source}`];
    if (d.pubDate) metaLines.push(`**Published:** ${d.pubDate}`);
    cardParts.push(metaLines.join("  \n"));

    const mainContent = cleanBody || excerpt || title;
    cardParts.push(mainContent);

    if (d.link) {
      cardParts.push(`## Read Full Article\n\n[${d.link}](${d.link})`);
    }

    const content = cardParts.join("\n\n");

    return {
      id,
      title,
      file: d.link,
      icon: "i-material-symbols:rss-feed-rounded",
      excerpt: excerpt || `Article from ${source}`,
      link: d.link || undefined,
      content,
      source,
      pubDate: d.pubDate
    };
  });
};
