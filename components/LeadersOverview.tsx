import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { getCurrent } from "@/lib/data";
import { getRankDeltas } from "@/lib/ranks";
import { vendorColor } from "@/lib/vendors";
import type { Category } from "@/lib/types";

function hrefFor(id: Category): string {
  return id === "llm" ? "/" : `/c/${id}`;
}

// 카테고리별 현재 1위를 한눈에 보여주는 대시보드(빌드 시점 최신 = 매일 갱신).
export default function LeadersOverview() {
  const leaders = CATEGORIES.map((c) => {
    const snap = getCurrent(c.id);
    const leader = snap.models[0];
    const changed =
      leader && ["up", "new"].includes(getRankDeltas(c.id)[leader.id]?.status ?? "");
    return { cat: c, leader, changed };
  }).filter((x) => x.leader);

  if (leaders.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-baseline gap-2">
        <h2 className="text-lg font-bold">🏆 카테고리별 1위</h2>
        <span className="text-xs text-[var(--muted)]">한눈에 보기 · 매일 자동 갱신</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {leaders.map(({ cat, leader, changed }) => {
          const color = vendorColor(leader.vendor);
          return (
            <Link
              key={cat.id}
              href={hrefFor(cat.id)}
              className="card card-hover relative overflow-hidden p-4"
            >
              <span className="grad-bar absolute inset-x-0 top-0 h-1" />
              {changed && (
                <span className="grad-bar absolute right-2 top-2.5 rounded px-1.5 py-0.5 text-[9px] font-bold text-white">
                  새 1위
                </span>
              )}
              <div className="eyebrow flex items-center gap-1.5 text-[var(--muted)]">
                <span className="text-sm">{cat.emoji}</span>
                {cat.label}
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-sm">🏆</span>
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: color }}
                />
                <span className="truncate font-display text-sm font-bold" title={leader.name}>
                  {leader.name}
                </span>
              </div>
              <div className="truncate text-xs text-[var(--muted)]">{leader.vendor}</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="tnum grad-text text-xl font-bold">{leader.score}</span>
                <span className="eyebrow text-[10px] text-[var(--muted)]">
                  {leader.scoreLabel}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
