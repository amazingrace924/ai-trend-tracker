import Link from "next/link";
import type { ModelInfo } from "@/lib/types";
import type { RankDelta } from "@/lib/ranks";
import { vendorColor } from "@/lib/vendors";
import StrengthBadge from "./StrengthBadge";
import RankChange from "./RankChange";
import VendorAvatar from "./VendorAvatar";

// 모델별 기능·강점 카드 — 카테고리 무관(score/scoreLabel/highlights 사용).
export default function ModelCard({
  model,
  rank,
  delta,
}: {
  model: ModelInfo;
  rank?: number;
  delta?: RankDelta;
}) {
  const color = vendorColor(model.vendor);
  const isTop = rank === 1;
  return (
    <Link
      href={`/models/${model.id}`}
      className="card card-hover group relative block overflow-hidden p-4"
    >
      {/* 좌측 벤더 컬러 스트라이프 */}
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ background: isTop ? undefined : color }}
      />
      {isTop && <span className="grad-bar absolute inset-y-0 left-0 w-1" />}

      <div className="mb-3 flex items-start justify-between gap-2 pl-2">
        <div className="flex items-center gap-2.5">
          {rank != null && (
            <div className="flex flex-col items-center gap-1">
              <span className={"rank-badge " + (isTop ? "rank-1" : "")}>{rank}</span>
              <RankChange delta={delta} />
            </div>
          )}
          <VendorAvatar vendor={model.vendor} size={30} />
          <div>
            <div className="font-display font-bold leading-tight">{model.name}</div>
            <div className="text-xs font-medium text-[var(--muted)]">{model.vendor}</div>
          </div>
        </div>
        <div className="text-right">
          <div
            className={"tnum text-xl font-bold " + (isTop ? "grad-text" : "")}
            style={isTop ? undefined : { color }}
          >
            {model.score}
          </div>
          <div className="eyebrow text-[var(--muted)]">{model.scoreLabel}</div>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5 pl-2">
        {model.strengths.length > 0 ? (
          model.strengths.map((s) => <StrengthBadge key={s} tag={s} />)
        ) : (
          <span className="text-xs text-[var(--muted)]">—</span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-1.5 pl-2">
        {model.highlights.map((h) => (
          <div
            key={h.label}
            className="rounded-lg border border-[var(--border)] bg-[var(--panel2)] py-1.5 text-center"
          >
            <div className="tnum text-sm font-bold">{h.value}</div>
            <div className="eyebrow mt-0.5 text-[10px] text-[var(--muted)]">{h.label}</div>
          </div>
        ))}
      </div>
    </Link>
  );
}
