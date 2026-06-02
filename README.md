# 🏁 AI 모델 대세 트래커

지금 **어떤 AI가 대세이고 무엇을 잘하는지**를 매일 자동으로 보여주는 정적 웹사이트.
독립 벤치마크(정밀 성능)와 실사용자 투표(민심)를 합쳐 **순위 경주 애니메이션 · 강점 카드 · 최신 소식**으로 시각화한다.

## 데이터는 누가 만드나 (출처)

유튜버는 전달자일 뿐, 성능을 직접 측정·집계하는 주체는 아래 플랫폼이다.

| 출처 | 제공 데이터 | 접근 |
| --- | --- | --- |
| **Artificial Analysis** | Intelligence Index, 코딩/수학 지수, GPQA·MMLU-Pro, 속도(tok/s)·TTFT, 가격 | 무료 API (`x-api-key`, 1,000회/일) |
| **LMArena** (구 LMSYS) | 실사용자 투표 Elo = "민심/대세" | 커뮤니티 일일 JSON (wulong.dev / GitHub raw) |
| **공식 블로그 RSS** | 신규 모델 출시·업데이트 뉴스 | OpenAI / Google DeepMind / Hugging Face 등 |

## 동작 방식

```
매일(GitHub Actions cron)
  └─ npm run build-data
       fetchArtificialAnalysis (성능)  ┐
       fetchArena (민심 Elo)           ├─ 결합·강점 산출
       fetchNews (RSS)                 ┘
  → data/current.json        (최신 스냅샷 = 강점 카드)
  → data/snapshots/<날짜>.json (히스토리 누적)
  → data/race.json           (스냅샷 시계열 = 바 차트 레이스)
  → data/news.json
  → 변경분 커밋 → 정적 빌드 재배포
```

매일 스냅샷을 쌓는 것 자체가 **경주 애니메이션용 시계열**이 된다.

## 로컬 개발

```bash
npm install
npm run build-data   # AA_API_KEY 있으면 실데이터, 없으면 fixture 유지
npm run dev          # http://localhost:3000
```

API 키 없이 UI만 보려면 샘플 데이터를 생성한다(이미 커밋되어 있음):

```bash
npx tsx scripts/seed-fixtures.ts
```

## 실데이터 연결

1. <https://artificialanalysis.ai> → Insights → API 키 발급
2. 로컬: `.env`에 `AA_API_KEY=...` (`.env.example` 참고)
3. 배포: GitHub 저장소 **Settings → Secrets → Actions**에 `AA_API_KEY` 등록
4. `npm run build-data` 1회 실행해 `lib/fetchArtificialAnalysis.ts`의 필드 매핑을
   실제 응답과 대조(엔드포인트/필드명이 다르면 `mapModel()`만 조정)

## 배포

- **Vercel(추천)**: 저장소 연결만 하면 푸시마다 자동 빌드·배포. `deploy.yml`은 비활성화.
- **GitHub Pages**: `deploy.yml`이 빌드→Pages 배포. Settings → Pages → Source를 "GitHub Actions"로.
  - 프로젝트 사이트(`/<repo>`)는 `BASE_PATH`가 워크플로에서 자동 주입된다.

## 구조

```
app/            홈(경주) · models(강점) · models/[id](상세) · news
components/      BarChartRace · ModelCard · NewsFeed · 배지
lib/             fetch*(수집) · deriveStrengths · data(접근) · types · format
scripts/         build-data(일일 수집) · seed-fixtures(샘플 생성)
data/            current/race/news.json · snapshots/
.github/workflows/  daily-update(cron) · deploy(pages)
```

## 스택

Next.js 15(App Router, 정적 익스포트) · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion(경주 애니메이션)
