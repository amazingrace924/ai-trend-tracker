"use client";

import { useState } from "react";
import type { NewsItem } from "@/lib/types";
import { fmtDate } from "@/lib/format";
import { fetchNewsClient } from "@/lib/fetchNewsClient";

function RefreshIcon({ className = "", spinning = false }: { className?: string; spinning?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className + (spinning ? " animate-spin" : "")}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

// 공식 블로그 RSS를 모은 최신 소식 타임라인 + 클라이언트 새로고침.
// 초기 목록은 빌드 타임 데이터(서버 prop)이고, 새로고침 버튼을 누르면
// 브라우저가 직접 RSS를 받아 새 소식을 병합한다(정적 사이트라 서버가 없음).
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
        const merged = [...added, ...prev].sort((a, b) =>
          a.date < b.date ? 1 : -1,
        );
        return merged;
      });
      setUpdatedAt(
        new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    } catch {
      setError("소식을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  const newCount = newUrls.size;

  return (
    <div className="space-y-4">
      {/* 새로고침 바 */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-strong)] bg-[var(--panel2)] px-3.5 py-2 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshIcon className="h-4 w-4" spinning={loading} />
          {loading ? "불러오는 중…" : "새로고침"}
        </button>

        {!loading && updatedAt && (
          <span className="text-xs text-[var(--muted)]">
            {newCount > 0 ? (
              <span className="font-semibold text-[var(--accent)]">
                새 소식 {newCount}건
              </span>
            ) : (
              "새 소식 없음"
            )}{" "}
            · {updatedAt} 업데이트
          </span>
        )}

        {error && <span className="text-xs text-[var(--danger,#e5484d)]">{error}</span>}
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
                      <span className="grad-bar rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--on-accent)]">
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
