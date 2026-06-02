import type { NewsItem } from "@/lib/types";
import { fmtDate } from "@/lib/format";

// 공식 블로그 RSS를 모은 최신 소식 타임라인.
export default function NewsFeed({ items }: { items: NewsItem[] }) {
  if (items.length === 0) {
    return (
      <div className="card p-6 text-[var(--muted)]">
        아직 수집된 소식이 없습니다.
      </div>
    );
  }
  return (
    <ol className="space-y-3">
      {items.map((n) => (
        <li key={n.id}>
          <a
            href={n.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card card-hover group block p-4"
          >
            <div className="mb-1.5 flex items-center gap-2 text-xs">
              <span className="eyebrow rounded-md border border-[var(--border-strong)] bg-[var(--panel2)] px-2 py-0.5 text-[var(--text)]">
                {n.source}
              </span>
              <span className="text-[var(--muted)]">{fmtDate(n.date)}</span>
            </div>
            <div className="font-display font-bold transition group-hover:text-[var(--accent)]">
              {n.title}
            </div>
            {n.summary && (
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">
                {n.summary}
              </p>
            )}
          </a>
        </li>
      ))}
    </ol>
  );
}
