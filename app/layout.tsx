import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import CategoryTabs from "@/components/CategoryTabs";
import ThemeToggle from "@/components/ThemeToggle";
import { BeginnerProvider, BeginnerToggle } from "@/components/BeginnerMode";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "AI 모델 대세 트래커",
  description:
    "지금 어떤 AI가 대세인지 — LLM·영상·이미지·음악·음성을 성능 경주로 매일 업데이트.",
};

// FOUC 방지: 페인트 전에 테마/초보자 모드를 data 속성으로 확정한다.
const bootInit = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;document.documentElement.dataset.beginner=localStorage.getItem('beginner')==='on'?'on':'off';}catch(e){document.documentElement.dataset.theme='dark';}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ko"
      className={`${inter.variable} ${display.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootInit }} />
      </head>
      <body className="min-h-screen">
        <BeginnerProvider>
          <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur-md">
            <div className="checker h-1.5 w-full" />
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
              <Link href="/" className="group flex items-center gap-2">
                <span className="text-xl transition-transform group-hover:-rotate-12">🏁</span>
                <span className="font-display text-base font-bold tracking-tight">
                  AI<span className="grad-text">대세</span>트래커
                </span>
              </Link>
              <div className="order-3 w-full sm:order-2 sm:w-auto sm:flex-1">
                <CategoryTabs />
              </div>
              <div className="order-2 ml-auto flex items-center gap-1.5 sm:order-3">
                <Link
                  href="/guide"
                  className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--panel2)] hover:text-[var(--text)]"
                >
                  가이드
                </Link>
                <Link
                  href="/news"
                  className="hidden rounded-lg px-2.5 py-1.5 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--panel2)] hover:text-[var(--text)] sm:block"
                >
                  소식
                </Link>
                <BeginnerToggle />
                <ThemeToggle />
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">{children}</main>
          <footer className="mt-8 border-t border-[var(--border)]">
            <div className="checker h-1.5 w-full" />
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-8 text-xs text-[var(--muted)]">
              <span>데이터: Artificial Analysis · LMArena · 공식 블로그 RSS · 매일 자동 갱신</span>
              <Link href="/guide" className="font-semibold text-[var(--accent)] hover:underline">
                처음이신가요? 가이드 보기 →
              </Link>
            </div>
          </footer>
        </BeginnerProvider>
      </body>
    </html>
  );
}
