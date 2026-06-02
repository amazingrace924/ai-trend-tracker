import fs from "node:fs";
import path from "node:path";
import { deriveStrengths, type RawSignals } from "../lib/deriveStrengths";
import { getCategoryMeta } from "../lib/categories";
import { fmtContext, fmtPrice } from "../lib/format";
import type {
  Category,
  ModelInfo,
  RaceData,
  RaceFrame,
  Snapshot,
  StatRow,
} from "../lib/types";

// API 키 없이 5개 카테고리 UI를 개발/시연하기 위한 샘플 데이터 생성기.
// 2026-06 시점의 대략적 실제 순위를 반영하되, 경주가 흥미롭도록 순위 교차를 넣었다.
// 실데이터가 들어오면 scripts/build-data.ts가 이 파일들을 덮어쓴다.

const DATA_DIR = path.join(process.cwd(), "data");
const DAYS = 12;

// 결정적 wobble(날짜·모델별 sin) — Math.random 없이 재현 가능.
function wobble(idx: number, day: number, amp: number): number {
  return Math.sin((idx + 1) * 1.7 + day * 0.9) * amp;
}
function round(n: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}
function dateForDay(day: number): string {
  const base = Date.UTC(2026, 5, 2); // 2026-06-02
  return new Date(base - (DAYS - 1 - day) * 86400000)
    .toISOString()
    .slice(0, 10);
}
const OX = (b: boolean) => (b ? "O" : "X");
const LIC = (l: "open" | "proprietary") => (l === "open" ? "오픈" : "독점");

interface CatConfig<S extends { base: number; trend: number }> {
  category: Category;
  wobbleAmp: number;
  decimals: number;
  seeds: S[];
  meta(s: S): {
    id: string;
    name: string;
    vendor: string;
    license: "open" | "proprietary";
    releaseDate: string;
  };
  toRaw(s: S, score: number): RawSignals;
  toHighlights(s: S, score: number): StatRow[];
  toStats(s: S, score: number): StatRow[];
}

function buildCategory<S extends { base: number; trend: number }>(
  cfg: CatConfig<S>,
) {
  const dir = path.join(DATA_DIR, cfg.category);
  fs.mkdirSync(path.join(dir, "snapshots"), { recursive: true });
  const scoreLabel = getCategoryMeta(cfg.category).scoreLabel;

  const frames: RaceFrame[] = [];
  let last: Snapshot | null = null;

  for (let day = 0; day < DAYS; day++) {
    const scored = cfg.seeds.map((s, i) => ({
      s,
      score: round(s.base + s.trend * day + wobble(i, day, cfg.wobbleAmp), cfg.decimals),
    }));
    const raws = scored.map(({ s, score }) => cfg.toRaw(s, score));

    const models: ModelInfo[] = scored.map(({ s, score }, i) => {
      const m = cfg.meta(s);
      return {
        ...m,
        category: cfg.category,
        score,
        scoreLabel,
        strengths: deriveStrengths(raws[i], raws),
        highlights: cfg.toHighlights(s, score),
        stats: [{ label: scoreLabel, value: String(score) }, ...cfg.toStats(s, score)],
      };
    });
    models.sort((a, b) => b.score - a.score);

    const date = dateForDay(day);
    const snap: Snapshot = {
      category: cfg.category,
      date,
      updatedAt: `${date}T06:00:00.000Z`,
      models,
    };
    fs.writeFileSync(
      path.join(dir, "snapshots", `${date}.json`),
      JSON.stringify(snap, null, 2),
    );
    frames.push({
      date,
      entries: models.map((m) => ({
        id: m.id,
        name: m.name,
        vendor: m.vendor,
        value: m.score,
      })),
    });
    last = snap;
  }

  if (last) {
    fs.writeFileSync(path.join(dir, "current.json"), JSON.stringify(last, null, 2));
  }
  const race: RaceData = { category: cfg.category, metricLabel: scoreLabel, frames };
  fs.writeFileSync(path.join(dir, "race.json"), JSON.stringify(race, null, 2));
}

