import fs from "node:fs";
import path from "node:path";
import type { Category, ModelInfo, Snapshot } from "./types";

// 직전 스냅샷 대비 순위 변동을 계산한다(빌드 시점).
// data/<category>/snapshots/ 의 최신 2개를 비교.

const DATA_DIR = path.join(process.cwd(), "data");

export type RankStatus = "up" | "down" | "same" | "new";
export interface RankDelta {
  delta: number; // 변동 칸 수(절댓값)
  status: RankStatus;
}

function rankMap(models: ModelInfo[]): Record<string, number> {
  const sorted = [...models].sort((a, b) => b.score - a.score);
  const m: Record<string, number> = {};
  sorted.forEach((x, i) => (m[x.id] = i));
  return m;
}

export function getRankDeltas(category: Category): Record<string, RankDelta> {
  const dir = path.join(DATA_DIR, category, "snapshots");
  let files: string[] = [];
  try {
    files = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  } catch {
    return {};
  }
  if (files.length < 2) return {};
  const read = (f: string) =>
    JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8")) as Snapshot;

  const cur = rankMap(read(files[files.length - 1]).models);
  const prev = rankMap(read(files[files.length - 2]).models);

  const out: Record<string, RankDelta> = {};
  for (const id of Object.keys(cur)) {
    if (!(id in prev)) {
      out[id] = { delta: 0, status: "new" };
      continue;
    }
    const d = prev[id] - cur[id]; // +면 위로(랭크 숫자 감소)
    out[id] = { delta: Math.abs(d), status: d > 0 ? "up" : d < 0 ? "down" : "same" };
  }
  return out;
}
