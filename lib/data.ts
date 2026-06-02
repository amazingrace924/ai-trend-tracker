import fs from "node:fs";
import path from "node:path";
import type { Category, ModelInfo, NewsItem, RaceData, Snapshot } from "./types";
import { CATEGORY_IDS, getCategoryMeta } from "./categories";

// 서버(빌드) 측에서 data/<category>/*.json을 읽어 페이지에 공급한다.
// 정적 익스포트 시 빌드 시점에 1회 읽힌다.

const DATA_DIR = path.join(process.cwd(), "data");

function readJson<T>(rel: string, fallback: T): T {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, rel), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getCurrent(category: Category): Snapshot {
  return readJson<Snapshot>(`${category}/current.json`, {
    category,
    date: "",
    updatedAt: "",
    models: [],
  });
}

export function getRace(category: Category): RaceData {
  return readJson<RaceData>(`${category}/race.json`, {
    category,
    metricLabel: getCategoryMeta(category).scoreLabel,
    frames: [],
  });
}

export function getNews(): NewsItem[] {
  return readJson<NewsItem[]>("news.json", []);
}

// 전 카테고리 모델을 한 번에(상세 페이지 generateStaticParams / 전역 조회용).
export function getAllModels(): ModelInfo[] {
  return CATEGORY_IDS.flatMap((c) => getCurrent(c).models);
}

export function getModel(id: string): ModelInfo | undefined {
  return getAllModels().find((m) => m.id === id);
}
