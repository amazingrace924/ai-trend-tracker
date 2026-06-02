import { fmtRelative } from "@/lib/format";

// 마지막 갱신 시각 배지 — "매일 자동 갱신" 신뢰를 시각화.
export default function UpdatedBadge({ updatedAt }: { updatedAt: string }) {
  const rel = fmtRelative(updatedAt);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
      </span>
      {rel ? `${rel} 갱신` : "갱신 정보 없음"}
    </span>
  );
}
