import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { getCurrent } from "@/lib/data";
import { getRankDeltas } from "@/lib/ranks";
import { vendorColor } from "@/lib/vendors";

// 카테고리별 현재 1위를 한눈에 보여주는 대시보드(홈 랜딩 · 매일 갱신).
export default function LeadersOverview() {
  const leaders = CATEGORIES.map((c) => {
    const snap = getCurrent(c.id);
    const leader = snap.models[0];
    const changed =
      leader && ["up", "new"].includes(getRankDeltas(c.id)[leader.id]?.status ?? "");
    return { cat: c, leader, changed };
  }).filter((x) => x.leader);

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <div className="eyebrow text-[var(--accent)]">🏆 한눈에 보기 · 매일 자동 갱신</div>
        <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
          지금 <span className="grad-text">대세</span>인 AI 챔피언
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          5개 분야의 현재 1위예요. 카드를 누르면 그 분야의 전체 순위·경주를 볼 수 있어요.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {leaders.map(({ cat, leader, changed }) => {
          const color = vendorColor(leader.vendor);
          return (
            <Link
              key={cat.id}
              href={`/c/${cat.id}`}
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
