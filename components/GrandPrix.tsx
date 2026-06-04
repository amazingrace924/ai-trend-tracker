"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { RaceData } from "@/lib/types";
import VendorAvatar from "./VendorAvatar";

const LANES = 8;
const FRAME_MS = 1000;

// AI 그랑프리 — F1 스타일. 고정 레인에서 아바타 '차량'이 점수에 따라 트랙을 달리고,
// 날짜(랩)가 흐르며 서로 추월한다. 가장 오른쪽(결승선 근처)이 선두.
export default function GrandPrix({
  race,
  categoryLabel,
  metricLabel,
  backHref,
}: {
  race: RaceData;
  categoryLabel: string;
  metricLabel: string;
  backHref: string;
}) {
  const frames = race.frames;
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // 레인(고정): 최종 프레임 순위 상위 N.
  const racers = useMemo(
    () =>
      [...(frames[frames.length - 1]?.entries ?? [])]
        .sort((a, b) => b.value - a.value)
        .slice(0, LANES),
    [frames],
  );
  const { gMin, gMax } = useMemo(() => {
    const vs = frames.flatMap((f) => f.entries.map((e) => e.value));
    return { gMin: Math.min(...vs), gMax: Math.max(...vs) };
  }, [frames]);

  useEffect(() => {
    if (!playing || frames.length === 0) return;
    timer.current = setInterval(() => {
      setI((prev) => {
        if (prev >= frames.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, FRAME_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, frames.length]);

  if (frames.length === 0) {
    return <div className="card p-6 text-[var(--muted)]">레이스 데이터가 없습니다.</div>;
  }

  const frame = frames[i];
  const valueById = new Map(frame.entries.map((e) => [e.id, e.value]));
  const ranked = [...frame.entries].sort((a, b) => b.value - a.value);
  const posById = new Map(ranked.map((e, idx) => [e.id, idx + 1]));
  const leaderId = ranked[0]?.id;
  const trackPct = (v: number) =>
    6 + (gMax > gMin ? (v - gMin) / (gMax - gMin) : 1) * 80;

  function restart() {
    setI(0);
    setPlaying(true);
  }

  return (
    <div className="space-y-5">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:underline"
      >
        ← {categoryLabel} 순위로
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow flex items-center gap-1.5 text-[var(--accent)]">
            🏎️ AI 그랑프리 · {categoryLabel}
          </div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            결승선을 향한 <span className="grad-text">질주</span>
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            오른쪽 끝(결승선)에 가까울수록 선두예요. {metricLabel} 기준.
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel2)] px-3 py-2 text-sm">
          <span className="tnum font-bold">LAP {i + 1}</span>
          <span className="text-[var(--muted)]"> / {frames.length} · {frame.date}</span>
        </div>
      </div>

      {/* 트랙 (어두운 아스팔트) */}
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[#101117] p-3 text-[#e8eaf2] sm:p-4">
        <div className="space-y-1.5">
          {racers.map((r, lane) => {
            const v = valueById.get(r.id) ?? gMin;
            const pos = posById.get(r.id);
            const isLeader = r.id === leaderId;
            return (
              <div key={r.id} className="flex items-center gap-2">
                {/* 게이트(고정): 현재 순위 + 이름 */}
                <div className="flex w-28 shrink-0 items-center gap-1.5 sm:w-40">
                  <span
                    className={
                      "rank-badge h-6 min-w-6 text-xs " + (pos === 1 ? "rank-1" : "")
                    }
                    style={pos === 1 ? undefined : { borderColor: "#3a3f57" }}
                  >
                    {pos ?? "-"}
                  </span>
                  <span className="truncate font-display text-xs font-bold sm:text-sm">
                    {r.name}
                  </span>
                </div>

                {/* 트랙 레인 */}
                <div
                  className="relative h-11 flex-1 rounded-lg"
                  style={{
                    background:
                      lane % 2 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)",
                  }}
                >
                  {/* 중앙 차선 점선 */}
                  <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 border-t border-dashed border-white/15" />
                  {/* 결승선 체커 */}
                  <div className="checker absolute right-1 top-0 h-full w-2 rounded opacity-70" />
                  {/* 차량(아바타) */}
                  <motion.div
                    className="absolute top-1/2"
                    style={{ translateX: "-50%", translateY: "-50%" }}
                    animate={{ left: `${trackPct(v)}%` }}
                    transition={{ type: "spring", stiffness: 90, damping: 18 }}
                  >
                    <div className="flex flex-col items-center">
                      {isLeader && <span className="text-xs leading-none">👑</span>}
                      <VendorAvatar vendor={r.vendor} size={30} />
                      <span className="tnum mt-0.5 rounded bg-black/40 px-1 text-[9px] font-bold leading-tight">
                        {v.toFixed(metricLabel === "Arena Elo" ? 0 : 1)}
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 컨트롤 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => (i >= frames.length - 1 ? restart() : setPlaying((p) => !p))}
          className="grad-bar flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-[var(--on-accent)] shadow-[var(--shadow)] transition hover:opacity-90"
        >
          {i >= frames.length - 1 ? "↻ 다시 레이스" : playing ? "⏸ 일시정지" : "🏁 출발"}
        </button>
        <input
          type="range"
          min={0}
          max={frames.length - 1}
          value={i}
          onChange={(e) => {
            setPlaying(false);
            setI(Number(e.target.value));
          }}
          className="h-2 flex-1 cursor-pointer accent-[var(--accent)]"
          aria-label="랩 스크러버"
        />
        <div className="tnum w-14 shrink-0 text-right text-xs text-[var(--muted)]">
          {i + 1}/{frames.length}
        </div>
      </div>

      <p className="text-xs text-[var(--muted)]">
        🏁 다른 종목(수영·경마·달리기 등) 테마도 추가 예정이에요.
      </p>
    </div>
  );
}
