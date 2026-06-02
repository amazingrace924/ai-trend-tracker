"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import type { RaceData } from "@/lib/types";
import { vendorColor } from "@/lib/vendors";
import InfoDot from "./InfoDot";

const ROW_H = 54; // 막대 한 줄 높이(px)
const FRAME_MS = 900;

export default function BarChartRace({ race }: { race: RaceData }) {
  const frames = race.frames;
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const maxValue = useMemo(
    () => Math.max(1, ...frames.flatMap((f) => f.entries.map((e) => e.value))),
    [frames],
  );

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
    return (
      <div className="card p-6 text-[var(--muted)]">
        레이스 데이터가 없습니다. <code>npm run build-data</code>로 스냅샷을 생성하세요.
      </div>
    );
  }

  const frame = frames[i];
  const ranked = [...frame.entries].sort((a, b) => b.value - a.value);
  const leader = ranked[0];

  function restart() {
    setI(0);
    setPlaying(true);
  }

  return (
    <div className="card overflow-hidden p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="eyebrow flex items-center gap-1.5 text-[var(--accent)]">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" />
            LIVE RACE · {race.metricLabel}
            <InfoDot label={race.metricLabel} align="left" />
          </div>
          <div className="tnum mt-1 text-2xl font-bold">{frame.date}</div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel2)] px-3 py-2 text-sm">
          <span className="text-base">🏁</span>
          <span className="text-[var(--muted)]">선두</span>
          <span
            className="font-display font-bold"
            style={{ color: vendorColor(leader.vendor) }}
          >
            {leader.name}
          </span>
          <span className="tnum font-bold">{leader.value.toFixed(1)}</span>
        </div>
      </div>

      {/* 막대들: 순서가 바뀌면 Framer Motion layout이 위치를 부드럽게 이동시켜 '경주'처럼 보인다 */}
      <div className="relative" style={{ height: ranked.length * ROW_H }}>
        {/* 결승선(체커) */}
        <div className="checker absolute right-0 top-0 h-full w-1.5 rounded-full opacity-40" />
        {ranked.map((e, rank) => {
          const pct = (e.value / maxValue) * 100;
          const color = vendorColor(e.vendor);
          const isLeader = rank === 0;
          return (
            <motion.div
              key={e.id}
              layout
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="absolute left-0 right-0 flex items-center gap-3"
              style={{ top: rank * ROW_H, height: ROW_H - 10 }}
            >
              <div className={"rank-badge shrink-0 " + (isLeader ? "rank-1" : "")}>
                {rank + 1}
              </div>
              <div className="relative h-full flex-1 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--panel2)]">
                <motion.div
                  className={"absolute inset-y-0 left-0 " + (isLeader ? "grad-bar" : "")}
                  style={
                    isLeader
                      ? undefined
                      : { background: `${color}2e`, borderRight: `4px solid ${color}` }
                  }
                  animate={{ width: `${pct}%` }}
                  transition={{ type: "spring", stiffness: 220, damping: 30 }}
                />
                <div className="relative flex h-full items-center justify-between px-3">
                  <span
                    className={
                      "truncate font-display text-sm font-bold " +
                      (isLeader ? "text-[var(--on-accent)]" : "")
                    }
                  >
                    {e.name}
                    {isLeader && <span className="ml-1.5">🔥</span>}
                  </span>
                  <span
                    className={
                      "tnum ml-2 shrink-0 text-sm font-bold " +
                      (isLeader ? "text-[var(--on-accent)]" : "")
                    }
                  >
                    {e.value.toFixed(1)}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 컨트롤 */}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => (i >= frames.length - 1 ? restart() : setPlaying((p) => !p))}
          className="grad-bar flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-[var(--on-accent)] shadow-[var(--shadow)] transition hover:opacity-90"
        >
          {i >= frames.length - 1 ? "↻ 다시 보기" : playing ? "⏸ 일시정지" : "▶ 재생"}
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
          aria-label="날짜 스크러버"
        />
        <div className="tnum w-14 shrink-0 text-right text-xs text-[var(--muted)]">
          {i + 1}/{frames.length}
        </div>
      </div>
    </div>
  );
}
