import fs from "node:fs";
import path from "node:path";
import { fetchLLM } from "../lib/fetchArtificialAnalysis";
import { fetchMedia } from "../lib/fetchMedia";
import { fetchArena, matchElo } from "../lib/fetchArena";
import { fetchNews } from "../lib/fetchNews";
import { deriveStrengths, type BuildModel } from "../lib/deriveStrengths";
import { CATEGORY_IDS, getCategoryMeta } from "../lib/categories";
import type { Category, ModelInfo, RaceData, RaceFrame, Snapshot } from "../lib/types";

// 매일 GitHub Actions가 실행하는 데이터 수집 엔트리.
//  - LLM: Artificial Analysis llms 엔드포인트 (+ LMArena 사람 투표 Elo 보강)
//  - 영상/이미지/음성: AA 미디어 Arena(Elo) 엔드포인트
//  - 음악: 라이브 소스 없음 → 시드 보존
// 라이브 데이터가 비면(키 없음/실패) 해당 카테고리 시드를 보존한다.

const DATA_DIR = path.join(process.cwd(), "data");
const TOP_N = 8;

// 의존성 없이 .env를 읽어 process.env에 주입(이미 설정된 키는 보존).
function loadDotenv() {
  const p = path.join(process.cwd(), ".env");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf-8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1);
    if (!(k in process.env)) process.env[k] = v;
  }
}

function today(): string {
  return process.env.BUILD_DATE ?? new Date().toISOString().slice(0, 10);
}

async function fetchCategory(cat: Category): Promise<BuildModel[]> {
  return cat === "llm" ? fetchLLM() : fetchMedia(cat);
}

// LLM에 LMArena 사람 투표 Elo를 best-effort로 붙인다(이름 느슨 매칭, 키 불필요).
async function enrichLLMWithArena(builds: BuildModel[]) {
  try {
    const arena = await fetchArena();
    if (Object.keys(arena).length === 0) return;
    let matched = 0;
    for (const b of builds) {
      const hit = matchElo(b.base.name, arena);
      if (hit) {
        b.base.stats.push({ label: "사람 투표 Elo", value: String(hit.elo) });
        matched++;
      }
    }
    console.log(`[build-data] llm: LMArena Elo ${matched}/${builds.length}개 매칭`);
  } catch (e) {
    console.warn(`[build-data] LMArena 보강 생략: ${(e as Error).message}`);
  }
}

function finalize(builds: BuildModel[]): ModelInfo[] {
  const raws = builds.map((b) => b.raw);
  return builds
    .map((b) => ({ ...b.base, strengths: deriveStrengths(b.raw, raws) }))
    .sort((a, b) => b.score - a.score);
}

function rebuildRace(cat: Category): RaceData {
  const snapDir = path.join(DATA_DIR, cat, "snapshots");
  const files = fs.existsSync(snapDir)
    ? fs.readdirSync(snapDir).filter((f) => f.endsWith(".json")).sort()
    : [];
  const frames: RaceFrame[] = files.map((f) => {
    const snap = JSON.parse(
      fs.readFileSync(path.join(snapDir, f), "utf-8"),
    ) as Snapshot;
    const entries = [...snap.models]
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_N)
      .map((m) => ({ id: m.id, name: m.name, vendor: m.vendor, value: m.score }));
    return { date: snap.date, entries };
  });
  return { category: cat, metricLabel: getCategoryMeta(cat).scoreLabel, frames };
}

async function main() {
  loadDotenv();
  console.log(process.env.AA_API_KEY ? "[build-data] AA_API_KEY 감지됨" : "[build-data] AA 키 없음 — 라이브는 뉴스만");

  for (const cat of CATEGORY_IDS) {
    const builds = await fetchCategory(cat);
    if (builds.length === 0) {
      console.log(`[build-data] ${cat}: 라이브 0건 → 시드 보존`);
      continue;
    }
    if (cat === "llm") await enrichLLMWithArena(builds);

    const models = finalize(builds);
    const date = today();
    const snap: Snapshot = {
      category: cat,
      date,
      updatedAt: new Date().toISOString(),
      models,
    };
    const dir = path.join(DATA_DIR, cat);
    fs.mkdirSync(path.join(dir, "snapshots"), { recursive: true });
    fs.writeFileSync(path.join(dir, "current.json"), JSON.stringify(snap, null, 2));
    fs.writeFileSync(
      path.join(dir, "snapshots", `${date}.json`),
      JSON.stringify(snap, null, 2),
    );
    fs.writeFileSync(path.join(dir, "race.json"), JSON.stringify(rebuildRace(cat), null, 2));
    console.log(`[build-data] ${cat}: ${models.length}개 모델 갱신`);
  }

  const news = await fetchNews();
  if (news.length > 0) {
    fs.writeFileSync(path.join(DATA_DIR, "news.json"), JSON.stringify(news, null, 2));
    console.log(`[build-data] 뉴스 ${news.length}건 갱신`);
  } else {
    console.log("[build-data] 뉴스 0건 → 기존 news.json 보존");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
