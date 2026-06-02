// LMArena(구 LMSYS Chatbot Arena) Elo 랭킹 = 실사용자 "민심" 지표.
// 공식 API가 없어 커뮤니티 일일 JSON을 사용한다(wulong.dev REST).
// 반환: 모델명(소문자) → { elo, votes } 맵. AA 데이터와 이름으로 느슨하게 매칭한다.

interface ArenaRow {
  model?: string;
  vendor?: string;
  score?: number;
  ci?: string | number;
  votes?: number;
}

interface ArenaResponse {
  models?: ArenaRow[];
  data?: ArenaRow[];
}

export interface ArenaElo {
  elo: number;
  votes: number;
}

const ARENA_URL =
  process.env.ARENA_URL ??
  "https://api.wulong.dev/arena-ai-leaderboards/v1/leaderboard?name=text";

function normalize(name: string): string {
  return name.toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9.-]/g, "");
}

export async function fetchArena(): Promise<Record<string, ArenaElo>> {
  try {
    const res = await fetch(ARENA_URL);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const json = (await res.json()) as ArenaResponse | ArenaRow[];
    const rows = Array.isArray(json) ? json : (json.models ?? json.data ?? []);
    const map: Record<string, ArenaElo> = {};
    for (const r of rows) {
      if (!r.model || typeof r.score !== "number") continue;
      map[normalize(r.model)] = { elo: r.score, votes: r.votes ?? 0 };
    }
    return map;
  } catch (e) {
    console.warn(`[Arena] 수집 실패 → Elo 생략: ${(e as Error).message}`);
    return {};
  }
}

// AA 모델명에 Arena Elo를 느슨하게 붙인다(정확 일치 → 부분 포함 순).
export function matchElo(
  modelName: string,
  arena: Record<string, ArenaElo>,
): ArenaElo | undefined {
  const key = normalize(modelName);
  if (arena[key]) return arena[key];
  const hit = Object.keys(arena).find(
    (k) => k.includes(key) || key.includes(k),
  );
  return hit ? arena[hit] : undefined;
}
