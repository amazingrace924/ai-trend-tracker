import type { BuildModel } from "./deriveStrengths";
import type { Category } from "./types";

// Artificial Analysis 미디어 Arena(Elo) 엔드포인트에서 영상·이미지·음성 모델을 가져온다.
// 공식 문서 확인: id, name, slug, model_creator, elo, rank, ci95, appearances, release_date.
// 음악(Suno/Udio)은 깔끔한 API 소스가 없어 여기서 처리하지 않는다(시드 유지).
// 키/엔드포인트 미검증 시 빈 배열 → 시드 픽스처 보존.

const AA_BASE =
  process.env.AA_API_BASE ?? "https://artificialanalysis.ai/api/v2";

const ENDPOINT: Partial<Record<Category, string>> = {
  video: "data/media/text-to-video",
  image: "data/media/text-to-image",
  voice: "data/media/text-to-speech",
};

interface RawMediaRow {
  id?: string;
  slug?: string;
  name?: string;
  model_creator?: { name?: string } | string;
  elo?: number;
  rank?: number;
  appearances?: number;
  release_date?: string;
  [k: string]: unknown;
}

function creatorName(r: RawMediaRow): string {
  if (typeof r.model_creator === "object" && r.model_creator?.name)
    return r.model_creator.name;
  if (typeof r.model_creator === "string") return r.model_creator;
  return "Unknown";
}

function toBuildModel(r: RawMediaRow, category: Category): BuildModel {
  const score = Math.round(r.elo ?? 0);
  const vendor = creatorName(r);
  const name = r.name ?? "Unknown";
  const id = `${category}-${(r.slug ?? r.id ?? name).toLowerCase().replace(/\s+/g, "-")}`;
  const votes = r.appearances ?? 0;

  return {
    base: {
      id,
      name,
      vendor,
      category,
      license: "proprietary",
      releaseDate: r.release_date,
      score,
      scoreLabel: "Arena Elo",
      highlights: [
        { label: "Elo", value: String(score) },
        { label: "순위", value: r.rank ? `#${r.rank}` : "—" },
        { label: "투표수", value: votes ? votes.toLocaleString() : "—" },
        { label: "제작사", value: vendor },
      ],
      stats: [
        { label: "Arena Elo", value: String(score) },
        { label: "순위", value: r.rank ? `#${r.rank}` : "—" },
        { label: "투표 수", value: votes ? votes.toLocaleString() : "—" },
        { label: "출시일", value: r.release_date ?? "—" },
        { label: "제작사", value: vendor },
      ],
    },
    raw: { category, score, license: "proprietary" },
  };
}

export async function fetchMedia(category: Category): Promise<BuildModel[]> {
  const ep = ENDPOINT[category];
  const key = process.env.AA_API_KEY;
  if (!ep || !key) {
    if (category !== "music")
      console.warn(`[AA] ${category} 라이브 수집 건너뜀(키/엔드포인트 없음 → 시드 유지).`);
    return [];
  }
  try {
    const res = await fetch(`${AA_BASE}/${ep}`, {
      headers: { "x-api-key": key },
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const json = (await res.json()) as { data?: RawMediaRow[] } | RawMediaRow[];
    const rows = Array.isArray(json) ? json : (json.data ?? []);
    return rows
      .map((r) => toBuildModel(r, category))
      .filter((b) => b.base.score > 0)
      .sort((a, b) => b.base.score - a.base.score)
      .slice(0, 10);
  } catch (e) {
    console.warn(`[AA] ${category} 수집 실패 → 시드 유지: ${(e as Error).message}`);
    return [];
  }
}
