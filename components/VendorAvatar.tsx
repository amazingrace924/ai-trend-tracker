import { vendorColor, vendorEmoji, vendorInitial } from "@/lib/vendors";

// 벤더 "캐릭터" 아바타 — 브랜드 컬러 링 + 대표 이모지(없으면 머리글자).
// 흰/패널 배경이라 그라데이션 막대 위에서도 잘 보인다.
export default function VendorAvatar({
  vendor,
  size = 24,
  className = "",
}: {
  vendor: string;
  size?: number;
  className?: string;
}) {
  const color = vendorColor(vendor);
  const emoji = vendorEmoji(vendor);
  return (
    <span
      className={"inline-flex shrink-0 select-none items-center justify-center rounded-full font-bold leading-none " + className}
      style={{
        width: size,
        height: size,
        background: "var(--panel)",
        boxShadow: `inset 0 0 0 2px ${color}`,
        color,
        fontSize: emoji ? size * 0.56 : size * 0.5,
      }}
      title={vendor}
      aria-hidden="true"
    >
      {emoji ?? vendorInitial(vendor)}
    </span>
  );
}
