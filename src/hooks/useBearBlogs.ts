import { useEffect, useState } from "react";
import type { BearMdData } from "~/types";

const BEAR_BLOG_RSS_URL = "https://jinsanity07git.github.io/blog//rss.xml";

const stripHtml = (input: string) => {
  const doc = new DOMParser().parseFromString(input, "text/html");
  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
};

const decodeEntities = (input: string) => {
  const doc = new DOMParser().parseFromString(input, "text/html");
  return (doc.documentElement.textContent || "").replace(/ /g, " ");
};

const safeText = (node: Element, tags: string[]) => {
  for (const tag of tags) {
    const value = node.getElementsByTagName(tag)[0]?.textContent?.trim();
    if (value) return value;
  }

  return "";
};

const toBlogId = (seed: string, index: number) => {
  const normalized = seed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized ? `blog-${normalized}` : `blog-${index}`;
};

const mapRssItems = (xmlText: string): BearMdData[] => {
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

    let id = toBlogId(guid || link || title, index);
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
      file: link || BEAR_BLOG_RSS_URL,
      icon: "i-material-symbols:rss-feed-rounded",
      excerpt: excerpt || "No excerpt available.",
      link: link || undefined,
      content
    };
  });
};

export function useBearBlogs() {
  const [blogs, setBlogs] = useState<BearMdData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBlogs() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(BEAR_BLOG_RSS_URL);
        if (!res.ok) throw new Error("Failed to load RSS feed.");

        const rssText = await res.text();
        const mappedBlogs = mapRssItems(rssText);

        if (!cancelled) setBlogs(mappedBlogs);
      } catch (e) {
        if (!cancelled) {
          setBlogs([]);
          setError(e instanceof Error ? e.message : "Failed to load RSS feed.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBlogs();

    return () => {
      cancelled = true;
    };
  }, []);

  return { blogs, loading, error };
}
