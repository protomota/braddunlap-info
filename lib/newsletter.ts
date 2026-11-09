const FEED = "https://newsletter.protomota.com/feed";

export type Post = {
  title: string;
  url: string;
  date: string;
};

/** Pull the text of a child tag out of one <item> block, unwrapping CDATA. */
function tagText(item: string, tag: string): string {
  const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  if (!match) return "";
  return match[1]
    .replace(/^\s*<!\[CDATA\[/, "")
    .replace(/\]\]>\s*$/, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

function formatDate(pubDate: string): string {
  const parsed = new Date(pubDate);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Latest posts from the Substack feed.
 *
 * Runs on the server, so Substack's missing CORS header is not a problem.
 * Returns [] on any failure — a dead feed should not take down the page.
 */
export async function getPosts(limit = 3): Promise<Post[]> {
  let xml: string;
  try {
    const response = await fetch(FEED, { next: { revalidate: 3600 } });
    if (!response.ok) return [];
    xml = await response.text();
  } catch {
    return [];
  }

  const posts: Post[] = [];
  for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const item = match[1];
    const title = tagText(item, "title");
    const url = tagText(item, "link").split("?")[0];
    if (!title || !url) continue;
    posts.push({ title, url, date: formatDate(tagText(item, "pubDate")) });
    if (posts.length === limit) break;
  }
  return posts;
}
