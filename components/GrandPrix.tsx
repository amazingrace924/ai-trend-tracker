"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { RaceData } from "@/lib/types";
import VendorAvatar from "./VendorAvatar";

const LANES = 8;
type Phase = "countdown" | "racing" | "finished";

const CONFETTI_COLORS = ["#ff2d55", "#ff7a3d", "#ffd23f", "#3b5bdb", "#10a37f", "#7c5cff"];

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
  // 현재 순위(최신 프레임) 상위 N을 출전시킨다. 레이스는 '현재 1위'를 향한 질주 쇼.
  const racers = useMemo(
    () =>
      [...(race.frames[race.frames.length - 1]?.entries ?? [])]
        .sort((a, b) => b.value - a.value)
        .slice(0, LANES),
    [race],
  );
  const winner = racers[0];
  const { min, max } = useMemo(() => {
    const vs = racers.map((r) => r.value);
    return { min: Math.min(...vs), max: Math.max(...vs) };
  }, [racers]);
  const targetPct = (v: number) => 28 + (max > min ? (v - min) / (max - min) : 1) * 58;

  const [runId, setRunId] = useState(0);
  const [phase, setPhase] = useState<Phase>("countdown");
  const [count, setCount] = useState(3);

  // 매 레이스마다 새 안무(출발 그리드 셔플 + 중간 흔들림 키프레임).
  const choreo = useMemo(() => {
    const order = racers.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    const clamp = (n: number) => Math.max(6, Math.min(90, n));
    const jitter = () => (Math.random() - 0.5) * 18;
    return racers.map((r, idx) => {
      const t = targetPct(r.value);
      const start = 6;
      return {
        racer: r,
        lane: order[idx], // 셔플된 레인(출발 그리드)
        start,
        k1: clamp(start + (t - start) * 0.42 + jitter()),
        k2: clamp(start + (t - start) * 0.8 + jitter()),
        target: t,
        dur: 4.6 + Math.random() * 1.8,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [racers, runId]);

  const raceDur = Math.max(5, ...choreo.map((c) => c.dur));

  function start() {
    setRunId((x) => x + 1);
    setCount(3);
    setPhase("countdown");
  }

  useEffect(() => {
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 카운트다운 3·2·1·GO
  useEffect(() => {
    if (phase !== "countdown") return;
    if (count < 0) {
      setPhase("racing");
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 650);
    return () => clearTimeout(t);
  }, [phase, count]);

  // 결승
  useEffect(() => {
    if (phase !== "racing") return;
    const t = setTimeout(() => setPhase("finished"), raceDur * 1000 + 250);
    return () => clearTimeout(t);
  }, [phase, raceDur]);

  const racing = phase === "racing";
  const moving = phase === "racing" || phase === "finished";
  const fmt = (v: number) => (metricLabel === "Arena Elo" ? v.toFixed(0) : v.toFixed(1));

  // 레인(세로) 순서 = 셔플된 그리드
  const lanes = [...choreo].sort((a, b) => a.lane - b.lane);

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
          <div className="eyebrow text-[var(--accent)]">🏎️ AI 그랑프리 · {categoryLabel}</div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            결승선을 향한 <span className="grad-text">질주</span>
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            출발선에서 동시에! 가장 먼저 결승선에 닿는 AI가 현재 1위예요. ({metricLabel})
          </p>
        </div>
        <button
          onClick={start}
          className="grad-bar rounded-xl px-4 py-2.5 text-sm font-bold text-[var(--on-accent)] shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:opacity-95"
        >
          {phase === "finished" ? "↻ 다시 레이스" : "🏁 다시 출발"}
        </button>
      </div>

      {/* 트랙 */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[#0e0f15] p-3 text-[#e8eaf2] sm:p-4">
        {/* 결승선 체커 */}
        <div className="checker absolute right-3 top-3 bottom-3 z-10 w-3 rounded opacity-80 sm:right-4" />

        <div className="space-y-1.5">
          {lanes.map((c, idx) => {
            const isWinner = phase === "finished" && c.racer.id === winner.id;
            return (
              <div key={c.racer.id} className="flex items-center gap-2">
                {/* 게이트: 이름 */}
                <div className="flex w-24 shrink-0 items-center gap-1.5 sm:w-36">
                  <span className="font-mono text-[10px] text-white/40">{idx + 1}</span>
                  <span className="truncate font-display text-xs font-bold sm:text-sm">
                    {c.racer.name}
                  </span>
                </div>

                {/* 레인 */}
                <div
                  className="relative h-12 flex-1 rounded-lg"
                  style={{ background: idx % 2 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.07)" }}
                >
                  <div
                    className={
                      "road absolute inset-x-3 top-1/2 h-[2px] -translate-y-1/2 " +
                      (racing ? "road-run" : "")
                    }
                  />
                  {/* 차량 */}
                  <motion.div
                    className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                    initial={{ left: `${c.start}%` }}
                    animate={
                      moving
                        ? { left: [`${c.start}%`, `${c.k1}%`, `${c.k2}%`, `${c.target}%`] }
                        : { left: `${c.start}%` }
                    }
                    transition={
                      moving
                        ? { duration: c.dur, ease: "easeOut", times: [0, 0.42, 0.8, 1] }
                        : { duration: 0.2 }
                    }
                  >
                    {/* 스피드 라인 */}
                    {racing && (
                      <span className="absolute right-full top-1/2 mr-1 h-1 w-7 -translate-y-1/2 rounded-full bg-gradient-to-l from-white/70 to-transparent" />
                    )}
                    {/* 엔진 진동/기울임 */}
                    <motion.div
                      className="flex flex-col items-center"
                      animate={racing ? { y: [0, -2, 1, -1, 0], rotate: [-3, 3, -3] } : { y: 0, rotate: 0 }}
                      transition={racing ? { duration: 0.28, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
                    >
                      <span className="h-3 text-xs leading-none">{isWinner ? "👑" : ""}</span>
                      <span
                        style={
                          isWinner
                            ? { filter: "drop-shadow(0 0 6px #ffd23f)" }
                            : undefined
                        }
                      >
                        <VendorAvatar vendor={c.racer.vendor} size={30} />
                      </span>
                      <span className="tnum mt-0.5 rounded bg-black/45 px-1 text-[9px] font-bold leading-tight">
                        {fmt(c.racer.value)}
                      </span>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 카운트다운 오버레이 */}
        {phase === "countdown" && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/45 backdrop-blur-[1px]">
            <motion.div
              key={count}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-display text-7xl font-extrabold text-white drop-shadow-lg"
            >
              {count > 0 ? count : "GO! 🏁"}
            </motion.div>
          </div>
        )}

        {/* 우승 콘페티 + 배너 */}
        {phase === "finished" && (
          <>
            <Confetti />
            <motion.div
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute left-1/2 top-3 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/60 px-4 py-1.5 text-sm font-bold shadow-lg"
            >
              🏆 우승 · <VendorAvatar vendor={winner.vendor} size={20} />
              <span className="grad-text">{winner.name}</span>
            </motion.div>
          </>
        )}
      </div>

      <p className="text-xs text-[var(--muted)]">
        최종 순위는 실제 현재 순위({metricLabel})예요. 중간 추월·흔들림은 연출이에요.
        🏁 다른 종목(수영·경마·달리기) 테마도 추가 예정!
      </p>
    </div>
  );
}

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 44 }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rot: Math.random() * 360,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}
