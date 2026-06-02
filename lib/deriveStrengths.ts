import type { Category, ModelInfo } from "./types";

// 수집/시드 단계에서 강점 산출 전의 모델 + 원시 신호를 함께 나르는 빌드용 타입.
export interface BuildModel {
  base: Omit<ModelInfo, "strengths">;
  raw: RawSignals;
}

// 강점 태그를 코호트(같은 카테고리 전체) 대비 규칙으로 산출한다.
// 시드/수집 단계에서 원시 수치(RawSignals)를 갖고 호출하며, 결과를 ModelInfo.strengths에 채운다.
// ModelInfo 자체는 표시용(문자열)이라, 판정은 이 원시 신호로 한다.

export interface RawSignals {
  category: Category;
  score: number;
  price?: number; // 낮을수록 좋음(카테고리별 단위 상이)
  license: "proprietary" | "open";
  // LLM
  codingIndex?: number;
  gpqa?: number;
  outputSpeed?: number;
  contextWindow?: number;
  // 미디어
  hasAudio?: boolean;
  resolution?: number; // 세로 픽셀
  durationSec?: number;
  realtime?: boolean;
  languages?: number;
  editing?: boolean;
}

function pct(values: number[], p: number): number {
  const s = [...values].sort((a, b) => a - b);
  return s[Math.floor((s.length - 1) * p)];
}

export function deriveStrengths(m: RawSignals, cohort: RawSignals[]): string[] {
  const tags: string[] = [];
  const scores = cohort.map((c) => c.score);
  const isTop = m.score >= Math.max(...scores);

  // 공통: 1위 / 가성비 / 오픈
  if (isTop) tags.push(m.category === "llm" ? "종합 1위" : "품질 1위");

  const prices = cohort.map((c) => c.price).filter((v): v is number => v != null);
  if (m.price != null && prices.length > 1 && m.price <= pct(prices, 0.2))
    tags.push("가성비");

  if (m.license === "open") tags.push("오픈");

  // 미디어는 세부 속성이 없을 수 있어, 점수 상위권에 공통 태그를 준다.
  if (m.category !== "llm" && !isTop && m.score >= pct(scores, 0.55))
    tags.push("상위권");

  // 카테고리별 보강
  if (m.category === "llm") {
    const coding = cohort.map((c) => c.codingIndex ?? 0);
    const gpqa = cohort.map((c) => c.gpqa ?? 0);
    const speed = cohort.map((c) => c.outputSpeed ?? 0);
    if ((m.codingIndex ?? 0) >= pct(coding, 0.8)) tags.push("코딩 강자");
    if ((m.gpqa ?? 0) >= pct(gpqa, 0.8)) tags.push("고난도 추론");
    if ((m.outputSpeed ?? 0) >= pct(speed, 0.8)) tags.push("초고속");
    if ((m.contextWindow ?? 0) >= 1_000_000) tags.push("초장문 컨텍스트");
  } else if (m.category === "video") {
    if (m.hasAudio) tags.push("오디오 생성");
    if ((m.resolution ?? 0) >= 1080) tags.push("고해상도");
    if ((m.durationSec ?? 0) >= 10) tags.push("긴 영상");
  } else if (m.category === "image") {
    if (m.editing) tags.push("편집 지원");
    if ((m.resolution ?? 0) >= 2048) tags.push("초고해상도");
  } else if (m.category === "voice") {
    if (m.realtime) tags.push("실시간");
    if ((m.languages ?? 0) >= 20) tags.push("다국어");
  } else if (m.category === "music") {
    if ((m.durationSec ?? 0) >= 240) tags.push("장곡 지원");
  }

  return tags;
}

// 강점 태그별 한 줄 설명(상세 페이지 캡션용).
export const STRENGTH_DESC: Record<string, string> = {
  "종합 1위": "Intelligence Index 종합 1위",
  "품질 1위": "Arena Elo(사람 투표) 1위",
  상위권: "Arena Elo 상위권(사람 선호 높음)",
  가성비: "동일 카테고리 대비 가격이 저렴한 편",
  오픈: "오픈 가중치/라이선스",
  "코딩 강자": "코딩 벤치마크 상위권",
  "고난도 추론": "GPQA 등 박사급 추론에서 두각",
  초고속: "출력 토큰/초가 매우 빠름",
  "초장문 컨텍스트": "100만 토큰 이상 컨텍스트",
  "오디오 생성": "영상에 사운드까지 동시 생성",
  고해상도: "1080p 이상 출력",
  "긴 영상": "10초 이상 클립 생성",
  "편집 지원": "이미지 인페인팅/편집 가능",
  초고해상도: "2K 이상 해상도",
  실시간: "스트리밍/실시간 합성",
  다국어: "20개 이상 언어 지원",
  "장곡 지원": "4분 이상 곡 생성",
};