// ───────────────────────── LLM ─────────────────────────
interface LlmSeed {
  id: string; name: string; vendor: string; license: "open" | "proprietary"; releaseDate: string;
  base: number; trend: number; coding: number; math: number; gpqa: number; mmlu: number;
  speed: number; ttft: number; pIn: number; pOut: number; ctx: number;
}
const LLM: LlmSeed[] = [
  { id: "claude-opus-4-8", name: "Claude Opus 4.8", vendor: "Anthropic", license: "proprietary", releaseDate: "2026-05-20", base: 60.0, trend: 0.11, coding: 88, math: 92, gpqa: 68, mmlu: 89, speed: 78, ttft: 0.5, pIn: 15, pOut: 75, ctx: 1_000_000 },
  { id: "gemini-3-1-pro", name: "Gemini 3.1 Pro", vendor: "Google", license: "proprietary", releaseDate: "2026-04-30", base: 60.6, trend: 0.02, coding: 85, math: 90, gpqa: 66, mmlu: 90, speed: 120, ttft: 0.35, pIn: 7, pOut: 21, ctx: 2_000_000 },
  { id: "gpt-5-4", name: "GPT-5.4", vendor: "OpenAI", license: "proprietary", releaseDate: "2026-05-10", base: 57.5, trend: 0.08, coding: 83, math: 91, gpqa: 64, mmlu: 92, speed: 95, ttft: 0.4, pIn: 10, pOut: 40, ctx: 400_000 },
  { id: "deepseek-v4", name: "DeepSeek V4", vendor: "DeepSeek", license: "open", releaseDate: "2026-05-02", base: 54.0, trend: 0.30, coding: 81, math: 88, gpqa: 60, mmlu: 87, speed: 60, ttft: 0.7, pIn: 0.5, pOut: 2.0, ctx: 256_000 },
  { id: "gpt-5-2", name: "GPT-5.2", vendor: "OpenAI", license: "proprietary", releaseDate: "2026-02-15", base: 56.5, trend: -0.02, coding: 80, math: 89, gpqa: 62, mmlu: 91, speed: 100, ttft: 0.4, pIn: 8, pOut: 32, ctx: 400_000 },
  { id: "grok-4-2", name: "Grok 4.2", vendor: "xAI", license: "proprietary", releaseDate: "2026-04-18", base: 53.0, trend: 0.10, coding: 76, math: 86, gpqa: 58, mmlu: 88, speed: 88, ttft: 0.45, pIn: 5, pOut: 15, ctx: 256_000 },
  { id: "llama-4-1-405b", name: "Llama 4.1 405B", vendor: "Meta", license: "open", releaseDate: "2026-03-22", base: 50.0, trend: 0.05, coding: 70, math: 80, gpqa: 52, mmlu: 85, speed: 55, ttft: 0.6, pIn: 0.9, pOut: 0.9, ctx: 256_000 },
  { id: "qwen-3-max", name: "Qwen 3 Max", vendor: "Alibaba", license: "open", releaseDate: "2026-04-05", base: 49.0, trend: 0.20, coding: 74, math: 84, gpqa: 55, mmlu: 86, speed: 70, ttft: 0.5, pIn: 1.2, pOut: 4.0, ctx: 1_000_000 },
];

// ──────────────────────── 영상 ────────────────────────
interface VideoSeed {
  id: string; name: string; vendor: string; license: "open" | "proprietary"; releaseDate: string;
  base: number; trend: number; res: number; audio: boolean; dur: number; pSec: number;
}
const VIDEO: VideoSeed[] = [
  { id: "video-happyhorse-1", name: "HappyHorse-1.0", vendor: "fal", license: "proprietary", releaseDate: "2026-05-18", base: 1358, trend: 4.0, res: 1080, audio: false, dur: 8, pSec: 0.30 },
  { id: "video-seedance-2", name: "Dreamina Seedance 2.0", vendor: "ByteDance", license: "proprietary", releaseDate: "2026-05-12", base: 1272, trend: 6.0, res: 720, audio: true, dur: 12, pSec: 0.20 },
  { id: "video-kling-3", name: "Kling 3.0 Pro", vendor: "Kuaishou", license: "proprietary", releaseDate: "2026-04-28", base: 1250, trend: 3.0, res: 1080, audio: true, dur: 10, pSec: 0.28 },
  { id: "video-veo-3-1", name: "Veo 3.1", vendor: "Google", license: "proprietary", releaseDate: "2026-04-20", base: 1240, trend: 2.5, res: 1080, audio: true, dur: 8, pSec: 0.35 },
  { id: "video-sora-2", name: "Sora 2", vendor: "OpenAI", license: "proprietary", releaseDate: "2026-03-30", base: 1210, trend: 1.5, res: 1080, audio: true, dur: 20, pSec: 0.40 },
  { id: "video-runway-gen4", name: "Runway Gen-4", vendor: "Runway", license: "proprietary", releaseDate: "2026-02-25", base: 1180, trend: 2.0, res: 1080, audio: false, dur: 10, pSec: 0.25 },
];

