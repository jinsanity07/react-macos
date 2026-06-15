import { useEffect, useState } from "react";
import type { BearMdData } from "~/types";
import { mapRssItems } from "~/utils/rss";

export type RssFeedSource = {
  name: string;
  url: string;
};

export const BEAR_RSS_FEED_SOURCES: RssFeedSource[] = [
  { name: "Hacker News", url: "https://news.ycombinator.com/rss" },
  { name: "Ars Technica", url: "http://feeds.arstechnica.com/arstechnica/index/" },
  { name: "The Guardian", url: "https://www.theguardian.com/uk/rss" },
  { name: "LWN", url: "https://lwn.net/headlines/newrss" },
  {
    name: "BBC News",
    url: "http://feeds.bbci.co.uk/news/video_and_audio/news_front_page/rss.xml"
  },
  { name: "Reuters", url: "http://feeds.reuters.com/Reuters/worldNews" }
];

export const BEAR_RSS_FEED_LIMIT = 5;

const pubDateToMs = (isoOrRfc: string): number => {
  if (!isoOrRfc) return 0;
  const ms = Date.parse(isoOrRfc);
  return Number.isFinite(ms) ? ms : 0;
};

/**
 * Merge a fresh batch of items into the running list, sort by
 * `pubDate` desc (with insertion-order ties), and cap at the limit.
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
      const res = await fetch(source.url);
      if (!res.ok) throw new Error(`Failed to load ${source.name} feed.`);
      const xmlText = await res.text();
      return mapRssItems(xmlText, source.name);
    }

    async function loadAll() {
      let firstSettled = false;
      let failures = 0;
      const total = BEAR_RSS_FEED_SOURCES.length;

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
            if (failures === total && !firstSettled) {
              setError(e instanceof Error ? e.message : "Failed to load any RSS feeds.");
              setFeeds([]);
            }
          } finally {
            if (!firstSettled) {
              firstSettled = true;
              if (!cancelled) setLoading(false);
            }
          }
        })
      );

      if (!cancelled) {
        setLoading(false);
        if (failures === total) {
          setError((prev) => prev ?? "Failed to load any RSS feeds.");
        }
      }
    }

    loadAll();

    return () => {
      cancelled = true;
    };
  }, []);

  return { feeds, loading, error };
}
