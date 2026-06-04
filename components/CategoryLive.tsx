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
  | "collecting" // AA 새 수집 확인 중
  | "done" // 최신 반영(쿨다운 등으로 새 수집은 생략)
  | "fresh" // 새 측정값까지 반영
  | "synced"; // 확인 완료, 이미 최신

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function RefreshIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

// 단일 '새로고침' 버튼: 즉시 게시 최신 로드 + AA 새 수집 트리거 + 완료 폴링.
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
  const busy = status === "loading" || status === "collecting";

  // 최신 current+race를 가져와 화면 반영(레이스 리마운트).
  async function applyLatest(): Promise<Snapshot> {
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

  // 가벼운 확인(상태 변경 없이 updatedAt만).
  async function peek(): Promise<string> {
    const cur = (await fetch(remoteDataUrl(category, "current"), {
      cache: "no-store",
    }).then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    })) as Snapshot;
    return cur.updatedAt;
  }

  async function refresh() {
    if (busy) return;
    setStatus("loading");

    // 1) 게시된 최신 즉시 반영
    let base = current.updatedAt;
    try {
      base = (await applyLatest()).updatedAt;
    } catch {
      /* 무시하고 계속 */
    }

    // 2) AA 새 수집 트리거(쿨다운/실패 시 새 수집 단계는 생략)
    let triggered = false;
    try {
      const res = await fetch(REFRESH_WORKER_URL, { method: "POST" });
      triggered = res.status === 202;
    } catch {
      /* 네트워크 오류 → 게시 최신만 */
    }
    if (!triggered) {
      setStatus("done");
      return;
    }

    // 3) 새 데이터 폴링(최대 2분) — 바뀌면 한 번만 반영
    setStatus("collecting");
    polling.current = true;
    const start = Date.now();
    while (polling.current && Date.now() - start < 120000) {
      await sleep(12000);
      try {
        const u = await peek();
        if (u && u !== base) {
          await applyLatest();
          polling.current = false;
          setStatus("fresh");
          return;
        }
      } catch {
        /* 폴링 일시 오류 무시 */
      }
    }
    if (polling.current) {
      polling.current = false;
      setStatus("synced");
    }
  }

  return (
    <div className="space-y-7">
      {/* 새로고침 컨트롤 */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={refresh}
          disabled={busy}
          title="최신 데이터를 즉시 불러오고, AA에서 새 측정값도 확인해요"
          className="grad-bar group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:opacity-95 disabled:opacity-60"
        >
          <RefreshIcon
            className={
              "h-4 w-4 " +
              (busy ? "animate-spin" : "transition-transform duration-500 group-hover:rotate-180")
            }
          />
          {busy ? "갱신 중…" : "새로고침"}
        </button>
        <UpdatedBadge updatedAt={current.updatedAt} />
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
    loading: { text: "최신 데이터 불러오는 중…", cls: "text-[var(--muted)]" },
    collecting: { text: "최신 반영 완료 · AA에서 새 측정값 확인 중… (최대 2분)", cls: "text-[var(--muted)]" },
    done: { text: "✓ 최신 데이터로 갱신됨", cls: "text-green-500" },
    fresh: { text: "✓ 새 측정값까지 반영 완료!", cls: "text-green-500" },
    synced: { text: "✓ 확인 완료 — 이미 최신이에요", cls: "text-green-500" },
  };
  const s = map[status];
  if (!s) return null;
  return <span className={"text-xs font-semibold " + s.cls}>{s.text}</span>;
}
