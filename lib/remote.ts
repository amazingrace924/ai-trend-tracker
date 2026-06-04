// '사이트 내 새로고침' 버튼이 최신 커밋 데이터를 가져오는 원격 소스.
// raw.githubusercontent.com: CORS 허용(*) + 캐시 5분 → 쿼리 캐시버스트로 즉시 최신.
// 매일 자동 갱신 Action이 main에 데이터를 커밋하면 여기서 바로 반영된다.
export const RAW_BASE =
  "https://raw.githubusercontent.com/amazingrace924/ai-trend-tracker/main";

// '지금 새로 수집' 버튼이 호출하는 Cloudflare Worker(GitHub Actions 트리거).
// 토큰은 Worker 시크릿에 있어 사이트엔 노출되지 않는다.
export const REFRESH_WORKER_URL = "https://ai-trend-refresh.exit9161.workers.dev";

export function remoteDataUrl(category: string, file: "current" | "race" | "news") {
  const p =
    file === "news" ? "data/news.json" : `data/${category}/${file}.json`;
  // Date.now는 클라이언트 런타임에서만 호출됨(캐시 무력화용).
  return `${RAW_BASE}/${p}?t=${Date.now()}`;
}
