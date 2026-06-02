"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import type { Category } from "@/lib/types";

function hrefFor(id: Category): string {
  return id === "llm" ? "/" : `/c/${id}`;
}

export default function CategoryTabs() {
  const pathname = usePathname();
  const active: Category = pathname.startsWith("/c/")
    ? (pathname.split("/")[2] as Category)
    : "llm";

  return (
    <nav className="flex gap-1.5 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--panel)] p-1">
      {CATEGORIES.map((c) => {
        const isActive = c.id === active;
        return (
          <Link
            key={c.id}
            href={hrefFor(c.id)}
            className={
              "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition " +
              (isActive
                ? "grad-bar text-[var(--on-accent)] shadow-[var(--shadow)]"
                : "text-[var(--muted)] hover:bg-[var(--panel2)] hover:text-[var(--text)]")
            }
          >
            <span className={isActive ? "" : "opacity-80"}>{c.emoji}</span>
            <span>{c.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
