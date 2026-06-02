"use client";

import { useState } from "react";
import { lookupTerm } from "@/lib/glossary";
import { useBeginner } from "./BeginnerMode";

// 차트 '읽는 법' 안내. 균형=한 줄 요약 + 펼치기, 초보자 모드=기본 펼침.
export default function ReadingGuide({ metricLabel }: { metricLabel: string }) {
  const { beginner } = useBeginner();
  const [manual, setManual] = useState<boolean | null>(null);
  const open = manual === null ? beginner : manual;
  const metric = lookupTerm(metricLabel);

  const points = [
    "막대 하나가 AI 모델 하나예요.",
    "막대가 길수록 점수가 높아요 (= 더 잘한다는 뜻).",
    "위에서부터 1등·2등… 순위이고, 1위는 색으로 강조돼요.",
    "날짜가 흐르면 순위가 바뀌며 '경주'처럼 움직여요.",
    "▶ 재생으로 변화를 보고, 슬라이더로 특정 날짜로 이동할 수 있어요.",
    metric
      ? `점수 '${metric.term}'는 ${metric.short}`
      : `점수는 '${metricLabel}' 기준이에요.`,
  ];

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setManual(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-bold">
          <span>📖</span> 이 그래프 읽는 법
          <span className="font-normal text-[var(--muted)]">— 처음이라면 펼쳐보세요</span>
        </span>
        <span className="text-xs font-semibold text-[var(--muted)]">
          {open ? "접기 ▴" : "펼치기 ▾"}
        </span>
      </button>
      {open && (
        <ul className="space-y-1.5 border-t border-[var(--border)] px-4 py-3 text-sm leading-relaxed text-[var(--muted)]">
          {points.map((p, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-[var(--accent)]">›</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
