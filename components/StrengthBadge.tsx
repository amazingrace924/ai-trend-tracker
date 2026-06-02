export default function StrengthBadge({ tag }: { tag: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-[var(--border-strong)] bg-[var(--panel2)] px-2 py-0.5 text-xs font-semibold text-[var(--text)]">
      {tag}
    </span>
  );
}
