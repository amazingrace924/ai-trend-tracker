import NewsFeed from "@/components/NewsFeed";
import { getNews } from "@/lib/data";

export const metadata = { title: "최신 소식 — AI 대세 트래커" };

export default function NewsPage() {
  const items = getNews();
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="eyebrow text-[var(--accent)]">📰 NEWS FEED</div>
        <h1 className="text-3xl font-bold sm:text-4xl">최신 소식</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          OpenAI·Google·Hugging Face 등 공식 블로그 RSS에서 신규 모델 출시·업데이트 소식을 매일 모읍니다.
        </p>
      </div>
      <NewsFeed items={items} />
    </div>
  );
}
