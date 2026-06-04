import CategoryView from "@/components/CategoryView";
import LeadersOverview from "@/components/LeadersOverview";

// 홈 = 카테고리별 1위 대시보드 + LLM 카테고리 상세.
export default function Home() {
  return (
    <div className="space-y-10">
      <LeadersOverview />
      <CategoryView category="llm" />
    </div>
  );
}
