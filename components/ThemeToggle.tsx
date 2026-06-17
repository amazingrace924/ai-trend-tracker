"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function SunIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

// 슬라이딩 스위치형 라이트/다크 토글. 초기 테마는 layout 인라인 스크립트가 설정했고,
// 여기선 data-theme를 읽어 동기화 + 클릭 시 토글 + localStorage 저장.
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current = (document.documentElement.dataset.theme as Theme) ?? "light";
    setTheme(current);
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label="테마 전환"
      title={mounted ? (isDark ? "라이트 모드로" : "다크 모드로") : "테마 전환"}
      className="relative inline-flex h-8 w-[58px] items-center rounded-full border border-[var(--border)] bg-[var(--panel2)] px-1 transition-colors hover:border-[var(--accent)]"
    >
      {/* 양 끝 고정 아이콘(은은하게) */}
      <SunIcon className="absolute left-2 h-3.5 w-3.5 text-[var(--muted)]" />
      <MoonIcon className="absolute right-2 h-3.5 w-3.5 text-[var(--muted)]" />

      {/* 슬라이딩 노브 — 현재 테마 아이콘을 그라데이션 위에 표시 */}
      <span
        suppressHydrationWarning
        className={
          "grad-bar relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-[var(--on-accent)] shadow-[var(--shadow)] transition-transform duration-300 ease-out " +
          (isDark ? "translate-x-[26px]" : "translate-x-0")
        }
      >
        <span suppressHydrationWarning>
          {isDark ? (
            <MoonIcon className="h-3.5 w-3.5" />
          ) : (
            <SunIcon className="h-3.5 w-3.5" />
          )}
        </span>
      </span>
    </button>
  );
}
