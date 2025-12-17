# 프로젝트 상태 보고서 (whatTodo)

## Summary (요약)
- Expo Router 기반의 단일 Stack 안에 탭 네비게이션을 두고, 기본 랜딩을 Diary 탭으로 설정했습니다.
- 주요 상태(다이어리, 투두, 학습, SRS, 사용자/알림)는 모두 zustand + AsyncStorage `persist`로 오프라인 보존됩니다.
- 알림은 expo-notifications로 로컬 리마인더/스트릭 경고를 예약하지만, Expo Push Token은 프로젝트 ID 플레이스홀더로 남아 있어 원격 푸시는 준비되지 않았습니다.
- Sentry는 DSN 환경변수 설정 시에만 활성화되며, 현재 릴리스 태그/소스맵 업로드·PII 필터링은 비어 있어 운영 시 추가 구성이 필요합니다.
- 학습 콘텐츠(A1~C2 데이터)가 약 5MB(activities)로 번들되며, 첫 로드/검색 시 메모리·시작 지연 위험이 존재합니다.

## 앱 네비게이션 맵
- `app/_layout.tsx`: 루트 Stack에서 `(tabs)` 그룹을 헤더 없이 렌더링, 앱 시작 시 알림 초기화·스트릭 체크·Sentry 초기화 수행.
- `app/(tabs)/_layout.tsx`: Diary · Todo · Learn · Break 4개 탭으로 구성, 기본 탭은 Diary.
- 주요 스크린: Diary(`app/(tabs)/index.tsx`), Todo(`app/(tabs)/todo.tsx`), Learn(`app/(tabs)/learn.tsx`), Break/2048(`app/(tabs)/game.tsx`), Review(`app/review.tsx`), Level Test(`app/level-test.tsx`), Task 상세(`app/task/[id].tsx`), Learn 활동 상세(`app/learn/[type].tsx`).

## 데이터 지속성
- 다이어리/저널: `useJournalStore`가 AsyncStorage(`STORAGE_KEYS.JOURNAL`)에 일자별 엔트리·스트릭·스킬 진행도를 영구 저장.
- 투두: `useTaskStore`가 AsyncStorage(`STORAGE_KEYS.TASKS`)에 태스크/서브태스크·필터·정렬 상태를 저장.
- 학습: `useLearnStore`가 AsyncStorage(`STORAGE_KEYS.LEARN_PROGRESS`)에 주차 진행, 레벨, 활동 기록, 스트릭을 저장.
- SRS: `useSrsStore`가 AsyncStorage(`STORAGE_KEYS.SRS`)에 단어/리뷰 스케줄·통계를 저장.
- 사용자 설정: `useUserStore`가 알림 설정/선호 레벨/목표 등을 AsyncStorage(`STORAGE_KEYS.SETTINGS`)에 저장.

## 알림 구현 상태
- 앱 시작 시 `useUserStore.initializeNotifications()`로 권한 요청 및 알림 스케줄을 진행하고, 스트릭 스토어 상태로 20시 경고 알림을 예약.
- Daily reminder와 streak warning을 expo-notifications로 로컬 예약하며, iOS/Android 채널/핸들러 설정은 코드에 포함.
- Expo Push Token은 `projectId: 'your-project-id'` 플레이스홀더라 서버 푸시 연동은 미완료; 로컬 알림만 실사용 가능.

## Sentry 구성 상태
- DSN이 설정된 경우에만 초기화하며, 프로덕션에서만 이벤트 전송(`enabled: !__DEV__`).
- 릴리스 버전 태깅/소스맵 업로드 설정이 없고, `beforeSend`에서 PII 마스킹을 하지 않아 운영 시 추가 설정 필요.

## 콘텐츠 데이터 크기·성능 메모
- `data/activities` 폴더가 약 5MB로 번들되어 있으며, 레벨 프리로드/주차 로딩 시 메모리 사용과 초기 로딩 지연 가능성이 있음.

