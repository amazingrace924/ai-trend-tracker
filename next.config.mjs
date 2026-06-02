/** @type {import('next').NextConfig} */
const nextConfig = {
  // 정적 익스포트: GitHub Actions가 매일 빌드해 정적 파일을 재배포한다.
  output: "export",
  images: { unoptimized: true },
  // GitHub Pages 프로젝트 사이트(/<repo>) 배포 시 BASE_PATH로 하위 경로 주입.
  // Vercel/로컬은 BASE_PATH 미설정 → 빈 값.
  basePath: process.env.BASE_PATH || "",
  trailingSlash: true,
};

export default nextConfig;
