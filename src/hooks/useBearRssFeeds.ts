import { useEffect, useState } from "react";
import type { BearMdData } from "~/types";
import { mapRssJina } from "~/utils/rss";

export type RssFeedSource = {
  name: string;
  url: string;
};

/**
 * Free public CORS-friendly proxy prefix. r.jina.ai fetches any URL
 * server-side and returns either a JSON error envelope or a
 * structured markdown document we can parse via `mapRssJina`.
 */
const JINA_PROXY_PREFIX = "https://r.jina.ai/";

/**
 * The 6 RSS feeds shown in the Bear "RSS feed" sidebar section.
 *
 * The list is passed to jina as-is — jina fetches the feed
 * server-side, dodging both Mixed Content (HTTPS origin can fetch
 * HTTP feeds) and CORS (jina sets the right headers for us). Per-feed
 * failures are silently dropped by the hook; if ALL 6 fail, the
 * "RSS feed Unavailable" placeholder is shown.
 *
 * URL notes:
 *  - The Guardian: the original `/uk/rss` returns an empty body via
 *    jina, so we use `/world/rss` instead.
 *  - BBC News: the original `video_and_audio/...rss.xml` 404s; we use
 *    the canonical `/news/rss.xml` (works via jina, returns top
 *    headlines).
 *  - Reuters: the original `feeds.reuters.com/Reuters/worldNews` is
 *    DNS-blocked by jina. We keep it in the list (per the user's
 *    stated sources) and let per-feed error isolation drop it; the
 *    remaining 5 feeds still populate the section.
 *  - All URLs are HTTPS so the request is well-formed even if a
 *    future change fetches directly.
 */
export const BEAR_RSS_FEED_SOURCES: RssFeedSource[] = [
  { name: "Hacker News", url: "https://news.ycombinator.com/rss" },
  {
    name: "Ars Technica",
    url: "https://feeds.arstechnica.com/arstechnica/index/"
  },
  { name: "The Guardian", url: "https://www.theguardian.com/world/rss" },
  { name: "LWN", url: "https://lwn.net/headlines/newrss" },
  { name: "BBC News", url: "https://feeds.bbci.co.uk/news/rss.xml" },
  { name: "Reuters", url: "https://feeds.reuters.com/Reuters/worldNews" }
];

export const BEAR_RSS_FEED_LIMIT = 5;

const pubDateToMs = (isoOrRfc: string): number => {
  if (!isoOrRfc) return 0;
  const ms = Date.parse(isoOrRfc);
  return Number.isFinite(ms) ? ms : 0;
};

/**
 * Merge a fresh batch of items into the running list, sort by
 * `pubDate` desc, and cap at the limit.
 */
const mergeByDateDesc = (prev: BearMdData[], next: BearMdData[]): BearMdData[] => {
  const seen = new Set(prev.map((item) => item.id));
  const additions = next.filter((item) => !seen.has(item.id));
  if (additions.length === 0) return prev;

  const combined = [...prev, ...additions];
  combined.sort((a, b) => {
    const aMs = pubDateToMs(a.pubDate || "");
    const bMs = pubDateToMs(b.pubDate || "");
    return bMs - aMs;
  });

  return combined.slice(0, BEAR_RSS_FEED_LIMIT);
};

export function useBearRssFeeds() {
  const [feeds, setFeeds] = useState<BearMdData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOne(source: RssFeedSource): Promise<BearMdData[]> {
      const res = await fetch(JINA_PROXY_PREFIX + source.url);
      if (!res.ok) throw new Error(`Failed to load ${source.name} feed.`);
      const text = await res.text();
      return mapRssJina(text, source.name);
    }

    async function loadAll() {
      let failures = 0;
      let lastError: unknown = null;
      const total = BEAR_RSS_FEED_SOURCES.length;
      let settled = 0;

      setLoading(true);
      setError(null);

      await Promise.allSettled(
        BEAR_RSS_FEED_SOURCES.map(async (source) => {
          try {
            const items = await loadOne(source);
            if (cancelled) return;
            setFeeds((prev) => mergeByDateDesc(prev, items));
          } catch (e) {
            if (cancelled) return;
            // Per-feed failures are silently dropped; track count for
            // the all-fail branch below.
            failures += 1;
            lastError = e;
          } finally {
            settled += 1;
            if (settled === total && !cancelled) {
              setLoading(false);
              if (failures === total) {
                setError(
                  lastError instanceof Error
                    ? lastError.message
                    : "Failed to load any RSS feeds."
                );
                setFeeds([]);
              }
            }
          }
        })
      );

      if (!cancelled) {
        setLoading(false);
      }
    }

    loadAll();

    return () => {
      cancelled = true;
    };
  }, []);

  return { feeds, loading, error };
}