## 출시 전 Top 10 리스크/이슈
1) **백업/복구 부재**: 모든 핵심 상태가 단일 AsyncStorage에만 저장되어 기기 교체·앱 삭제 시 복구 불가. (대상: `store/*Store.ts` 전반)
2) **스토리지 마이그레이션 없음**: AsyncStorage 스키마 버전 관리나 마이그레이션 경로가 없어 구조 변경 시 데이터 손실 위험. (대상: `store/*Store.ts`)
3) **학습 데이터 용량/메모리**: 5MB 학습 데이터가 한 번에 번들/프리로드되어 저사양 기기에서 메모리 압박·초기 지연 가능. (대상: `data/activities`, `utils/activityLoader`)
4) **알림 푸시 미구성**: Expo Push Token에 실제 프로젝트 ID가 없고 서버 연동도 없어 원격 알림/스토어 심사 안내에 미비. (대상: `services/notificationService.ts`)
5) **알림 권한 UX**: 앱 시작 시 즉시 권한을 요청·스케줄링해 사용자가 이유를 듣기 전에 거부할 수 있음; 기획 의도(부담 없음)와 충돌. (대상: `app/_layout.tsx`, `store/userStore.ts`)
6) **Sentry 미세팅**: DSN 미설정 시 무효, 설정해도 릴리스 태그·소스맵 업로드/PII 필터링 부재로 실 운용품질 낮음. (대상: `utils/sentry.ts`, EAS 설정)
7) **UX 일관성**: Diary 외 탭(특히 Learn)에서 진행률/경고 UI가 남아 있어 “과정” 느낌을 여전히 줄 수 있음. (대상: `app/(tabs)/learn.tsx`)
8) **오프라인 일관성 검증 부족**: 대용량 학습 데이터/SRS와 투두·저널 동시 사용 시 저장 실패나 손상 시뮬레이션 테스트 부재. (대상: `store/*Store.ts`, `utils/srs.ts`)
9) **권한/스토어 심사 준비**: 마이크·알림 권한 문구 외에 개인정보/에러수집 고지, 알림 사용 목적 설명이 앱 내에 부족. (대상: `app.json`, 온보딩 화면 미기재)
10) **성능 관측 부재**: Sentry 성능 트레이싱/로그 레벨이 기본값이고 로딩 지연 시 원인 파악 어려움; 캐싱/지연 로드 전략 미흡. (대상: `utils/sentry.ts`, `app/(tabs)/learn.tsx`)

## 로드맵 (우선순위 제안)
### 다음 2일 (Quick Wins)
- 알림 요청 시점 지연: Diary 첫 입력 이후 또는 설정 화면에서 권한 요청하도록 변경(부담 최소). 파일: `app/_layout.tsx`, `store/userStore.ts`.
- Learn 헤더 카피/경고 최소화: 진행률 막대/경고를 숨기거나 “기록용” 톤으로 조정. 파일: `app/(tabs)/learn.tsx`.
- Sentry 기본 설정 보완: DSN 환경변수 주입 여부 확인, 릴리스 이름만이라도 `app.json` 버전으로 태깅. 파일: `utils/sentry.ts`, EAS 빌드 설정.

### 다음 2주 (Must-do)
- 백업/내보내기 추가: AsyncStorage 덤프를 파일/클라우드에 수동 내보내기·가져오기 옵션 제공. 파일: `store/*Store.ts`, 새 `utils/backup.ts`.
- 스토리지 마이그레이션 버전 도입: `persist` 옵션에 version/migrate 추가, 주요 스토어에 스키마 버전 정의. 파일: `store/journalStore.ts`, `store/taskStore.ts`, `store/learnStore.ts`, `store/srsStore.ts`, `store/userStore.ts`.
- 학습 데이터 지연 로드: 필요 레벨만 온디맨드 로딩·LRU 캐시, 초기 탭에서는 요약만. 파일: `utils/activityLoader`, `app/(tabs)/learn.tsx`.
- 알림/권한 안내 화면: 온보딩 또는 설정에서 알림/마이크/에러 수집 목적·옵션 명시. 파일: `app/(tabs)/index.tsx` 또는 별도 설정 스크린.
- PII/오프라인 안전성 테스트: 스토어 손상/저장 실패 시 복구 시나리오와 테스트 스크립트 작성. 파일: `store/*Store.ts`, 테스트 스크립트.

### 이후 (Nice-to-have)
- Diary 중심 타임라인화: Todo/Learn/Break 활동을 일기 항목의 태그/액티비티로 통합 표시. 파일: `app/(tabs)/index.tsx`, `store/journalStore.ts`.
- 성능 계측 추가: Sentry 트레이스 샘플링/로깅 조건 개선, 느린 로드 구간에 지표 삽입. 파일: `utils/sentry.ts`, `utils/activityLoader`.
- 노트 자동 저장/동기 제스처: Diary 입력 자동 저장 및 멀티라인 편집 UX 개선. 파일: `app/(tabs)/index.tsx`, `store/journalStore.ts`.

## 파일 포인터
- 네비게이션: `app/_layout.tsx`, `app/(tabs)/_layout.tsx`
- 다이어리/저널 저장: `store/journalStore.ts`
- 투두 저장: `store/taskStore.ts`
- 학습 진행/콘텐츠 로딩: `store/learnStore.ts`, `utils/activityLoader`
- SRS/복습: `store/srsStore.ts`
- 알림: `services/notificationService.ts`, `store/userStore.ts`
- 오류 추적: `utils/sentry.ts`
- 콘텐츠 데이터: `data/activities/`
