# PR2: Web White Screen Hotfix

Date: 2026-02-24
Branch: `feature/solo-active-project-docs`
Scope: Web startup white-screen crash fix only

## 1) Problem Summary
- Web 실행 시 첫 화면이 흰색으로 멈춤.
- 콘솔에서 런타임 크래시 확인:
  - `ReferenceError: Cannot access 'useLearnStore' before initialization`

## 2) Root Cause
1. Store initialization cycle
- `learnStore` / `lessonStore` 가 `useStoreReady`를 import.
- `useStoreReady`가 다시 `learnStore`, `lessonStore`를 import.
- 순환 의존으로 초기화 순서가 깨져 앱이 부팅 단계에서 크래시.

2. Web bundling risk path (preventive)
- Web에서 `zustand/middleware`가 ESM 경로로 해석될 경우 `import.meta` 관련 런타임 리스크 존재.
- Metro resolver에서 web 전용으로 CJS middleware 경로를 강제.

## 3) Changes
- `metro.config.js`
  - Web에서 `zustand/middleware` -> `node_modules/zustand/middleware.js` 강제 매핑.
  - 기존 `lottie-react-native` web mock 매핑 유지.
- `store/learnStore.ts`
  - `isStoreHydrated` import 제거.
  - 로컬 `hasStoreHydrated()` 헬퍼로 `persist.hasHydrated()` 직접 확인.
- `store/lessonStore.ts`
  - `isStoreHydrated` import 제거.
  - 로컬 `hasStoreHydrated()` 헬퍼로 `persist.hasHydrated()` 직접 확인.

## 4) Reproduce (before fix)
1. `npm run web -- --port 19007 -c`
2. 브라우저 접속
3. 결과: 흰 화면 + 콘솔 크래시
   - `Cannot access 'useLearnStore' before initialization`

## 5) Validate (after fix)
1. Static checks
- `npm run typecheck`
- `npm run lint`

2. Tests
- `npm test -- --watchAll=false`

3. Runtime smoke
- `npm run web -- --port 19007 -c`
- `npx --yes --package @playwright/cli playwright-cli --session whattodo-white open http://localhost:19008`
- `npx --yes --package @playwright/cli playwright-cli --session whattodo-white screenshot`

Expected:
- 흰 화면 없음
- 콘솔 `error` 0건 (warning 허용)

## 6) Definition of Done (DoD)
- [x] Web 첫 로드 시 화면 렌더링 정상
- [x] `useLearnStore before initialization` 오류 재발 없음
- [x] `npm run typecheck` 통과
- [x] `npm run lint` 에러 0
- [x] `npm test -- --watchAll=false` 통과
- [x] 변경 LOC 300 이하
- [x] 신규 production dependency 없음
- [x] 데이터 스키마/저장 포맷 변경 없음

## 7) Rollback Plan
1. Hotfix commit revert:
- `git revert <hotfix_commit_sha>`

2. Manual rollback files:
- `metro.config.js`
- `store/learnStore.ts`
- `store/lessonStore.ts`

3. Risk notes:
- 저장 포맷 변경 없음.
- persisted data migration 불필요.
- rollback 시 데이터 유실 위험 낮음.

## 8) PR Draft
Title:
- `fix(web): resolve startup white screen by breaking store init cycle`

Body:
- Fix web startup white screen caused by store initialization cycle.
- Remove `useStoreReady` dependency from `learnStore`/`lessonStore`.
- Use direct `persist.hasHydrated()` checks for cross-store safe calls.
- Add web resolver override to force CJS `zustand/middleware` path.

