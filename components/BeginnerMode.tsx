"use client";

import { createContext, useContext, useEffect, useState } from "react";

// '쉽게 보기'(초보자 모드) 전역 상태. 켜면 캡션·비유가 펼쳐진다.
// 균형 기준이라 꺼도 핵심 한 줄은 항상 보이므로, 이 값은 '추가 설명 노출' 스위치다.

interface BeginnerCtx {
  beginner: boolean;
  toggle: () => void;
}
const Ctx = createContext<BeginnerCtx>({ beginner: false, toggle: () => {} });

export function BeginnerProvider({ children }: { children: React.ReactNode }) {
  const [beginner, setBeginner] = useState(false);

  // 초기값: layout 인라인 스크립트가 세팅한 data-beginner 또는 localStorage.
  useEffect(() => {
    let on = document.documentElement.dataset.beginner === "on";
    try {
      if (!document.documentElement.dataset.beginner)
        on = localStorage.getItem("beginner") === "on";
    } catch {}
    setBeginner(on);
  }, []);

  function toggle() {
    setBeginner((prev) => {
      const next = !prev;
      document.documentElement.dataset.beginner = next ? "on" : "off";
      try {
        localStorage.setItem("beginner", next ? "on" : "off");
      } catch {}
      return next;
    });
  }

  return <Ctx.Provider value={{ beginner, toggle }}>{children}</Ctx.Provider>;
}

export function useBeginner(): BeginnerCtx {
  return useContext(Ctx);
}

// 초보자 모드일 때만 보이는 보조 설명(💡 콜아웃). 균형 기준의 '추가 설명' 역할.
export function BeginnerNote({ children }: { children: React.ReactNode }) {
  const { beginner } = useBeginner();
  if (!beginner) return null;
  return (
    <div className="flex gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--panel2)] px-3 py-2 text-sm leading-relaxed text-[var(--text)]">
      <span className="shrink-0">💡</span>
      <span>{children}</span>
    </div>
  );
}

// 헤더용 라벨 스위치 "쉽게 보기".
export function BeginnerToggle() {
  const { beginner, toggle } = useBeginner();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const on = mounted && beginner;

  return (
    <button
      onClick={toggle}
      role="switch"
      aria-checked={on}
      aria-label="쉽게 보기 모드"
      title="쉽게 보기 — 초보자용 설명을 펼쳐요"
      className={
        "flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs font-semibold transition " +
        (on
          ? "border-[var(--accent)] text-[var(--text)]"
          : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]")
      }
    >
      <span>쉽게 보기</span>
      <span
        className={
          "relative inline-flex h-4 w-7 items-center rounded-full transition-colors " +
          (on ? "grad-bar" : "bg-[var(--panel2)]")
        }
      >
        <span
          suppressHydrationWarning
          className={
            "absolute h-3 w-3 rounded-full bg-white shadow transition-transform duration-200 " +
            (on ? "translate-x-[14px]" : "translate-x-[2px]")
          }
        />
      </span>
    </button>
  );
}
