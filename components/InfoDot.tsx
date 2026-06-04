"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { lookupTerm } from "@/lib/glossary";

// 용어 옆 작은 ⓘ — 호버/탭으로 쉬운 설명 팝오버.
// 팝오버는 body로 portal + fixed라 카드 overflow에 안 잘리고,
// 닫힘에 유예(220ms) + 팝오버 위 호버 유지로 "자세히 →"를 누를 수 있다.
const POP_W = 248;
const CLOSE_DELAY = 220;

export default function InfoDot({
  label,
  align: _align,
}: {
  label: string;
  align?: "center" | "left" | "right";
}) {
  const entry = lookupTerm(label);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{
    left: number;
    top: number;
    placement: "top" | "bottom";
  }>({ left: 0, top: 0, placement: "top" });

  useEffect(() => setMounted(true), []);
  useEffect(() => () => cancelClose(), []);

  function cancelClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }
  function scheduleClose() {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY);
  }
  function show() {
    cancelClose();
    setOpen(true);
  }

  function place() {
    const b = btnRef.current?.getBoundingClientRect();
    if (!b) return;
    const left = Math.max(
      8,
      Math.min(b.left + b.width / 2 - POP_W / 2, window.innerWidth - POP_W - 8),
    );
    const placement: "top" | "bottom" = b.top > 170 ? "top" : "bottom";
    const top = placement === "top" ? b.top - 8 : b.bottom + 8;
    setCoords({ left, top, placement });
  }

  useLayoutEffect(() => {
    if (open) place();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (btnRef.current?.contains(e.target as Node)) return;
      if (popRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onScroll() {
      setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  if (!entry) return null;

  const popover =
    open && mounted
      ? createPortal(
          <div
            ref={popRef}
            role="tooltip"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            style={{
              position: "fixed",
              left: coords.left,
              top: coords.top,
              width: POP_W,
              transform: coords.placement === "top" ? "translateY(-100%)" : undefined,
            }}
            className="card z-[100] p-3 text-left shadow-[var(--shadow-lift)]"
          >
            <span className="block font-display text-sm font-bold">{entry.term}</span>
            <span className="mt-1 block text-xs leading-relaxed text-[var(--muted)]">
              {entry.short}
            </span>
            <Link
              href={`/guide#${entry.key}`}
              className="mt-1.5 inline-block text-xs font-semibold text-[var(--accent)] hover:underline"
            >
              자세히 →
            </Link>
          </div>,
          document.body,
        )
      : null;

  return (
    <span
      className="relative inline-flex align-middle"
      onMouseEnter={show}
      onMouseLeave={scheduleClose}
    >
      <button
        ref={btnRef}
        type="button"
        aria-label={`${entry.term} 설명`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          cancelClose();
          setOpen((o) => !o);
        }}
        className="flex h-4 w-4 items-center justify-center rounded-full border border-[var(--border-strong)] text-[10px] font-bold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        i
      </button>
      {popover}
    </span>
  );
}
