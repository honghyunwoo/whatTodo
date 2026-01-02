---
description: typecheck + lint 실행
---

다음 명령어를 순서대로 실행하고 결과 보고:

1. `npx tsc --noEmit` (TypeScript 타입 체크)
2. `npm run lint` (ESLint)

결과 형식:
- typecheck: ✅ 통과 / ❌ N개 오류
- lint: ✅ 통과 / ❌ N개 오류

실패 시 오류 내용 요약해서 보여줘.
