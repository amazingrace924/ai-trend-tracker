import Link from "next/link";
import { notFound } from "next/navigation";
import StrengthBadge from "@/components/StrengthBadge";
import MetricLabel from "@/components/MetricLabel";
import { getAllModels, getCurrent, getModel } from "@/lib/data";
import { STRENGTH_DESC } from "@/lib/deriveStrengths";
import { getCategoryMeta } from "@/lib/categories";
import { vendorColor } from "@/lib/vendors";

// 정적 익스포트를 위해 전 카테고리 모든 모델 id를 미리 생성한다.
export function generateStaticParams() {
  return getAllModels().map((m) => ({ id: m.id }));
}

export default async function ModelDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const model = getModel(id);
  if (!model) notFound();

  const color = vendorColor(model.vendor);
  const cat = getCategoryMeta(model.category);
  const backHref = `/c/${model.category}`;
  // 같은 카테고리 내 현재 순위
  const rank =
    getCurrent(model.category).models.findIndex((m) => m.id === model.id) + 1;
  const isTop = rank === 1;

  return (
    <div className="space-y-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:underline"
      >
        ← {cat.emoji} {cat.label} 순위
      </Link>

      <div className="card relative overflow-hidden p-6">
        <span
          className="absolute inset-x-0 top-0 h-1"
          style={{ background: isTop ? undefined : color }}
        />
        {isTop && <span className="grad-bar absolute inset-x-0 top-0 h-1" />}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            {rank > 0 && (
              <span className={"rank-badge h-9 min-w-9 text-base " + (isTop ? "rank-1" : "")}>
                {rank}
              </span>
            )}
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">{model.name}</h1>
              <div className="text-sm font-medium text-[var(--muted)]">
                {model.vendor} · {model.license === "open" ? "오픈" : "독점"}
                {model.releaseDate ? ` · ${model.releaseDate} 출시` : ""}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div
              className={"tnum text-4xl font-bold " + (isTop ? "grad-text" : "")}
              style={isTop ? undefined : { color }}
            >
              {model.score}
            </div>
            <div className="eyebrow text-[var(--muted)]">{model.scoreLabel}</div>
          </div>
        </div>
      </div>

      {/* 쉽게 말하면 — 한 줄 요약(항상 노출) */}
      <div className="card border-l-4 border-l-[var(--accent)] p-4">
        <div className="eyebrow mb-1 text-[var(--accent)]">쉽게 말하면</div>
        <p className="text-sm leading-relaxed">
          <span className="font-bold">{model.name}</span>
          은(는) 지금 {cat.label} 분야{" "}
          <span className="font-bold">{rank > 0 ? `${rank}위` : "순위권"}</span>
          {model.strengths.length > 0 ? (
            <>
              {" "}이고, 특히{" "}
              <span className="font-bold">{model.strengths.slice(0, 2).join(" · ")}</span>
              {" "}점에서 강해요.
            </>
          ) : (
            " 예요."
          )}
        </p>
      </div>

      {model.strengths.length > 0 && (
        <div className="card p-5">
          <div className="eyebrow mb-3 text-[var(--muted)]">강점</div>
          <div className="flex flex-col gap-2">
            {model.strengths.map((s) => (
              <div key={s} className="flex items-center gap-2.5">
                <StrengthBadge tag={s} />
                <span className="text-sm text-[var(--muted)]">
                  {STRENGTH_DESC[s] ?? ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card divide-y divide-[var(--border)] overflow-hidden">
        {model.stats.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between px-5 py-3 transition hover:bg-[var(--panel2)]"
          >
            <MetricLabel
              label={r.label}
              align="left"
              className="text-sm font-medium text-[var(--muted)]"
            />
            <span className="tnum text-sm font-bold">{r.value}</span>
          </div>
        ))}
      </div>

      <p className="text-xs leading-relaxed text-[var(--muted)]">
        출처: Artificial Analysis(성능·속도·가격) · LMArena/Arena(사람 투표 Elo).
        {model.category === "music" && " 음악은 초기 큐레이션 데이터."}
      </p>
    </div>
  );
}
