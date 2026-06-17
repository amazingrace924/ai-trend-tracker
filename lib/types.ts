// 사이트 전체에서 공유하는 데이터 타입.
// build-data.ts / seed-fixtures.ts가 이 형태로 data/<category>/*.json을 생성하고,
// 앱은 그 JSON을 직접 읽는다. 지표가 카테고리마다 다르므로(LLM=Intelligence Index,
// 미디어=Arena Elo) 모델은 지표 중립적으로 일반화한다.

export type Category = "llm" | "video" | "image" | "music" | "voice";

// 표시용으로 이미 가공된 한 줄 수치(라벨 + 문자열 값).
export interface StatRow {
  label: string;
  value: string;
}

export interface ModelInfo {
  id: string; // 카테고리 접두사로 전역 유일 (예: "video-veo-3-1")
  name: string;
  vendor: string;
  category: Category;
  license: "proprietary" | "open";
  releaseDate?: string; // YYYY-MM-DD
  score: number; // 랭킹 기준값 (LLM=Intelligence Index, 미디어=Elo)
  scoreLabel: string; // "Intelligence Index" | "Arena Elo"
  strengths: string[]; // deriveStrengths로 산출한 강점 태그
  highlights: StatRow[]; // 카드용 컴팩트 수치(보통 4칸)
  stats: StatRow[]; // 상세 페이지용 전체 수치
}

export interface Snapshot {
  category: Category;
  date: string; // YYYY-MM-DD
  updatedAt: string; // ISO 타임스탬프
  models: ModelInfo[];
}

// 바 차트 레이스용 시계열. 각 프레임은 특정 날짜의 순위 한 장면.
export interface RaceEntry {
  id: string;
  name: string;
  vendor: string;
  value: number; // = ModelInfo.score
}
export interface RaceFrame {
  date: string;
  entries: RaceEntry[];
}
export interface RaceData {
  category: Category;
  metricLabel: string; // 예: "Intelligence Index" | "Arena Elo"
  frames: RaceFrame[];
}

export interface NewsItem {
  id: string;
  title: string; // 원문(영어) 제목
  titleKo?: string; // 빌드 타임 자동 번역된 한국어 제목(실패 시 미설정)
  url: string;
  source: string;
  date: string; // ISO
  summary?: string; // 원문(영어) 요약
  summaryKo?: string; // 자동 번역된 한국어 요약
}