// ──────────────────────── 이미지 ────────────────────────
interface ImageSeed {
  id: string; name: string; vendor: string; license: "open" | "proprietary"; releaseDate: string;
  base: number; trend: number; res: number; editing: boolean; pImg: number;
}
const IMAGE: ImageSeed[] = [
  { id: "image-midjourney-7", name: "Midjourney v7", vendor: "Midjourney", license: "proprietary", releaseDate: "2026-05-05", base: 1320, trend: 3.0, res: 2048, editing: true, pImg: 0.04 },
  { id: "image-imagen-4", name: "Imagen 4", vendor: "Google", license: "proprietary", releaseDate: "2026-04-22", base: 1295, trend: 3.5, res: 2048, editing: true, pImg: 0.03 },
  { id: "image-flux-2", name: "FLUX 2", vendor: "Black Forest Labs", license: "open", releaseDate: "2026-04-10", base: 1270, trend: 5.0, res: 2048, editing: true, pImg: 0.01 },
  { id: "image-dalle-4", name: "DALL·E 4", vendor: "OpenAI", license: "proprietary", releaseDate: "2026-03-15", base: 1260, trend: 2.0, res: 1024, editing: true, pImg: 0.04 },
  { id: "image-ideogram-3", name: "Ideogram 3", vendor: "Ideogram", license: "proprietary", releaseDate: "2026-03-01", base: 1230, trend: 2.5, res: 1024, editing: false, pImg: 0.02 },
];

// ──────────────────────── 음악 ────────────────────────
interface MusicSeed {
  id: string; name: string; vendor: string; license: "open" | "proprietary"; releaseDate: string;
  base: number; trend: number; dur: number; vocals: boolean; pSong: number;
}
const MUSIC: MusicSeed[] = [
  { id: "music-suno-5", name: "Suno v5", vendor: "Suno", license: "proprietary", releaseDate: "2026-05-01", base: 1293, trend: 3.0, dur: 300, vocals: true, pSong: 0.10 },
  { id: "music-udio-2", name: "Udio v2", vendor: "Udio", license: "proprietary", releaseDate: "2026-04-15", base: 1270, trend: 4.0, dur: 240, vocals: true, pSong: 0.12 },
  { id: "music-wondera", name: "Wondera", vendor: "Wondera", license: "proprietary", releaseDate: "2026-03-20", base: 1230, trend: 2.0, dur: 180, vocals: true, pSong: 0.08 },
  { id: "music-eleven-music", name: "ElevenLabs Music", vendor: "ElevenLabs", license: "proprietary", releaseDate: "2026-03-05", base: 1210, trend: 3.0, dur: 240, vocals: true, pSong: 0.11 },
];

// ──────────────────────── 음성 ────────────────────────
interface VoiceSeed {
  id: string; name: string; vendor: string; license: "open" | "proprietary"; releaseDate: string;
  base: number; trend: number; langs: number; realtime: boolean; pK: number;
}
const VOICE: VoiceSeed[] = [
  { id: "voice-eleven-3", name: "ElevenLabs v3", vendor: "ElevenLabs", license: "proprietary", releaseDate: "2026-05-08", base: 1300, trend: 3.0, langs: 32, realtime: true, pK: 0.30 },
  { id: "voice-openai-tts", name: "OpenAI TTS", vendor: "OpenAI", license: "proprietary", releaseDate: "2026-04-12", base: 1265, trend: 2.5, langs: 20, realtime: true, pK: 0.20 },
  { id: "voice-google-tts", name: "Google TTS", vendor: "Google", license: "proprietary", releaseDate: "2026-03-18", base: 1240, trend: 2.0, langs: 40, realtime: false, pK: 0.16 },
  { id: "voice-playht", name: "PlayHT 3", vendor: "PlayHT", license: "proprietary", releaseDate: "2026-02-28", base: 1220, trend: 2.5, langs: 28, realtime: true, pK: 0.18 },
];

