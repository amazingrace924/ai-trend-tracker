import type { BuildModel } from "./deriveStrengths";
import type { StatRow } from "./types";
import { fmtContext, fmtPrice } from "./format";

// Artificial Analysis 무료 API에서 LLM 메트릭을 가져온다(category: "llm").
// 인증: x-api-key (하루 1,000회). 키는 빌드 타임 환경변수로만 사용.
// 엔드포인트/필드명은 공식 문서(api/v2)로 검증 완료:
//  - GET /api/v2/data/llms/models, 응답은 { data: [...] }
//  - 가격은 pricing 객체 안에 중첩(price_1m_input_tokens / price_1m_output_tokens)
//  - context_window는 응답에 없음 → 있으면 표시, 없으면 수학 지수로 대체

const AA_BASE =
  process.env.AA_API_BASE ?? "https://artificialanalysis.ai/api/v2";

interface RawAAModel {
  id?: string;
  slug?: string;
  name?: string;
  release_date?: string;
  model_creator?: { name?: string } | string;
  // 지표는 evaluations 객체에 중첩(공식 응답 확인). gpqa·mmlu_pro는 0~1 비율.
  evaluations?: {
    artificial_analysis_intelligence_index?: number;
    artificial_analysis_coding_index?: number;
    artificial_analysis_math_index?: number;
    mmlu_pro?: number;
    gpqa?: number;
    [k: string]: number | null | undefined;
  };
  median_output_tokens_per_second?: number;
  median_time_to_first_token_seconds?: number;
  pricing?: {
    price_1m_input_tokens?: number;
    price_1m_output_tokens?: number;
    price_1m_blended_3_to_1?: number;
  };
  context_window?: number;
  [k: string]: unknown;
}

const num = (v: unknown, f = 0): number =>
  typeof v === "number" && Number.isFinite(v) ? v : f;

// 0~1 비율을 백분율 정수로(예: 0.611 → 61).
const pctOf = (v: unknown): number => Math.round(num(v) * 100);

function creatorName(r: RawAAModel): string {
  if (typeof r.model_creator === "object" && r.model_creator?.name)
    return r.model_creator.name;
  if (typeof r.model_creator === "string") return r.model_creator;
  return "Unknown";
}

function toBuildModel(r: RawAAModel): BuildModel {
  const ev = r.evaluations ?? {};
  const score = Math.round(num(ev.artificial_analysis_intelligence_index) * 10) / 10;
  const coding = Math.round(num(ev.artificial_analysis_coding_index));
  const math = Math.round(num(ev.artificial_analysis_math_index));
  const gpqa = pctOf(ev.gpqa);
  const mmlu = pctOf(ev.mmlu_pro);
  const speed = Math.round(num(r.median_output_tokens_per_second));
  const ttft = Math.round(num(r.median_time_to_first_token_seconds) * 100) / 100;
  const pIn = num(r.pricing?.price_1m_input_tokens);
  const pOut = num(r.pricing?.price_1m_output_tokens);
  const ctx = num(r.context_window);
  const vendor = creatorName(r);
  const id =
    r.slug ?? r.id ?? (r.name ?? "model").toLowerCase().replace(/\s+/g, "-");

  // 카드 4번째 칸: 추론(GPQA) → 컨텍스트 → 수학 순으로 값이 있는 것을 쓴다.
  const fourth: StatRow =
    gpqa > 0
      ? { label: "추론", value: `${gpqa}%` }
      : ctx > 0
        ? { label: "컨텍스트", value: fmtContext(ctx) }
        : { label: "수학", value: math > 0 ? String(math) : "—" };

  // 값이 있는 지표만 표시(빈/0 값은 생략).
  const stats: StatRow[] = [{ label: "Intelligence Index", value: String(score) }];
  if (coding > 0) stats.push({ label: "코딩 지수", value: String(coding) });
  if (math > 0) stats.push({ label: "수학 지수", value: String(math) });
  if (gpqa > 0) stats.push({ label: "GPQA Diamond", value: `${gpqa}%` });
  if (mmlu > 0) stats.push({ label: "MMLU-Pro", value: `${mmlu}%` });
  if (speed > 0) stats.push({ label: "출력 속도", value: `${speed} tok/s` });
  if (ttft > 0) stats.push({ label: "첫 토큰 지연", value: `${ttft}s` });
  stats.push({ label: "입력 가격(1M)", value: fmtPrice(pIn) });
  stats.push({ label: "출력 가격(1M)", value: fmtPrice(pOut) });
  if (ctx > 0) stats.push({ label: "컨텍스트", value: `${fmtContext(ctx)} 토큰` });

  return {
    base: {
      id,
      name: r.name ?? "Unknown",
      vendor,
      category: "llm",
      license: "proprietary",
      releaseDate: r.release_date,
      score,
      scoreLabel: "Intelligence Index",
      highlights: [
        { label: "코딩", value: coding > 0 ? String(coding) : "—" },
        { label: "속도", value: speed > 0 ? `${speed}/s` : "—" },
        { label: "출력가", value: fmtPrice(pOut) },
        fourth,
      ],
      stats,
    },
    raw: {
      category: "llm",
      score,
      price: pOut,
      license: "proprietary",
      codingIndex: coding,
      gpqa,
      outputSpeed: speed,
      contextWindow: ctx,
    },
  };
}

export async function fetchLLM(): Promise<BuildModel[]> {
  const key = process.env.AA_API_KEY;
  if (!key) {
    console.warn("[AA] AA_API_KEY 없음 → LLM 라이브 수집 건너뜀(시드 유지).");
    return [];
  }
  const res = await fetch(`${AA_BASE}/data/llms/models`, {
    headers: { "x-api-key": key },
  });
  if (!res.ok) throw new Error(`[AA] LLM 응답 오류 ${res.status}`);
  const json = (await res.json()) as { data?: RawAAModel[] } | RawAAModel[];
  const rows = Array.isArray(json) ? json : (json.data ?? []);
  return rows
    .map(toBuildModel)
    .filter((b) => b.base.score > 0)
    .sort((a, b) => b.base.score - a.base.score)
    .slice(0, 12); // 상위 12개만(레이스/카드 적정 규모)
}
