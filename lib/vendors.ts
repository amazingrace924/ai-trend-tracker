// 벤더별 브랜드 컬러 + 대표 이모지(캐릭터) — 차트/카드/대시보드에서 일관되게 사용.
// 실데이터의 벤더명은 변형이 많아("ByteDance Seed", "Alibaba-ATH", "KlingAI") 부분 일치로 매칭한다.

const VENDOR_COLORS: Record<string, string> = {
  OpenAI: "#10a37f",
  Anthropic: "#d97757",
  Google: "#4285f4",
  DeepSeek: "#7c5cff",
  Meta: "#0668e1",
  Mistral: "#ff7000",
  xAI: "#1d9bf0",
  Alibaba: "#ff6a00",
  ByteDance: "#325ab4",
  Kling: "#00c2a8",
  Kuaishou: "#ff5000",
  fal: "#b14bff",
  "Black Forest": "#16a34a",
  Midjourney: "#3a86ff",
  Suno: "#e0245e",
  Udio: "#8b5cf6",
  ElevenLabs: "#111827",
  Runway: "#e11d48",
  Ideogram: "#f59e0b",
  Sourceful: "#0ea5e9",
  Cartesia: "#7c3aed",
  Inworld: "#06b6d4",
  PlayHT: "#22c55e",
  Wondera: "#ec4899",
  NVIDIA: "#76b900",
};

// 브랜드를 떠올리게 하는 대표 이모지(캐릭터). 없으면 머리글자로 대체.
const VENDOR_EMOJI: Record<string, string> = {
  DeepSeek: "🐋",
  Midjourney: "⛵",
  Suno: "🎵",
  Udio: "🎶",
  ElevenLabs: "🔊",
  Anthropic: "✴️",
  Meta: "♾️",
  xAI: "✖️",
  Mistral: "🌬️",
  Runway: "🛫",
  "Black Forest": "🌲",
  ByteDance: "🎬",
  Kling: "🎞️",
  Sourceful: "🌊",
  Cartesia: "🔉",
  Inworld: "🌍",
  PlayHT: "▶️",
  NVIDIA: "🟩",
};

function matchKey(map: Record<string, string>, vendor: string): string | undefined {
  const v = vendor.toLowerCase();
  for (const key of Object.keys(map)) {
    if (v.includes(key.toLowerCase())) return map[key];
  }
  return undefined;
}

export function vendorColor(vendor: string): string {
  return matchKey(VENDOR_COLORS, vendor) ?? "#6c8cff";
}

export function vendorEmoji(vendor: string): string | null {
  return matchKey(VENDOR_EMOJI, vendor) ?? null;
}

export function vendorInitial(vendor: string): string {
  const c = vendor.replace(/[^A-Za-z0-9]/g, "").charAt(0) || vendor.charAt(0) || "?";
  return c.toUpperCase();
}
