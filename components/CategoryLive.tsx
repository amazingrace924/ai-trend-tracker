"use client";

import { useState } from "react";
import BarChartRace from "@/components/BarChartRace";
import ModelCard from "@/components/ModelCard";
import UpdatedBadge from "@/components/UpdatedBadge";
import { remoteDataUrl } from "@/lib/remote";
import type { Category, RaceData, Snapshot } from "@/lib/types";

// 서버에서 빌드 시 구운 데이터로 초기 렌더(빠름) + '새로고침' 버튼으로
// CDN(raw)에서 최신 커밋 데이터를 즉시 가져와 화면을 갱신한다.
export default function CategoryLive({
  category,
  label,
  initialCurrent,
  initialRace,
}: {
  category: Category;
  label: string;
  initialCurrent: Snapshot;
  initialRace: RaceData;
}) {
  const [current, setCurrent] = useState(initialCurrent);
  const [race, setRace] = useState(initialRace);
  const [version, setVersion] = useState(0); // 변경 시 레이스 리마운트
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function refresh() {
    setStatus("loading");
    try {
      const [cur, rc] = await Promise.all([
        fetch(remoteDataUrl(category, "current"), { cache: "no-store" }).then((r) => {
          if (!r.ok) throw new Error(String(r.status));
          return r.json() as Promise<Snapshot>;
        }),
        fetch(remoteDataUrl(category, "race"), { cache: "no-store" }).then((r) => {
          if (!r.ok) throw new Error(String(r.status));
          return r.json() as Promise<RaceData>;
        }),
      ]);
      setCurrent(cur);
      setRace(rc);
      setVersion((v) => v + 1);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={refresh}
          disabled={status === "loading"}
          className="flex items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--panel)] px-3 py-1.5 text-sm font-bold transition hover:border-[var(--accent)] disabled:opacity-60"
        >
          <span className={status === "loading" ? "inline-block animate-spin" : ""}>
            🔄
          </span>
          {status === "loading" ? "갱신 중…" : "최신 데이터 새로고침"}
        </button>
        <UpdatedBadge updatedAt={current.updatedAt} />
        {status === "done" && (
          <span className="text-xs font-semibold text-green-500">✓ 최신 데이터로 갱신됨</span>
        )}
        {status === "error" && (
          <span className="text-xs font-semibold text-[var(--accent)]">
            갱신 실패 — 잠시 후 다시 시도해 주세요
          </span>
        )}
      </div>

      <BarChartRace key={version} race={race} />

      <section className="space-y-4">
        <div className="flex items-baseline gap-2">
          <h2 className="text-xl font-bold">{label} 모델 강점</h2>
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
