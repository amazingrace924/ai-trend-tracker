// 브라우저(클라이언트) 측 소식 새로고침.
// 이 사이트는 정적 익스포트라 서버 런타임이 없다. 그래서 "새로고침"은
// 빌드 타임(lib/fetchNews.ts)이 아니라 사용자의 브라우저에서 직접 RSS를 받아온다.
// RSS 원본은 CORS를 허용하지 않으므로 공개 CORS 프록시를 거쳐 가져오고,
// XML은 브라우저 내장 DOMParser로 파싱한다. 제목·요약은 무료 구글 번역
// 엔드포인트(CORS 허용)로 한국어로 옮긴다. 모든 실패는 조용히 건너뛴다.

import type { NewsItem } from "./types";

interface Feed {
  source: string;
  url: string;
}

// lib/fetchNews.ts의 FEEDS와 동일 목록(빌드/런타임 양쪽에서 같은 소스를 본다).
const FEEDS: Feed[] = [
  { source: "OpenAI", url: "https://openai.com/blog/rss.xml" },
  { source: "Google DeepMind", url: "https://deepmind.google/blog/rss.xml" },
  { source: "Hugging Face", url: "https://huggingface.co/blog/feed.xml" },
];

// CORS 우회 프록시. 원본 그대로(raw) 돌려주고 CORS 헤더를 붙여준다.
function proxied(url: string): string {
  return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}
function normalizeId(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
}

function textOf(el: Element | null): string {
  return el?.textContent?.trim() ?? "";
}

// RSS(item) / Atom(entry) 양쪽을 처리해 NewsItem 배열로 변환.
function parseFeed(xml: string, source: string): NewsItem[] {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.querySelector("parsererror")) return [];

  const nodes = Array.from(doc.querySelectorAll("item, entry")).slice(0, 15);
  return nodes.map((node, i) => {
    const title = textOf(node.querySelector("title"));

    // 링크: RSS는 <link>텍스트, Atom은 <link href="...">
    let link = textOf(node.querySelector("link"));
    if (!link) {
      const linkEl = node.querySelector("link");
      link = linkEl?.getAttribute("href") ?? "";
    }

    const date =
      textOf(node.querySelector("pubDate")) ||
      textOf(node.querySelector("published")) ||
      textOf(node.querySelector("updated"));

    const summaryRaw =
      textOf(node.querySelector("description")) ||
      textOf(node.querySelector("summary"));

    return {
      id: `${source}-${i}-${normalizeId(title)}`,
      title,
      url: link,
      source,
      date: date ? new Date(date).toISOString() : "",
      summary: stripHtml(summaryRaw).slice(0, 220),
    } satisfies NewsItem;
  });
}

// ── 한국어 번역(무료 gtx 엔드포인트, 브라우저에서 CORS 허용) ──
const TR_ENDPOINT = "https://translate.googleapis.com/translate_a/single";

function looksKorean(s: string): boolean {
  const hangul = (s.match(/[가-힣]/g) ?? []).length;
  return hangul >= Math.max(2, s.length * 0.2);
}

async function translateOne(text: string): Promise<string> {
  const t = text.trim();
  if (!t || looksKorean(t)) return text;
  const url = `${TR_ENDPOINT}?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(t)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`translate ${res.status}`);
  const data = (await res.json()) as unknown;
  const segments = Array.isArray(data) && Array.isArray(data[0]) ? data[0] : [];
  return (
    segments
      .map((seg) => (Array.isArray(seg) ? String(seg[0] ?? "") : ""))
      .join("")
      .trim() || text
  );
}

// 동시성 제한 풀(무료 엔드포인트 보호). 개별 실패는 원문 폴백.
async function mapPool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, i: number) => Promise<R>,
): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

async function translateMany(texts: string[]): Promise<string[]> {
  return mapPool(texts, 4, async (t) => {
    try {
      return await translateOne(t);
    } catch {
      return t;
    }
  });
}

// 모든 피드를 브라우저에서 받아 최신순 정렬 후 한국어 번역까지 채워 반환.
export async function fetchNewsClient(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    FEEDS.map(async (f) => {
      const res = await fetch(proxied(f.url));
      if (!res.ok) throw new Error(`${f.source} ${res.status}`);
      return parseFeed(await res.text(), f.source);
    }),
  );

  const items = results
    .filter((r): r is PromiseFulfilledResult<NewsItem[]> => r.status === "fulfilled")
    .flatMap((r) => r.value)
    .filter((n) => n.title && n.url)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 40);

  if (items.length === 0) {
    throw new Error("소식을 가져오지 못했습니다.");
  }

  const [titlesKo, summariesKo] = await Promise.all([
    translateMany(items.map((n) => n.title)),
    translateMany(items.map((n) => n.summary ?? "")),
  ]);
  items.forEach((n, i) => {
    if (titlesKo[i] && titlesKo[i] !== n.title) n.titleKo = titlesKo[i];
    if (n.summary && summariesKo[i] && summariesKo[i] !== n.summary)
      n.summaryKo = summariesKo[i];
  });

  return items;
}
