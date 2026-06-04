// 헤더 로고 — 파비콘(app/icon.svg)과 동일한 마크.
// 브랜드 그라데이션 배경 + 순위 경주 막대 + 체커기.
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logoGrad" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff2d55" />
          <stop offset="1" stopColor="#ff7a3d" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill="url(#logoGrad)" />
      <rect x="11" y="37" width="12" height="16" rx="2.5" fill="#ffffff" fillOpacity="0.82" />
      <rect x="26" y="29" width="12" height="24" rx="2.5" fill="#ffffff" fillOpacity="0.92" />
      <rect x="41" y="22" width="12" height="31" rx="2.5" fill="#ffffff" />
      <rect x="45.4" y="8" width="2.2" height="17" rx="1.1" fill="#ffffff" />
      <rect x="47.6" y="8" width="6" height="6" fill="#ffffff" />
      <rect x="53.6" y="14" width="6" height="6" fill="#ffffff" />
    </svg>
  );
}
