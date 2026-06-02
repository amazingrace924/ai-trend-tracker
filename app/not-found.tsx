import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="font-display text-6xl font-bold grad-text">404</div>
      <p className="text-lg font-bold">트랙을 벗어났어요 🏁</p>
      <p className="text-sm text-[var(--muted)]">찾는 페이지가 없습니다.</p>
      <Link
        href="/"
        className="grad-bar rounded-xl px-4 py-2 text-sm font-bold text-[var(--on-accent)] transition hover:opacity-90"
      >
        ▶ 대세 경주로 돌아가기
      </Link>
    </div>
  );
}
