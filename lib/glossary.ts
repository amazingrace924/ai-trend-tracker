// 지수·라벨 용어 사전 — 친절한 설명 레이어의 단일 출처.
// 툴팁(short), 가이드 페이지(detail/example) 모두 여기서 가져온다.
// lib/deriveStrengths.ts의 STRENGTH_DESC와 같은 패턴.

export type GlossaryGroup = "공통" | "LLM" | "미디어" | "기초";

export interface GlossaryEntry {
  key: string;
  term: string; // 대표 표기
  short: string; // 한 줄 쉬운 설명(툴팁·캡션)
  detail: string; // 가이드용 풀이(비유 포함)
  example?: string; // 점수 감각 예시
  group: GlossaryGroup;
  aliases?: string[]; // 화면 라벨 매칭용
}

export const GLOSSARY: GlossaryEntry[] = [
  // ── 공통 ──
  {
    key: "intelligence-index",
    term: "Intelligence Index",
    short: "AI의 똑똑함을 여러 시험으로 매긴 종합 점수예요. 높을수록 똑똑해요.",
    detail:
      "Artificial Analysis라는 독립 기관이 코딩·수학·추론·지식 등 여러 시험을 똑같은 조건에서 보게 한 뒤, 그 결과를 하나의 점수로 합친 '종합 성적표'예요. 학교로 치면 전 과목 평균 점수에 가깝습니다.",
    example: "2026년 기준 60점대면 세계 최상위권이에요.",
    group: "공통",
    aliases: ["지능 지수", "종합 점수", "종합 지수"],
  },
  {
    key: "arena-elo",
    term: "Arena Elo",
    short: "사람들이 직접 비교 투표해서 매긴 인기·실력 점수예요(체스 레이팅과 같은 방식).",
    detail:
      "두 모델의 결과물을 나란히 보여주고 '어느 쪽이 더 좋아?'를 사람이 고른 수백만 번의 투표로 계산해요. 체스 실력을 매기는 Elo 방식이라, 강한 상대를 자주 이길수록 점수가 올라갑니다. 즉 '사람들이 실제로 더 선호하는 정도'예요.",
    example: "1300점대면 상위권, 1400점대면 정상권이에요.",
    group: "공통",
    aliases: ["Elo", "엘로", "아레나 Elo"],
  },
  {
    key: "price",
    term: "가격",
    short: "이 모델을 쓸 때 드는 비용이에요. 낮을수록 저렴해요.",
    detail:
      "LLM은 보통 '토큰 100만 개당 달러'로, 영상은 '초당', 이미지는 '장당', 음악은 '곡당', 음성은 '1천 자당'으로 매겨요. 같은 결과라면 가격이 낮을수록 가성비가 좋습니다.",
    example: "출력 100만 토큰당 $2면 저렴, $75면 프리미엄급이에요.",
    group: "공통",
    aliases: [
      "입력 가격(1M)", "출력 가격(1M)", "출력가", "입력가",
      "초당 가격", "장당 가격", "곡당 가격", "1천자 가격",
      "초당가", "장당가", "곡당가", "1천자가",
    ],
  },
  {
    key: "license",
    term: "라이선스",
    short: "'오픈'은 누구나 받아 쓸 수 있고, '독점'은 회사 API로만 쓸 수 있어요.",
    detail:
      "오픈(open) 모델은 가중치가 공개되어 내 컴퓨터·서버에 직접 올려 쓰거나 자유롭게 활용할 수 있어요. 독점(proprietary)은 만든 회사의 서비스/API를 통해서만 쓸 수 있습니다. 오픈은 자유도·비용에서, 독점은 보통 최고 성능·편의에서 유리해요.",
    group: "공통",
    aliases: ["오픈", "독점"],
  },

  // ── LLM ──
  {
    key: "coding",
    term: "코딩 지수",
    short: "프로그래밍(코드 작성·버그 수정)을 얼마나 잘하는지예요.",
    detail:
      "실제 깃허브 이슈를 고치는 SWE-bench 같은 코딩 시험 성적을 모은 점수예요. 개발 보조로 쓸 거라면 이 점수가 중요합니다.",
    group: "LLM",
    aliases: ["코딩"],
  },
  {
    key: "math",
    term: "수학 지수",
    short: "수학 문제를 푸는 능력이에요.",
    detail: "경시대회 수준(AIME 등)의 수학 시험 성적을 모은 점수예요. 논리·단계적 계산이 필요한 작업과 관련이 깊습니다.",
    group: "LLM",
    aliases: ["수학"],
  },
  {
    key: "gpqa",
    term: "GPQA Diamond",
    short: "박사급 과학 문제를 푸는 '고난도 추론' 시험이에요.",
    detail:
      "전문가도 어려워하는 대학원/박사 수준의 과학 객관식 시험이에요. 인터넷 검색으로 쉽게 답할 수 없게 설계돼서, 진짜 깊은 추론 능력을 봅니다. %가 높을수록 어려운 문제를 더 많이 맞혔다는 뜻이에요.",
    example: "60% 이상이면 최상위권이에요.",
    group: "LLM",
    aliases: ["GPQA"],
  },
  {
    key: "mmlu",
    term: "MMLU-Pro",
    short: "여러 분야의 폭넓은 지식을 묻는 시험이에요.",
    detail:
      "법·의학·역사·공학 등 수십 개 과목의 객관식 문제로 '얼마나 두루 아는지'를 봅니다. 기존 MMLU가 너무 쉬워져서 더 어렵게 만든 버전이에요.",
    group: "LLM",
    aliases: ["MMLU"],
  },
  {
    key: "speed",
    term: "출력 속도",
    short: "답을 얼마나 빨리 써 내려가는지예요(초당 글자 수 느낌).",
    detail:
      "1초에 토큰(글자 조각)을 몇 개 만드는지(tok/s)예요. 숫자가 클수록 답이 빠르게 주르륵 나옵니다. 채팅 체감 속도와 직결돼요.",
    example: "100 tok/s면 꽤 빠른 편이에요.",
    group: "LLM",
    aliases: ["속도", "tok/s", "토큰/초"],
  },
  {
    key: "ttft",
    term: "첫 토큰 지연(TTFT)",
    short: "질문 후 '첫 글자가 나오기까지' 걸리는 시간이에요. 짧을수록 좋아요.",
    detail:
      "Time To First Token. 버튼을 누르고 답이 시작될 때까지의 대기 시간이에요. 식당으로 치면 '주문 후 첫 음식이 나오는 시간'. 0.5초면 거의 즉시 반응하는 느낌입니다.",
    group: "LLM",
    aliases: ["첫 토큰 지연", "TTFT", "지연"],
  },
  {
    key: "context",
    term: "컨텍스트",
    short: "한 번에 읽고 기억할 수 있는 글의 양이에요. 클수록 긴 문서를 다뤄요.",
    detail:
      "컨텍스트 윈도우(context window). 모델이 한 대화에서 동시에 '눈에 담을 수 있는' 분량이에요. 100만 토큰이면 책 여러 권 분량을 한꺼번에 읽고 답할 수 있습니다.",
    example: "100만(1M) 토큰 ≈ 두꺼운 책 7~8권 분량.",
    group: "LLM",
    aliases: ["컨텍스트 윈도우"],
  },

  // ── 미디어 ──
  {
    key: "resolution",
    term: "해상도",
    short: "만들어내는 영상/이미지의 선명함이에요. 높을수록 또렷해요.",
    detail: "1080p, 2048px처럼 픽셀 수로 표시해요. 숫자가 클수록 더 선명하고 큰 화면에서도 깨지지 않습니다.",
    group: "미디어",
    aliases: ["최대 해상도"],
  },
  {
    key: "audio",
    term: "오디오 생성",
    short: "영상에 소리(효과음·말소리)까지 같이 만들어 주는지 여부예요.",
    detail: "O면 영상과 사운드를 한 번에 생성해 따로 음향 작업이 덜 필요하고, X면 영상만 만들어요.",
    group: "미디어",
    aliases: ["오디오"],
  },
  {
    key: "vocals",
    term: "보컬 생성",
    short: "노래에 사람 목소리(가사 노래)까지 만들어 주는지예요.",
    detail: "O면 가사를 부르는 보컬이 포함된 완성곡을, X면 반주 위주를 만들어요.",
    group: "미디어",
    aliases: ["보컬"],
  },
  {
    key: "duration",
    term: "최대 길이",
    short: "한 번에 만들 수 있는 영상/곡의 최대 길이예요.",
    detail: "영상은 초, 음악은 분 단위로 표시해요. 길수록 긴 클립이나 완곡을 한 번에 뽑을 수 있습니다.",
    group: "미디어",
    aliases: ["길이", "최대길이"],
  },
  {
    key: "editing",
    term: "편집 지원",
    short: "만든 이미지를 부분 수정(인페인팅 등)할 수 있는지예요.",
    detail: "O면 '여기만 바꿔줘'처럼 일부를 골라 다시 그리는 편집이 되고, X면 새로 생성만 가능해요.",
    group: "미디어",
    aliases: ["편집"],
  },
  {
    key: "languages",
    term: "지원 언어",
    short: "음성으로 읽어줄 수 있는 언어의 개수예요.",
    detail: "숫자가 클수록 더 많은 나라 언어를 자연스럽게 말할 수 있어요.",
    group: "미디어",
    aliases: ["언어"],
  },
  {
    key: "realtime",
    term: "실시간 합성",
    short: "기다림 없이 실시간으로 음성을 만들어 주는지예요.",
    detail: "O면 스트리밍처럼 말이 즉시 흘러나와 통화·생방송에 적합하고, X면 한 번에 변환해 내려받는 방식이에요.",
    group: "미디어",
    aliases: ["실시간"],
  },

  // ── 기초 ──
  {
    key: "token",
    term: "토큰",
    short: "AI가 글을 다루는 최소 조각이에요(대략 단어보다 작음).",
    detail:
      "AI는 글자를 '토큰'이라는 조각 단위로 읽고 씁니다. 한국어 기준 대략 1토큰이 글자 한두 개 정도예요. 가격·속도·컨텍스트가 모두 토큰 수로 계산돼요.",
    group: "기초",
  },
  {
    key: "benchmark",
    term: "벤치마크",
    short: "AI들을 똑같은 문제로 시험 보는 '공인 시험'이에요.",
    detail:
      "모든 모델에게 같은 문제지를 풀게 해서 공정하게 비교하는 표준 시험이에요. GPQA·MMLU·SWE-bench 등이 대표적이고, 이 점수들을 모아 순위를 매깁니다.",
    group: "기초",
  },
];

function norm(s: string): string {
  return s.trim().toLowerCase();
}

// 화면 라벨로 용어를 찾는다. 정확 일치(term/alias) → 부분 포함 순으로 관대하게 매칭.
export function lookupTerm(label: string): GlossaryEntry | undefined {
  const n = norm(label);
  // 1) 정확 일치
  for (const e of GLOSSARY) {
    if (norm(e.term) === n || e.aliases?.some((a) => norm(a) === n)) return e;
  }
  // 2) 부분 포함 (예: "출력 가격(1M)" ↔ "출력 가격")
  for (const e of GLOSSARY) {
    const keys = [e.term, ...(e.aliases ?? [])].map(norm);
    if (keys.some((k) => n.includes(k) || k.includes(n))) return e;
  }
  return undefined;
}

export function getEntry(key: string): GlossaryEntry | undefined {
  return GLOSSARY.find((e) => e.key === key);
}
