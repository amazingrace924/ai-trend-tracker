import BarChartRace from "@/components/BarChartRace";
import ModelCard from "@/components/ModelCard";
import UpdatedBadge from "@/components/UpdatedBadge";
import ReadingGuide from "@/components/ReadingGuide";
import InfoDot from "@/components/InfoDot";
import { BeginnerNote } from "@/components/BeginnerMode";
import { getCategoryMeta } from "@/lib/categories";
import { getCurrent, getRace } from "@/lib/data";
import type { Category } from "@/lib/types";

// 한 카테고리의 전체 화면: 히어로 + 읽는 법 + 바 차트 레이스 + 강점 카드 그리드.
export default function CategoryView({ category }: { category: Category }) {
  const meta = getCategoryMeta(category);
  const race = getRace(category);
  const current = getCurrent(category);

  return (
    <div className="space-y-7">
      <section className="space-y-3">
        <div className="eyebrow flex items-center gap-1.5 text-[var(--accent)]">
          <span>{meta.emoji}</span>
          {meta.label} · {meta.scoreLabel}
          <InfoDot label={meta.scoreLabel} align="left" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
            지금 <span className="grad-text">대세</span>인 {meta.label} AI
          </h1>
          <UpdatedBadge updatedAt={current.updatedAt} />
        </div>
        {/* 핵심 한 줄(항상) */}
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          순위는 <span className="font-semibold text-[var(--text)]">{meta.scoreLabel}</span>
          {" "}기준이에요. {meta.explainer}
        </p>
        {/* 초보자 모드에서만 펼쳐지는 비유 */}
        <BeginnerNote>{meta.analogy}</BeginnerNote>
      </section>

      <ReadingGuide metricLabel={race.metricLabel} />

      <BarChartRace race={race} />

      <section className="space-y-4">
        <div className="flex items-baseline gap-2">
          <h2 className="text-xl font-bold">{meta.label} 모델 강점</h2>
          <span className="tnum rounded-md border border-[var(--border)] bg-[var(--panel2)] px-2 py-0.5 text-xs font-bold text-[var(--muted)]">
            {current.models.length}
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {current.models.map((m, idx) => (
            <ModelCard key={m.id} model={m} rank={idx + 1} />
          ))}
        </div>
      </section>
    </div>
  );
}
