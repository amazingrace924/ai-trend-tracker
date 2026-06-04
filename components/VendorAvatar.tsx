"use client";

import { useState } from "react";
import { vendorColor, vendorDomain, vendorEmoji, vendorInitial } from "@/lib/vendors";

// 벤더 아바타 — 공식 사이트의 진짜 로고(파비콘)를 불러오고,
// 실패하거나 도메인이 없으면 대표 이모지/머리글자로 폴백한다.
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
  const domain = vendorDomain(vendor);
  const [err, setErr] = useState(false);
  const showLogo = domain && !err;

  return (
    <span
      className={"inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full " + className}
      style={{
        width: size,
        height: size,
        background: "#ffffff",
        boxShadow: `inset 0 0 0 2px ${color}`,
      }}
      title={vendor}
    >
      {showLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
          alt={vendor}
          width={Math.round(size * 0.72)}
          height={Math.round(size * 0.72)}
          loading="lazy"
          onError={() => setErr(true)}
          style={{ width: size * 0.72, height: size * 0.72, objectFit: "contain" }}
        />
      ) : (
        <span
          className="font-bold leading-none"
          style={{ color, fontSize: vendorEmoji(vendor) ? size * 0.56 : size * 0.5 }}
        >
          {vendorEmoji(vendor) ?? vendorInitial(vendor)}
        </span>
      )}
    </span>
  );
}
