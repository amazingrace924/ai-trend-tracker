import type { Category } from "./types";

// 카테고리 메타 — 탭/라우팅/라벨/지표명의 단일 출처.
export interface CategoryMeta {
  id: Category;
  label: string; // 탭 표시명
  emoji: string;
  scoreLabel: string; // 랭킹 지표 이름
  blurb: string; // 카테고리 설명 한 줄
  explainer: string; // 지표를 쉬운 말로(항상 노출)
  analogy: string; // 초보자 모드용 비유
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "llm",
    label: "LLM",
    emoji: "🧠",
    scoreLabel: "Intelligence Index",
    blurb: "독립 벤치마크로 측정한 종합 지능 지수 기준.",
    explainer: "여러 시험을 합친 종합 점수예요. 높을수록 똑똑해요.",
    analogy: "학교로 치면 '전 과목 평균 성적'이에요. 60점대면 세계 최상위권.",
  },
  {
    id: "video",
    label: "영상",
    emoji: "🎬",
    scoreLabel: "Arena Elo",
    blurb: "사람 투표(Video Arena) Elo 기준 — Veo·Sora·Kling·Seedance 등.",
    explainer: "사람들이 직접 비교 투표한 점수예요. 높을수록 더 선호돼요.",
    analogy: "체스 실력 매기듯, 좋은 영상이 자주 뽑힐수록 점수가 올라가요.",
  },
  {
    id: "image",
    label: "이미지",
    emoji: "🖼️",
    scoreLabel: "Arena Elo",
    blurb: "사람 투표 Elo 기준 — Midjourney·DALL·E·Imagen·FLUX 등.",
    explainer: "사람들이 직접 비교 투표한 점수예요. 높을수록 더 선호돼요.",
    analogy: "두 그림 중 '어느 게 더 좋아?'를 사람이 고른 결과를 모은 거예요.",
  },
  {
    id: "music",
    label: "음악",
    emoji: "🎵",
    scoreLabel: "Arena Elo",
    blurb: "음악 생성 — Suno·Udio 등 (초기 큐레이션 데이터).",
    explainer: "사람 선호 기반 점수예요. (음악은 초기 큐레이션 데이터)",
    analogy: "어느 곡이 더 듣기 좋은지 사람이 고른 결과로 매겨요.",
  },
  {
    id: "voice",
    label: "음성",
    emoji: "🗣️",
    scoreLabel: "Arena Elo",
    blurb: "텍스트→음성(TTS) — ElevenLabs·OpenAI·Google 등.",
    explainer: "사람들이 더 자연스럽다고 고른 정도예요. 높을수록 좋아요.",
    analogy: "어느 목소리가 더 사람 같은지 투표한 결과예요.",
  },
];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

export function getCategoryMeta(id: Category): CategoryMeta {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}

export function isCategory(v: string): v is Category {
  return CATEGORY_IDS.includes(v as Category);
}
