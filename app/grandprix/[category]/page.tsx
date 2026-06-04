import { notFound } from "next/navigation";
import GrandPrix from "@/components/GrandPrix";
import { CATEGORIES, getCategoryMeta, isCategory } from "@/lib/categories";
import { getRace } from "@/lib/data";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!isCategory(category)) return { title: "AI 그랑프리" };
  return { title: `${getCategoryMeta(category).label} 그랑프리 — AI 대세 트래커` };
}

export default async function GrandPrixPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!isCategory(category)) notFound();
  const meta = getCategoryMeta(category);
  return (
    <GrandPrix
      race={getRace(category)}
      categoryLabel={meta.label}
      metricLabel={meta.scoreLabel}
      backHref={`/c/${category}`}
    />
  );
}
