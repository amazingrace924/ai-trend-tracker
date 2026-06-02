import Link from "next/link";
import GuideGlossary from "@/components/GuideGlossary";

export const metadata = { title: "가이드 · 용어 설명 — AI 대세 트래커" };

const steps = [
  { icon: "①", title: "카테고리 고르기", desc: "상단 탭에서 LLM·영상·이미지·음악·음성 중 보고 싶은 분야를 골라요." },
  { icon: "②", title: "경주 보기", desc: "막대가 길수록 점수가 높아요. ▶를 누르면 날짜가 흐르며 순위가 바뀌어요." },
  { icon: "③", title: "카드로 비교", desc: "아래 카드에서 모델별 강점·점수를 한눈에 보고, 누르면 자세한 설명이 나와요." },
];

const readBullets = [
  "막대 하나 = AI 모델 하나.",
  "막대 길이 = 점수 (길수록 잘함).",
  "위에서부터 1·2·3등 순위, 1위는 색으로 강조.",
  "날짜가 흐르면 순위가 바뀌며 '경주'처럼 움직여요.",
  "▶ 재생 / 슬라이더로 원하는 날짜로 이동.",
];

export default function GuidePage() {
  return (
    <div className="space-y-12">
      {/* 인트로 */}
      <section className="space-y-3">
        <div className="eyebrow text-[var(--accent)]">📖 처음 오셨나요?</div>
        <h1 className="text-3xl font-bold sm:text-4xl">
          AI <span className="grad-text">대세</span>, 3단계로 이해하기
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          전문 용어를 몰라도 괜찮아요. 이 사이트는 "지금 어떤 AI가 제일 잘하나?"를
          누가 봐도 알 수 있게 보여줍니다. 어려운 말은 아래에서 쉽게 풀어드릴게요.
        </p>
      </section>

      {/* 사용법 3단계 */}
      <section className="grid gap-3 sm:grid-cols-3">
        {steps.map((s) => (
          <div key={s.title} className="card p-5">
            <div className="grad-text font-display text-2xl font-bold">{s.icon}</div>
            <div className="mt-2 font-bold">{s.title}</div>
            <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{s.desc}</p>
          </div>
        ))}
      </section>

      {/* 차트 읽는 법 */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold">📊 경주 그래프 읽는 법</h2>
        <div className="card p-5">
          <ul className="space-y-2 text-sm leading-relaxed text-[var(--muted)]">
            {readBullets.map((b, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[var(--accent)]">›</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 용어 사전 */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">📚 용어 사전</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            점수와 지표가 무슨 뜻인지 쉬운 말과 예시로 풀었어요.
          </p>
        </div>
        <GuideGlossary />
      </section>

      {/* 점수는 누가 매기나 */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold">🏁 점수는 누가 매기나요?</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="card p-5">
            <div className="font-bold">Artificial Analysis</div>
            <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
              모든 AI에게 똑같은 시험(코딩·수학·추론 등)을 같은 조건에서 보게 한 뒤
              점수를 매기는 독립 기관이에요. LLM의 'Intelligence Index'가 여기서 나와요.
            </p>
          </div>
          <div className="card p-5">
            <div className="font-bold">LMArena · Arena</div>
            <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
              두 결과물을 사람이 직접 비교 투표해 'Elo' 점수를 매겨요. 영상·이미지·음성
              같은 창작 분야는 사람의 선호가 중요해서 이 방식을 써요.
            </p>
          </div>
        </div>
        <p className="text-xs text-[var(--muted)]">
          즉, 유튜버가 아니라 이런 독립 평가가 원천 데이터예요. 매일 자동으로 갱신됩니다.
        </p>
      </section>

      <Link
        href="/"
        className="grad-bar inline-block rounded-xl px-4 py-2 text-sm font-bold text-[var(--on-accent)] transition hover:opacity-90"
      >
        ▶ 경주 보러 가기
      </Link>
    </div>
  );
}
