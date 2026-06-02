// 벤더별 브랜드 컬러 — 차트/카드에서 일관되게 사용.
export const VENDOR_COLORS: Record<string, string> = {
  OpenAI: "#10a37f",
  Anthropic: "#d97757",
  Google: "#4285f4",
  DeepSeek: "#7c5cff",
  Meta: "#0668e1",
  Mistral: "#ff7000",
  xAI: "#888888",
  Alibaba: "#ff6a00",
};

export function vendorColor(vendor: string): string {
  return VENDOR_COLORS[vendor] ?? "#6c8cff";
}
