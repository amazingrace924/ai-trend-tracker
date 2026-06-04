"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";

export default function CategoryTabs() {
  const pathname = usePathname();
  const activeCat = pathname.startsWith("/c/") ? pathname.split("/")[2] : null;
  const isHome = pathname === "/" || pathname === "";

  const tabClass = (active: boolean) =>
    "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition " +
    (active
      ? "grad-bar text-[var(--on-accent)] shadow-[var(--shadow)]"
      : "text-[var(--muted)] hover:bg-[var(--panel2)] hover:text-[var(--text)]");

  return (
    <nav className="flex gap-1.5 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--panel)] p-1">
      <Link href="/" className={tabClass(isHome)}>
        <span>🏆</span>
        <span>한눈에</span>
      </Link>
      {CATEGORIES.map((c) => {
        const active = activeCat === c.id;
        return (
          <Link key={c.id} href={`/c/${c.id}`} className={tabClass(active)}>
            <span className={active ? "" : "opacity-80"}>{c.emoji}</span>
            <span>{c.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
