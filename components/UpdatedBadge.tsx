import { fmtRelative } from "@/lib/format";

// 마지막 갱신 시각 배지 — "매일 자동 갱신" 신뢰를 시각화.
// live=false(예: 음악)는 갱신될 라이브 소스가 없으므로 정직하게 '기준 데이터'로 표시한다.
export default function UpdatedBadge({
  updatedAt,
  live = true,
}: {
  updatedAt: string;
  live?: boolean;
}) {
  if (!live) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--panel)] px-3 py-1 text-xs font-medium text-[var(--muted)]"
        title="음악은 실시간 갱신 소스가 없어 기준(큐레이션) 데이터로 고정돼 있어요."
      >
        <span className="inline-flex h-2 w-2 rounded-full bg-[var(--muted)] opacity-60" />
        라이브 소스 없음 · 기준 데이터
      </span>
    );
  }
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
