import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeExternalLinks from "rehype-external-links";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula, prism } from "react-syntax-highlighter/dist/esm/styles/prism";
import bear from "~/configs/bear";
import { useBearBlogs, useBearRssFeeds } from "~/hooks";
import type { BearData, BearMdData } from "~/types";

interface ContentProps {
  contentID: string;
  contentURL: string;
  contentMd?: string;
}

interface MiddlebarProps {
  items: BearMdData[];
  cur: number;
  setContent: (item: BearMdData, index: number) => void;
}

interface SidebarProps {
  items: BearData[];
  cur: number;
  setMidBar: (items: BearMdData[], index: number) => void;
}

interface BearState extends ContentProps {
  curSidebar: number;
  curMidbar: number;
  midbarList: BearMdData[];
}

const Highlighter = (dark: boolean): any => {
  interface codeProps {
    node: any;
    inline: boolean;
    className: string;
    children: any;
  }

  return {
    code({ node, inline, className, children, ...props }: codeProps) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter
          style={dark ? dracula : prism}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className={className}>{children}</code>
      );
    }
  };
};

const Sidebar = ({ items, cur, setMidBar }: SidebarProps) => {
  return (
    <div text-white>
      <div className="h-12 pr-3 hstack space-x-3 justify-end">
        <span className="i-ic:baseline-cloud-off text-xl" />
        <span className="i-akar-icons:settings-vertical text-xl" />
      </div>
      <ul>
        {items.map((item, index) => (
          <li
            key={`bear-sidebar-${item.id}`}
            className={`pl-6 h-8 hstack cursor-default ${
              cur === index ? "bg-red-500" : "bg-transparent"
            } ${cur === index ? "" : "hover:bg-gray-600"}`}
            onClick={() => setMidBar(item.md, index)}
          >
            <span className={item.icon} />
            <span className="ml-2">{item.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Middlebar = ({ items, cur, setContent }: MiddlebarProps) => {
  const dark = useStore((state) => state.dark);

  return (
    <ul>
      {items.map((item: BearMdData, index: number) => {
        const sourceClass = item.source ? sourceColorClass(item.source) : "";
        return (
          <li
            key={`bear-midbar-${item.id}`}
            data-midbar-item
            data-midbar-index={index}
            className={`min-h-[48px] flex cursor-default border-l-4 px-3 py-2 ${
              cur === index
                ? "border-red-500 bg-white dark:bg-gray-900"
                : `${sourceClass || "border-transparent"} bg-transparent`
            } hover:(bg-white dark:bg-gray-900)`}
            onClick={() => setContent(item, index)}
          >
            <div className="flex flex-col justify-center min-w-0 flex-1">
              <div className="flex items-baseline gap-2 min-w-0">
                {item.source && (
                  <span
                    className="text-[10px] font-semibold tracking-wider uppercase text-c-500 flex-shrink-0"
                    title={item.source}
                  >
                    {item.source}
                  </span>
                )}
                <div
                  className={`truncate font-medium text-sm ${
                    dark ? "text-gray-100" : "text-gray-900"
                  }`}
                  title={item.title}
                >
                  {item.title}
                </div>
              </div>
              <div
                className="text-xs text-c-500 mt-1"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden"
                }}
              >
                {item.excerpt}
              </div>
            </div>
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="ml-2 self-start mt-1 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="i-ant-design:link-outlined text-c-500" />
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
};

/**
 * Per-source left-border color for RSS feed rows. Used when the row
 * is NOT the currently-selected one (the selected row keeps the
 * red-500 left border for focus parity with the other Bear sections).
 */
const sourceColorClass = (source: string): string => {
  const s = source.toLowerCase();
  if (s.includes("hacker")) return "border-l-orange-500";
  if (s.includes("ars")) return "border-l-teal-500";
  if (s.includes("guardian")) return "border-l-blue-500";
  if (s.includes("lwn")) return "border-l-green-500";
  if (s.includes("bbc")) return "border-l-red-600";
  if (s.includes("reuters")) return "border-l-orange-700";
  return "border-l-gray-400";
};

const getRepoURL = (url: string) => {
  return url.slice(0, -10) + "/";
};

const fixImageURL = (text: string, contentURL: string): string => {
  text = text.replace(/&nbsp;/g, "");
  if (contentURL.indexOf("raw.githubusercontent.com") !== -1) {
    const repoURL = getRepoURL(contentURL);

    const imgReg = /!\[(.*?)\]\((.*?)\)/;
    const imgRegGlobal = /!\[(.*?)\]\((.*?)\)/g;

    const imgList = text.match(imgRegGlobal);

    if (imgList) {
      for (const img of imgList) {
        const imgURL = (img.match(imgReg) as Array<string>)[2];
        if (imgURL.indexOf("http") !== -1) continue;
        const newImgURL = repoURL + imgURL;
        text = text.replace(imgURL, newImgURL);
      }
    }
  }
  return text;
};

const Content = ({ contentID, contentURL, contentMd }: ContentProps) => {
  const [storeMd, setStoreMd] = useState<{ [key: string]: string }>({});
  const dark = useStore((state) => state.dark);

  const fetchMarkdown = useCallback(
    (id: string, url: string) => {
      if (!url) return;
      if (!storeMd[id]) {
        fetch(url)
          .then((response) => response.text())
          .then((text) => {
            storeMd[id] = fixImageURL(text, url);
            setStoreMd({ ...storeMd });
          })
          .catch((error) => console.error(error));
      }
    },
    [storeMd]
  );

  useEffect(() => {
    if (contentMd !== undefined) return;
    fetchMarkdown(contentID, contentURL);
  }, [contentID, contentURL, contentMd, fetchMarkdown]);

  return (
    <div className="markdown w-2/3 mx-auto px-2 py-6 text-c-700">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeKatex,
          [rehypeExternalLinks, { target: "_blank", rel: "noopener noreferrer" }]
        ]}
        components={Highlighter(dark as boolean)}
      >
        {contentMd ?? storeMd[contentID]}
      </ReactMarkdown>
    </div>
  );
};

const Bear = () => {
  const { blogs, loading: blogsLoading, error: blogsError } = useBearBlogs();
  const { feeds, loading: feedsLoading, error: feedsError } = useBearRssFeeds();

  const blogItems = useMemo<BearMdData[]>(() => {
    if (blogsLoading) {
      return [
        {
          id: "blogs-loading",
          title: "Loading Blogs",
          file: "",
          icon: "i-eos-icons:three-dots-loading",
          excerpt: "Fetching latest posts from RSS feed...",
          content: "## Loading Blogs\n\nFetching latest posts from RSS feed..."
        }
      ];
    }

    if (blogsError) {
      return [
        {
          id: "blogs-error",
          title: "Blogs Unavailable",
          file: "",
          icon: "i-material-symbols:error-outline-rounded",
          excerpt: "Could not load RSS feed. Please try again later.",
          content: `## Blogs Unavailable\n\n${blogsError}`
        }
      ];
    }

    if (!blogs.length) {
      return [
        {
          id: "blogs-empty",
          title: "No Blogs Found",
          file: "",
          icon: "i-material-symbols:rss-feed-rounded",
          excerpt: "No articles are currently available in the RSS feed.",
          content:
            "## No Blogs Found\n\nNo articles are currently available in the RSS feed."
        }
      ];
    }

    return blogs;
  }, [blogs, blogsError, blogsLoading]);

  const feedItems = useMemo<BearMdData[]>(() => {
    // Only show the error placeholder if EVERY feed failed (the hook
    // returns `error` only in that case).
    if (feedsError && feeds.length === 0) {
      return [
        {
          id: "rss-feed-error",
          title: "RSS feed Unavailable",
          file: "",
          icon: "i-material-symbols:error-outline-rounded",
          excerpt: "Could not load any RSS feeds. Please try again later.",
          content: `## RSS feed Unavailable\n\n${feedsError}`
        }
      ];
    }

    if (feedsLoading && feeds.length === 0) {
      return [
        {
          id: "rss-feed-loading",
          title: "Loading RSS feed",
          file: "",
          icon: "i-eos-icons:three-dots-loading",
          excerpt: "Fetching latest posts from 5 RSS sources...",
          content: "## Loading RSS feed\n\nFetching latest posts from 5 RSS sources..."
        }
      ];
    }

    return feeds;
  }, [feeds, feedsError, feedsLoading]);

  const sidebarItems = useMemo<BearData[]>(() => {
    return bear.map((item) => {
      if (item.id === "blogs") return { ...item, md: blogItems };
      if (item.id === "rss-feed") return { ...item, md: feedItems };
      return item;
    });
  }, [blogItems, feedItems]);

  const [state, setState] = useState<BearState>(() => {
    const firstItem = sidebarItems[0].md[0];
    return {
      curSidebar: 0,
      curMidbar: 0,
      midbarList: sidebarItems[0].md,
      contentID: firstItem.id,
      contentURL: firstItem.file,
      contentMd: firstItem.content
    };
  });

  useEffect(() => {
    setState((prev) => {
      const nextSidebarIndex = Math.min(prev.curSidebar, sidebarItems.length - 1);
      const nextSidebarItem = sidebarItems[nextSidebarIndex];
      const currentMidbarIndex = nextSidebarItem.md.findIndex(
        (item) => item.id === prev.contentID
      );
      const nextMidbarIndex = currentMidbarIndex >= 0 ? currentMidbarIndex : 0;
      const nextContentItem = nextSidebarItem.md[nextMidbarIndex];

      if (!nextContentItem) return prev;

      const unchanged =
        prev.curSidebar === nextSidebarIndex &&
        prev.curMidbar === nextMidbarIndex &&
        prev.midbarList === nextSidebarItem.md &&
        prev.contentID === nextContentItem.id &&
        prev.contentURL === nextContentItem.file &&
        prev.contentMd === nextContentItem.content;

      if (unchanged) return prev;

      return {
        ...prev,
        curSidebar: nextSidebarIndex,
        curMidbar: nextMidbarIndex,
        midbarList: nextSidebarItem.md,
        contentID: nextContentItem.id,
        contentURL: nextContentItem.file,
        contentMd: nextContentItem.content
      };
    });
  }, [sidebarItems]);

  const setMidBar = (items: BearMdData[], index: number) => {
    const first = items[0];
    if (!first) return;

    setState((prev) => ({
      ...prev,
      curSidebar: index,
      curMidbar: 0,
      midbarList: items,
      contentID: first.id,
      contentURL: first.file,
      contentMd: first.content
    }));
  };

  const setContent = (item: BearMdData, index: number) => {
    setState((prev) => ({
      ...prev,
      curMidbar: index,
      contentID: item.id,
      contentURL: item.file,
      contentMd: item.content
    }));
  };

  // Keyboard navigation for the middle column. Only active when the
  // RSS feed sidebar entry is selected — other Bear sections (Profile,
  // Projects, Blogs) keep their click-only behavior.
  const isRssActive = sidebarItems[state.curSidebar]?.id === "rss-feed";
  const handleMidbarKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isRssActive) return;
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const list = state.midbarList;
    if (list.length === 0) return;
    const dir = e.key === "ArrowDown" ? 1 : -1;
    const nextIndex = Math.max(0, Math.min(list.length - 1, state.curMidbar + dir));
    if (nextIndex === state.curMidbar) return;
    setContent(list[nextIndex], nextIndex);

    // Keep the focused item in view inside the scrollable middle column.
    requestAnimationFrame(() => {
      const el = (e.currentTarget as HTMLDivElement).querySelector<HTMLElement>(
        `[data-midbar-index="${nextIndex}"]`
      );
      el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  };

  return (
    <div className="bear font-avenir flex h-full">
      <div className="w-44 overflow-auto bg-gray-700">
        <Sidebar items={sidebarItems} cur={state.curSidebar} setMidBar={setMidBar} />
      </div>
      <div
        className="w-72 overflow-auto focus:outline-none"
        bg="gray-50 dark:gray-800"
        border="r c-300"
        tabIndex={0}
        onKeyDown={handleMidbarKeyDown}
        data-midbar-list
      >
        <Middlebar
          items={state.midbarList}
          cur={state.curMidbar}
          setContent={setContent}
        />
      </div>
      <div className="flex-1 overflow-auto" bg="gray-50 dark:gray-800">
        <Content
          contentID={state.contentID}
          contentURL={state.contentURL}
          contentMd={state.contentMd}
        />
      </div>
    </div>
  );
};

export default Bear;
