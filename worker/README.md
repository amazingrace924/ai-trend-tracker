# 새로 수집 트리거 Worker

사이트의 "지금 새로 수집" 버튼이 호출하는 Cloudflare Worker. GitHub Actions의
`daily-update` 워크플로를 실행시켜 AA에서 최신 데이터를 새로 수집·커밋하게 한다.

## 왜 필요한가
정적 사이트(GitHub Pages)는 비밀(토큰)을 안전하게 둘 수 없다. 이 Worker가
GitHub 토큰을 서버 측에 숨기고, 사이트는 토큰 없이 Worker만 호출한다.

## 배포 (한 번만)
```
# 1) Cloudflare 로그인 (브라우저)
npx wrangler login

# 2) 이 폴더에서 배포 → https://ai-trend-refresh.<계정>.workers.dev 발급
cd worker
npx wrangler deploy

# 3) GitHub 토큰을 시크릿으로 등록 (fine-grained PAT, Actions: Read and write)
npx wrangler secret put GH_TOKEN
```

## GitHub 토큰
github.com → Settings → Developer settings → Fine-grained tokens →
- Repository access: `ai-trend-tracker`만
- Permissions: **Actions = Read and write**
생성된 토큰을 위 `secret put GH_TOKEN`에 붙여넣는다.

## 동작
- `POST` 요청 → `daily-update.yml` 워크플로 트리거(202).
- 60초 쿨다운(스팸 방지), CORS는 사이트 origin만 허용.
- 수집 완료(1~2분) 후 데이터가 main에 커밋되면, 사이트가 raw에서 새 데이터를 폴링해 갱신.
