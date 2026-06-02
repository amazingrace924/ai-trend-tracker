"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { lookupTerm } from "@/lib/glossary";

// 용어 옆 작은 ⓘ — 호버(데스크톱)/탭(모바일)으로 쉬운 설명 팝오버.
// 팝오버는 body로 portal + position:fixed라서 카드의 overflow:hidden에 잘리지 않는다.
const POP_W = 248;

export default function InfoDot({
  label,
  // align은 호환용으로 유지(좌표는 동적으로 계산하므로 미사용).
  align: _align,
}: {
  label: string;
  align?: "center" | "left" | "right";
}) {
  const entry = lookupTerm(label);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const pinned = useRef(false);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{
    left: number;
    top: number;
    placement: "top" | "bottom";
  }>({ left: 0, top: 0, placement: "top" });

  useEffect(() => setMounted(true), []);

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
    function close() {
      setOpen(false);
      pinned.current = false;
    }
    function onDoc(e: MouseEvent) {
      if (btnRef.current?.contains(e.target as Node)) return;
      if (popRef.current?.contains(e.target as Node)) return;
      close();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    // 스크롤/리사이즈 시 좌표가 어긋나므로 닫는다.
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  if (!entry) return null;

  const popover =
    open && mounted
      ? createPortal(
          <div
            ref={popRef}
            role="tooltip"
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
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        if (!pinned.current) setOpen(false);
      }}
    >
      <button
        ref={btnRef}
        type="button"
        aria-label={`${entry.term} 설명`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((prev) => {
            const next = !prev;
            pinned.current = next; // 클릭으로 열면 고정(호버로 닫히지 않음)
            return next;
          });
        }}
        className="flex h-4 w-4 items-center justify-center rounded-full border border-[var(--border-strong)] text-[10px] font-bold text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        i
      </button>
      {popover}
    </span>
  );
}
