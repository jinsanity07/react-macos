import { useEffect, useState } from "react";
import type { BearMdData } from "~/types";
import { mapRssXml } from "~/utils/rss";

const BEAR_BLOG_RSS_URL = "https://jinsanity07git.github.io/blog//rss.xml";
const BEAR_BLOG_SOURCE = "Jinsanity Blog";

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
        const mappedBlogs = mapRssXml(rssText, BEAR_BLOG_SOURCE);

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
