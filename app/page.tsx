import CategoryView from "@/components/CategoryView";

// 홈 = LLM 카테고리. 다른 카테고리는 /c/[category].
export default function Home() {
  return <CategoryView category="llm" />;
}