function main() {
  buildCategory<LlmSeed>({
    category: "llm", wobbleAmp: 0.25, decimals: 1, seeds: LLM,
    meta: (s) => ({ id: s.id, name: s.name, vendor: s.vendor, license: s.license, releaseDate: s.releaseDate }),
    toRaw: (s, score) => ({ category: "llm", score, price: s.pOut, license: s.license, codingIndex: s.coding, gpqa: s.gpqa, outputSpeed: s.speed, contextWindow: s.ctx }),
    toHighlights: (s) => [
      { label: "코딩", value: String(s.coding) },
      { label: "속도", value: `${s.speed}/s` },
      { label: "출력가", value: fmtPrice(s.pOut) },
      { label: "컨텍스트", value: fmtContext(s.ctx) },
    ],
    toStats: (s) => [
      { label: "코딩 지수", value: String(s.coding) },
      { label: "수학 지수", value: String(s.math) },
      { label: "GPQA Diamond", value: `${s.gpqa}%` },
      { label: "MMLU-Pro", value: `${s.mmlu}%` },
      { label: "출력 속도", value: `${s.speed} tok/s` },
      { label: "첫 토큰 지연", value: `${s.ttft}s` },
      { label: "입력 가격(1M)", value: fmtPrice(s.pIn) },
      { label: "출력 가격(1M)", value: fmtPrice(s.pOut) },
      { label: "컨텍스트", value: `${fmtContext(s.ctx)} 토큰` },
      { label: "라이선스", value: LIC(s.license) },
    ],
  });

  buildCategory<VideoSeed>({
    category: "video", wobbleAmp: 3, decimals: 0, seeds: VIDEO,
    meta: (s) => ({ id: s.id, name: s.name, vendor: s.vendor, license: s.license, releaseDate: s.releaseDate }),
    toRaw: (s, score) => ({ category: "video", score, price: s.pSec, license: s.license, hasAudio: s.audio, resolution: s.res, durationSec: s.dur }),
    toHighlights: (s) => [
      { label: "해상도", value: `${s.res}p` },
      { label: "오디오", value: OX(s.audio) },
      { label: "길이", value: `${s.dur}s` },
      { label: "초당가", value: `$${s.pSec.toFixed(2)}` },
    ],
    toStats: (s) => [
      { label: "해상도", value: `${s.res}p` },
      { label: "오디오 생성", value: OX(s.audio) },
      { label: "최대 길이", value: `${s.dur}초` },
      { label: "초당 가격", value: `$${s.pSec.toFixed(2)}` },
      { label: "라이선스", value: LIC(s.license) },
    ],
  });

  buildCategory<ImageSeed>({
    category: "image", wobbleAmp: 3, decimals: 0, seeds: IMAGE,
    meta: (s) => ({ id: s.id, name: s.name, vendor: s.vendor, license: s.license, releaseDate: s.releaseDate }),
    toRaw: (s, score) => ({ category: "image", score, price: s.pImg, license: s.license, editing: s.editing, resolution: s.res }),
    toHighlights: (s) => [
      { label: "해상도", value: `${s.res}px` },
      { label: "편집", value: OX(s.editing) },
      { label: "장당가", value: `$${s.pImg.toFixed(2)}` },
      { label: "라이선스", value: LIC(s.license) },
    ],
    toStats: (s) => [
      { label: "최대 해상도", value: `${s.res}px` },
      { label: "편집 지원", value: OX(s.editing) },
      { label: "장당 가격", value: `$${s.pImg.toFixed(2)}` },
      { label: "라이선스", value: LIC(s.license) },
    ],
  });

  buildCategory<MusicSeed>({
    category: "music", wobbleAmp: 3, decimals: 0, seeds: MUSIC,
    meta: (s) => ({ id: s.id, name: s.name, vendor: s.vendor, license: s.license, releaseDate: s.releaseDate }),
    toRaw: (s, score) => ({ category: "music", score, price: s.pSong, license: s.license, durationSec: s.dur }),
    toHighlights: (s) => [
      { label: "최대길이", value: `${Math.round(s.dur / 60)}분` },
      { label: "보컬", value: OX(s.vocals) },
      { label: "곡당가", value: `$${s.pSong.toFixed(2)}` },
      { label: "라이선스", value: LIC(s.license) },
    ],
    toStats: (s) => [
      { label: "최대 길이", value: `${Math.round(s.dur / 60)}분 (${s.dur}초)` },
      { label: "보컬 생성", value: OX(s.vocals) },
      { label: "곡당 가격", value: `$${s.pSong.toFixed(2)}` },
      { label: "라이선스", value: LIC(s.license) },
    ],
  });

  buildCategory<VoiceSeed>({
    category: "voice", wobbleAmp: 3, decimals: 0, seeds: VOICE,
    meta: (s) => ({ id: s.id, name: s.name, vendor: s.vendor, license: s.license, releaseDate: s.releaseDate }),
    toRaw: (s, score) => ({ category: "voice", score, price: s.pK, license: s.license, realtime: s.realtime, languages: s.langs }),
    toHighlights: (s) => [
      { label: "언어", value: `${s.langs}개` },
      { label: "실시간", value: OX(s.realtime) },
      { label: "1천자가", value: `$${s.pK.toFixed(2)}` },
      { label: "라이선스", value: LIC(s.license) },
    ],
    toStats: (s) => [
      { label: "지원 언어", value: `${s.langs}개` },
      { label: "실시간 합성", value: OX(s.realtime) },
      { label: "1천자 가격", value: `$${s.pK.toFixed(2)}` },
      { label: "라이선스", value: LIC(s.license) },
    ],
  });

  // 뉴스(전 카테고리 공통)
  const news = [
    { id: "anthropic-opus48", title: "Claude Opus 4.8 출시 — Intelligence Index 61로 종합 1위 탈환", url: "https://www.anthropic.com/news", source: "Anthropic", date: "2026-05-20T15:00:00.000Z", summary: "적응형 추론과 Max Effort 모드로 AA Intelligence Index 1위." },
    { id: "video-happyhorse", title: "HappyHorse-1.0, Video Arena Elo 1358로 영상 생성 1위", url: "https://fal.ai", source: "fal", date: "2026-05-18T11:00:00.000Z", summary: "텍스트→영상 부문에서 Seedance·Kling·Veo를 제치고 선두." },
    { id: "music-suno5", title: "Suno v5 공개 — 음악 생성 Elo 1293, 보컬 사실감 향상", url: "https://suno.com", source: "Suno", date: "2026-05-01T10:00:00.000Z", summary: "오디오 충실도·구조·보컬에서 경쟁작 앞섬." },
    { id: "image-midjourney7", title: "Midjourney v7, 2K 해상도와 편집 기능 강화", url: "https://midjourney.com", source: "Midjourney", date: "2026-05-05T09:00:00.000Z", summary: "이미지 Arena 상위, 인페인팅 편집 개선." },
    { id: "voice-eleven3", title: "ElevenLabs v3, 32개 언어 실시간 음성 합성", url: "https://elevenlabs.io", source: "ElevenLabs", date: "2026-05-08T14:00:00.000Z", summary: "TTS Arena 선두, 실시간 스트리밍 지원." },
    { id: "deepseek-v4", title: "DeepSeek V4 — 오픈 가중치로 SWE-bench 81% 돌파", url: "https://deepseek.com", source: "DeepSeek", date: "2026-05-02T09:00:00.000Z", summary: "오픈 모델 중 최고 코딩 성능, 토큰당 가격 1/20." },
  ];
  fs.writeFileSync(path.join(DATA_DIR, "news.json"), JSON.stringify(news, null, 2));

  console.log("[seed] 5개 카테고리 × " + DAYS + "일 스냅샷 + race + news 생성 완료");
}

main();
