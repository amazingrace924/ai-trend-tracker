import { notFound } from "next/navigation";
import CategoryView from "@/components/CategoryView";
import { CATEGORIES, getCategoryMeta, isCategory } from "@/lib/categories";

// 홈은 대시보드이므로 LLM 포함 모든 카테고리를 /c/<id>로 생성한다.
export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.id }));
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
  if (!isCategory(category)) notFound();
  return <CategoryView category={category} />;
}
