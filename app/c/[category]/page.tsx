import { notFound } from "next/navigation";
import CategoryView from "@/components/CategoryView";
import { CATEGORIES, getCategoryMeta, isCategory } from "@/lib/categories";

// LLM은 홈("/")이 담당하므로 나머지 카테고리만 정적 생성한다.
export function generateStaticParams() {
  return CATEGORIES.filter((c) => c.id !== "llm").map((c) => ({ category: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!isCategory(category)) return { title: "AI 대세 트래커" };
  const meta = getCategoryMeta(category);
  return { title: `${meta.label} AI 순위 — AI 대세 트래커` };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!isCategory(category) || category === "llm") notFound();
  return <CategoryView category={category} />;
}
