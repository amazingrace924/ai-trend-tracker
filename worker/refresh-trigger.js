// Cloudflare Worker — 사이트의 '지금 새로 수집' 버튼이 호출하는 트리거.
// GitHub Actions의 daily-update 워크플로를 workflow_dispatch로 실행시킨다.
// GitHub 토큰(GH_TOKEN)은 Worker 시크릿에 저장되어 사이트/브라우저엔 절대 노출되지 않는다.

const REPO = "amazingrace924/ai-trend-tracker";
const WORKFLOW = "daily-update.yml";
const ALLOW_ORIGIN = "https://amazingrace924.github.io";
const COOLDOWN_S = 60; // 스팸 방지: 60초 내 재트리거 차단

function cors() {
  return {
    "Access-Control-Allow-Origin": ALLOW_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
  };
}
function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors(), "content-type": "application/json" },
  });
}

export default {
  async fetch(req, env, ctx) {
    if (req.method === "OPTIONS") return new Response(null, { headers: cors() });
    if (req.method !== "POST") return json({ ok: false, error: "POST only" }, 405);

    // 쿨다운(Cache API, KV 불필요)
    const cache = caches.default;
    const marker = new Request("https://cooldown.local/refresh");
    if (await cache.match(marker)) return json({ ok: false, reason: "cooldown" }, 429);

    const res = await fetch(
      `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.GH_TOKEN}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "ai-trend-refresh-worker",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({ ref: "main" }),
      },
    );

    if (res.ok) {
      ctx.waitUntil(
        cache.put(
          marker,
          new Response("1", { headers: { "Cache-Control": `max-age=${COOLDOWN_S}` } }),
        ),
      );
      return json({ ok: true }, 202); // 수집 시작됨(완료까지 1~2분)
    }
    return json({ ok: false, status: res.status, error: (await res.text()).slice(0, 200) }, 502);
  },
};
