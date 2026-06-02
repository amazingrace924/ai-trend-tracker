import InfoDot from "./InfoDot";

// 라벨 + (용어 사전에 있으면) ⓘ. 상세 페이지 stat 행·지표명에 사용.
export default function MetricLabel({
  label,
  align = "center",
  className = "",
}: {
  label: string;
  align?: "center" | "left" | "right";
  className?: string;
}) {
  return (
    <span className={"inline-flex items-center gap-1 " + className}>
      {label}
      <InfoDot label={label} align={align} />
    </span>
  );
}
