// 빌드 타임 전용 영어→한국어 번역기.
// 별도 키가 필요 없는 무료 Google 번역 엔드포인트(translate_a/single)를 사용한다.
// 네트워크/파싱 실패는 조용히 원문을 반환하므로 빌드를 멈추지 않는다.

const ENDPOINT = "https://translate.googleapis.com/translate_a/single";

// 이미 한글이 충분히 섞인 텍스트는 번역을 건너뛴다.
function looksKorean(s: string): boolean {
  const hangul = (s.match(/[가-힣]/g) ?? []).length;
  return hangul >= Math.max(2, s.length * 0.2);
}

async function translateOne(text: string): Promise<string> {
  const t = text.trim();
  if (!t || looksKorean(t)) return text;
  const url =
    `${ENDPOINT}?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(t)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (build-data news translator)" },
  });
  if (!res.ok) throw new Error(`translate ${res.status}`);
  // 응답 형태: [[["번역","원문",...], ...], ...] — 첫 배열의 각 세그먼트[0]을 이어 붙인다.
  const data = (await res.json()) as unknown;
  const segments = Array.isArray(data) && Array.isArray(data[0]) ? data[0] : [];
  const out = segments
    .map((seg) => (Array.isArray(seg) ? String(seg[0] ?? "") : ""))
    .join("")
    .trim();
  return out || text;
}

// 개별 실패는 원문으로 폴백. 무료 엔드포인트 보호를 위해 동시성을 제한한다.
async function mapPool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, i: number) => Promise<R>,
): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return out;
}

// 여러 텍스트를 한국어로 번역. 실패한 항목은 원문을 그대로 돌려준다.
export async function translateToKo(texts: string[]): Promise<string[]> {
  return mapPool(texts, 4, async (t) => {
    try {
      return await translateOne(t);
    } catch {
      return t;
    }
  });
}
