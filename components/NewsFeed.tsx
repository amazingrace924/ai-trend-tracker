"use client";

import { useState } from "react";
import type { NewsItem } from "@/lib/types";
import { fmtDate } from "@/lib/format";
import { fetchNewsClient } from "@/lib/fetchNewsClient";

function RefreshIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

// 공식 블로그 RSS를 모은 최신 소식 타임라인 + 클라이언트 새로고침.
// 초기 목록은 빌드 타임 데이터(서버 prop)이고, 새로고침 버튼을 누르면
// 브라우저가 직접 RSS를 받아 새 소식을 병합한다(정적 사이트라 서버가 없음).
// 컨트롤 디자인은 카테고리 라이브 화면(CategoryLive)과 통일한다.
export default function NewsFeed({ items: initial }: { items: NewsItem[] }) {
  const [items, setItems] = useState<NewsItem[]>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  // 이번 새로고침에서 새로 들어온 소식 url들(NEW 배지용).
  const [newUrls, setNewUrls] = useState<Set<string>>(new Set());

  async function refresh() {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const fresh = await fetchNewsClient();
      setItems((prev) => {
        const seen = new Set(prev.map((n) => n.url));
        const added = fresh.filter((n) => !seen.has(n.url));
        setNewUrls(new Set(added.map((n) => n.url)));
        // 새 항목 + 기존 항목을 합쳐 최신순 정렬.
        return [...added, ...prev].sort((a, b) => (a.date < b.date ? 1 : -1));
      });
      setUpdatedAt(
        new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    } catch {
      setUpdatedAt(null);
      setError("소식을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  const newCount = newUrls.size;

  return (
    <div className="space-y-6">
      {/* 새로고침 컨트롤 — 카테고리 화면과 동일한 디자인 언어 */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={refresh}
          disabled={loading}
          title="공식 블로그 RSS에서 최신 소식을 다시 받아와요"
          className="grad-bar group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:opacity-95 disabled:opacity-60"
        >
          <RefreshIcon
            className={
              "h-4 w-4 " +
              (loading
                ? "animate-spin"
                : "transition-transform duration-500 group-hover:rotate-180")
            }
          />
          {loading ? "갱신 중…" : "새로고침"}
        </button>

        {updatedAt && !loading && !error && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
            </span>
            {updatedAt} 갱신
          </span>
        )}

        <StatusLine
          loading={loading}
          error={error}
          done={!!updatedAt}
          newCount={newCount}
        />
      </div>

      {items.length === 0 ? (
        <div className="card p-6 text-[var(--muted)]">
          아직 수집된 소식이 없습니다.
        </div>
      ) : (
        <ol className="space-y-3">
          {items.map((n) => {
            const isNew = newUrls.has(n.url);
            return (
              <li key={n.url || n.id}>
                <a
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    "card card-hover group block p-4 " +
                    (isNew ? "border-[var(--accent)]" : "")
                  }
                >
                  <div className="mb-1.5 flex items-center gap-2 text-xs">
                    <span className="eyebrow rounded-md border border-[var(--border-strong)] bg-[var(--panel2)] px-2 py-0.5 text-[var(--text)]">
                      {n.source}
                    </span>
                    {isNew && (
                      <span className="grad-bar rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        New
                      </span>
                    )}
                    <span className="text-[var(--muted)]">{fmtDate(n.date)}</span>
                  </div>
                  <div className="font-display font-bold transition group-hover:text-[var(--accent)]">
                    {n.titleKo ?? n.title}
                  </div>
                  {n.titleKo && (
                    <div className="mt-0.5 text-xs text-[var(--muted)]">
                      {n.title}
                    </div>
                  )}
                  {(n.summaryKo ?? n.summary) && (
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">
                      {n.summaryKo ?? n.summary}
                    </p>
                  )}
                </a>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

// 카테고리 라이브의 StatusLine과 동일한 톤(진행=뮤트, 성공=초록, 실패=빨강).
function StatusLine({
  loading,
  error,
  done,
  newCount,
}: {
  loading: boolean;
  error: string | null;
  done: boolean;
  newCount: number;
}) {
  if (loading)
    return (
      <span className="text-xs font-semibold text-[var(--muted)]">
        최신 소식 불러오는 중…
      </span>
    );
  if (error)
    return <span className="text-xs font-semibold text-red-500">{error}</span>;
  if (done)
    return (
      <span className="text-xs font-semibold text-green-500">
        {newCount > 0
          ? `✓ 새 소식 ${newCount}건 반영 완료!`
          : "✓ 확인 완료 — 이미 최신이에요"}
      </span>
    );
  return null;
}
