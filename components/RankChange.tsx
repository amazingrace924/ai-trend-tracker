import type { RankDelta } from "@/lib/ranks";

// 직전 대비 순위 변동 칩. ▲ 상승 / ▼ 하락 / – 유지 / NEW 신규.
export default function RankChange({ delta }: { delta?: RankDelta }) {
  if (!delta) return null;
  if (delta.status === "new")
    return (
      <span className="rounded bg-[var(--accent)] px-1.5 py-0.5 text-[9px] font-bold leading-none text-white">
        NEW
      </span>
    );
  if (delta.status === "up")
    return (
      <span className="text-[11px] font-bold leading-none text-green-500">
        ▲{delta.delta}
      </span>
    );
  if (delta.status === "down")
    return (
      <span className="text-[11px] font-bold leading-none text-sky-400">
        ▼{delta.delta}
      </span>
    );
  return <span className="text-[11px] font-bold leading-none text-[var(--muted)]">–</span>;
}
