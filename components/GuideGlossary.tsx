"use client";

import { useMemo, useState } from "react";
import { GLOSSARY, type GlossaryGroup } from "@/lib/glossary";

const GROUP_ORDER: GlossaryGroup[] = ["기초", "공통", "LLM", "미디어"];
const GROUP_EMOJI: Record<GlossaryGroup, string> = {
  기초: "🌱",
  공통: "📊",
  LLM: "🧠",
  미디어: "🎨",
};

// 검색 가능한 용어 사전. 각 항목에 id를 달아 ⓘ의 "자세히 →"(/guide#key)가 도달한다.
export default function GuideGlossary() {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      GLOSSARY.filter(
        (e) =>
          !query ||
          e.term.toLowerCase().includes(query) ||
          e.short.toLowerCase().includes(query) ||
          e.detail.toLowerCase().includes(query) ||
          e.aliases?.some((a) => a.toLowerCase().includes(query)),
      ),
    [query],
  );

  return (
    <div className="space-y-5">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="용어 검색 (예: Elo, 컨텍스트, 토큰)"
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--accent)]"
      />

      {GROUP_ORDER.map((group) => {
        const items = filtered.filter((e) => e.group === group);
        if (items.length === 0) return null;
        return (
          <div key={group} className="space-y-3">
            <h3 className="eyebrow text-[var(--muted)]">
              {GROUP_EMOJI[group]} {group}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((e) => (
                <div key={e.key} id={e.key} className="card scroll-mt-24 p-4">
                  <div className="font-display font-bold">{e.term}</div>
                  <p className="mt-1 text-sm font-medium text-[var(--text)]">{e.short}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
                    {e.detail}
                  </p>
                  {e.example && (
                    <p className="mt-2 rounded-lg bg-[var(--panel2)] px-2.5 py-1.5 text-xs text-[var(--muted)]">
                      예: {e.example}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <p className="text-sm text-[var(--muted)]">검색 결과가 없어요.</p>
      )}
    </div>
  );
}
