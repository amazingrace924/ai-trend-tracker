import Link from "next/link";
import CategoryLive from "@/components/CategoryLive";
import InfoDot from "@/components/InfoDot";
import { BeginnerNote } from "@/components/BeginnerMode";
import { getCategoryMeta } from "@/lib/categories";
import { getCurrent, getRace } from "@/lib/data";
import { getRankDeltas } from "@/lib/ranks";
import type { Category } from "@/lib/types";

// 한 카테고리 화면: 히어로(서버 렌더) + 읽는 법 + 라이브(새로고침 가능) 레이스·카드.
export default function CategoryView({ category }: { category: Category }) {
  const meta = getCategoryMeta(category);
  const race = getRace(category);
  const current = getCurrent(category);
  const deltas = getRankDeltas(category);

  return (
    <div className="space-y-7">
      <section className="space-y-3">
        <div className="eyebrow flex items-center gap-1.5 text-[var(--accent)]">
          <span>{meta.emoji}</span>
          {meta.label} · {meta.scoreLabel}
          <InfoDot label={meta.scoreLabel} align="left" />
        </div>
        <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
          지금 <span className="grad-text">대세</span>인 {meta.label} AI
        </h1>
        {/* 핵심 한 줄(항상) */}
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          순위는 <span className="font-semibold text-[var(--text)]">{meta.scoreLabel}</span>
          {" "}기준이에요. {meta.explainer}
        </p>
        {/* 초보자 모드에서만 펼쳐지는 비유 */}
        <BeginnerNote>{meta.analogy}</BeginnerNote>

        <Link
          href={`/grandprix/${category}`}
          className="grad-bar inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-[var(--on-accent)] shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:opacity-95"
        >
          🏎️ 그랑프리 모드로 보기
        </Link>
      </section>

      <CategoryLive
        category={category}
        label={meta.label}
        metricLabel={race.metricLabel}
        initialCurrent={current}
        initialRace={race}
        deltas={deltas}
        live={meta.live !== false}
      />
    </div>
  );
}
