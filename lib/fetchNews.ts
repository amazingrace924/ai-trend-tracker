import { XMLParser } from "fast-xml-parser";
import type { NewsItem } from "./types";

// 공식 AI 블로그 RSS를 모아 최신 출시·업데이트 소식 피드를 만든다.
// 빌드 타임에만 실행되며, 실패한 소스는 건너뛰고 나머지로 진행한다.

interface Feed {
  source: string;
  url: string;
}

const FEEDS: Feed[] = [
  { source: "OpenAI", url: "https://openai.com/blog/rss.xml" },
  { source: "Google DeepMind", url: "https://deepmind.google/blog/rss.xml" },
  { source: "Hugging Face", url: "https://huggingface.co/blog/feed.xml" },
  // Anthropic/Mistral 등은 RSS 제공 여부가 바뀔 수 있어 운영 중 점검해 추가.
];

const parser = new XMLParser({ ignoreAttributes: false });

function toItems(xml: string, source: string): NewsItem[] {
  const doc = parser.parse(xml);
  const channel = doc?.rss?.channel ?? doc?.feed;
  if (!channel) return [];
  const rawItems = channel.item ?? channel.entry ?? [];
  const arr = Array.isArray(rawItems) ? rawItems : [rawItems];
  return arr.slice(0, 15).map((it: Record<string, unknown>, i: number) => {
    const link =
      typeof it.link === "string"
        ? it.link
        : ((it.link as { ["@_href"]?: string })?.["@_href"] ?? "");
    const date = String(it.pubDate ?? it.published ?? it.updated ?? "");
    const title = String(it.title ?? "").trim();
    return {
      id: `${source}-${i}-${normalizeId(title)}`,
      title,
      url: link,
      source,
      date: date ? new Date(date).toISOString() : "",
      summary: stripHtml(String(it.description ?? it.summary ?? "")).slice(
        0,
        220,
      ),
    } satisfies NewsItem;
  });
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}
function normalizeId(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
}

export async function fetchNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    FEEDS.map(async (f) => {
      const res = await fetch(f.url);
      if (!res.ok) throw new Error(`${f.source} ${res.status}`);
      return toItems(await res.text(), f.source);
    }),
  );
  const items = results
    .filter((r): r is PromiseFulfilledResult<NewsItem[]> => r.status === "fulfilled")
    .flatMap((r) => r.value)
    .filter((n) => n.title && n.url)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 40);
  return items;
}
