"use client";

import { useRef, useState } from "react";
import BarChartRace from "@/components/BarChartRace";
import ModelCard from "@/components/ModelCard";
import UpdatedBadge from "@/components/UpdatedBadge";
import ReadingGuide from "@/components/ReadingGuide";
import { remoteDataUrl, REFRESH_WORKER_URL } from "@/lib/remote";
import type { Category, RaceData, Snapshot } from "@/lib/types";

type Status =
  | "idle"
  | "loading" // 게시된 최신 즉시 로드
  | "triggering" // 수집 시작 요청
  | "polling" // 수집 완료 대기
  | "done" // 즉시 로드 완료
  | "fresh" // 새 수집 완료
  | "cooldown"
  | "timeout"
  | "error";

export default function CategoryLive({
  category,
  label,
  metricLabel,
  initialCurrent,
  initialRace,
}: {
  category: Category;
  label: string;
  metricLabel: string;
  initialCurrent: Snapshot;
  initialRace: RaceData;
}) {
  const [current, setCurrent] = useState(initialCurrent);
  const [race, setRace] = useState(initialRace);
  const [version, setVersion] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const polling = useRef(false);

  const busy = status === "loading" || status === "triggering" || status === "polling";

  async function fetchLatest(): Promise<Snapshot> {
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
    return cur;
  }

  // 게시된 최신 데이터 즉시 불러오기
  async function loadPublished() {
    setStatus("loading");
    try {
      await fetchLatest();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  // AA에서 지금 새로 수집(Worker → GitHub Actions) 후 완료되면 자동 반영
  async function collectFresh() {
    setStatus("triggering");
    const base = current.updatedAt;
    let res: Response;
    try {
      res = await fetch(REFRESH_WORKER_URL, { method: "POST" });
    } catch {
      setStatus("error");
      return;
    }
    if (res.status === 429) {
      setStatus("cooldown");
      return;
    }
    if (!res.ok && res.status !== 202) {
      setStatus("error");
      return;
    }
    // 수집 완료 폴링: updatedAt이 바뀔 때까지 최대 3분
    setStatus("polling");
    polling.current = true;
    const start = Date.now();
    while (polling.current && Date.now() - start < 180000) {
      await new Promise((r) => setTimeout(r, 12000));
      try {
        const cur = await fetchLatest();
        if (cur.updatedAt && cur.updatedAt !== base) {
          polling.current = false;
          setStatus("fresh");
          return;
        }
      } catch {
        /* 폴링 중 일시 오류는 무시하고 재시도 */
      }
    }
    if (polling.current) {
      polling.current = false;
      setStatus("timeout");
    }
  }

  return (
    <div className="space-y-7">
      {/* 새로고침 바 */}
      <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadPublished}
            disabled={busy}
            className="grad-bar flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-[var(--on-accent)] shadow-[var(--shadow)] transition hover:opacity-90 disabled:opacity-60"
          >
            <span className={status === "loading" ? "inline-block animate-spin" : ""}>🔄</span>
            {status === "loading" ? "불러오는 중…" : "최신 데이터 불러오기"}
          </button>
          <button
            onClick={collectFresh}
            disabled={busy}
            title="AA에서 지금 새로 측정값을 수집합니다 (1~2분 소요)"
            className="flex items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--panel)] px-4 py-2.5 text-sm font-bold transition hover:border-[var(--accent)] disabled:opacity-60"
          >
            <span className={status === "triggering" || status === "polling" ? "inline-block animate-spin" : ""}>
              🛰
            </span>
            지금 새로 수집
          </button>
          <UpdatedBadge updatedAt={current.updatedAt} />
        </div>
        <StatusLine status={status} />
      </div>

      <ReadingGuide metricLabel={metricLabel} />

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

function StatusLine({ status }: { status: Status }) {
  const map: Partial<Record<Status, { text: string; cls: string }>> = {
    done: { text: "✓ 게시된 최신 데이터로 갱신됨", cls: "text-green-500" },
    fresh: { text: "✓ AA에서 새로 수집해 갱신 완료!", cls: "text-green-500" },
    triggering: { text: "수집 요청 보내는 중…", cls: "text-[var(--muted)]" },
    polling: { text: "🛰 AA에서 새로 수집 중… 완료되면 자동 반영됩니다 (최대 2분)", cls: "text-[var(--muted)]" },
    cooldown: { text: "방금 수집했어요. 60초 후 다시 시도해 주세요.", cls: "text-[var(--accent)]" },
    timeout: { text: "수집이 더 걸리고 있어요. 잠시 후 ‘최신 데이터 불러오기’로 확인해 주세요.", cls: "text-[var(--accent)]" },
    error: { text: "요청 실패 — 잠시 후 다시 시도해 주세요.", cls: "text-[var(--accent)]" },
  };
  const s = map[status];
  if (!s) return null;
  return <div className={"text-xs font-semibold " + s.cls}>{s.text}</div>;
}
