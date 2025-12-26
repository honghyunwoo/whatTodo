# 🔍 Release/Merge Manager - 브랜치 분석 리포트

**분석일**: 2025-12-23
**분석 모드**: READ-ONLY
**Main Branch**: origin/main (65fcebd)
**미머지 브랜치**: 9개

---

## 📊 브랜치 분석 요약표

| # | 브랜치 | 파일 | 라인 | 변경 영역 | 위험도 | 충돌 | 단독PR |
|---|--------|------|------|----------|--------|------|---------|
| 1 | **claude/fix-mobile-touch-input** | 7 | +2600/-13 | docs(5), components(1), config(1) | 🟢 낮음 | 없음 | ✅ 가능 |
| 2 | **claude/resume-functionality** | 3 | +18/-10 | services, store, utils | 🟡 중간 | 3개 | ⚠️ 조건부 |
| 3 | **codex/add-backup-keys** | 4 | +224/0 | app, utils | 🟢 낮음 | 2개 | ✅ 가능 |
| 4 | **codex/add-store-rehydration** | 2 | +67/0 | utils | 🟢 낮음 | 1개 | ✅ 가능 |
| 5 | **claude/review-project-status** | 8 | +6808/-222 | data(6), docs(2), types(1) | 🟢 낮음 | 없음 | ✅ 가능 |
| 6 | **codex/implement-level-b** | 18 | +748/-90 | store(전체), app, utils | 🔴 높음 | 7개 | ❌ 불가 |
| 7 | **claude/review-app-performance** | 23 | +1052/-393 | components(15), config(2) | 🟡 중간 | 6개 | ⚠️ 조건부 |
| 8 | **claude/review-and-rebuild** | 17 | +3650/-143 | app, components, config | 🔴 높음 | 8개 | ❌ 불가 |
| 9 | **fix/notification-sdk-51** | 20 | +4618/-837 | app, services, config | 🔴 높음 | 9개 | ❌ 불가 |

---

## 🎯 브랜치 상세 분석

### 1. claude/fix-mobile-touch-input-9Am35 ✅ **최우선 추천**

**변경 내역**:
- 7 files changed, +2600/-13 lines

**변경 파일**:
```
✅ components/todo/TaskItem.tsx         (터치 버그 수정)
✅ docs/ARCHITECTURE_ANALYSIS.md        (신규, 850+ 줄)
✅ docs/CODEBASE_HEALTH_REPORT.md       (신규, 400+ 줄)
✅ docs/DEVELOPMENT_GUIDELINES.md       (신규, 500+ 줄)
✅ docs/README.md                       (신규, 200+ 줄)
✅ docs/TOUCH_GESTURE_GUIDE.md          (신규, 700+ 줄)
⚠️ tsconfig.json                        (설정 개선)
```

**변경 영역**:
- 📚 문서화 (5개 신규 문서)
- 🐛 버그 수정 (TaskItem 터치 이슈)
- ⚙️ 설정 개선 (TypeScript)

**위험도**: 🟢 **낮음**
- 문서만 추가 (5개)
- 컴포넌트 1개만 수정
- tsconfig.json 충돌 없음 (유일하게 수정)

**충돌 가능성**: **없음**
- 다른 브랜치와 파일 겹침 없음
- docs/ 폴더는 이 브랜치만 수정

**단독 PR 가능**: ✅ **가능**

**최근 커밋**:
```
14db228 Deep architecture analysis and TypeScript configuration fix
bd9ac69 Add comprehensive touch/gesture documentation and guidelines
892589b Fix mobile touch input by replacing Pressable with TouchableOpacity
```

**추천**: **즉시 머지 (1순위)**

---

### 2. claude/resume-functionality-zL4x9 ⚠️ **조건부 추천**

**변경 내역**:
- 3 files changed, +18/-10 lines

**변경 파일**:
```
⚠️ services/notificationService.ts     (3개 브랜치 수정)
⚠️ store/learnStore.ts                 (3개 브랜치 수정)
⚠️ utils/activityLoader.ts             (3개 브랜치 수정)
```

**변경 영역**:
- 🐛 프로덕션 크래시 수정
- 🔧 런타임 안정성 개선

**위험도**: 🟡 **중간**
- 작은 변경 (18줄 추가)
- 하지만 3개 파일 모두 충돌 가능

**충돌 가능성**: **높음 (3개 파일)**
```
충돌 위험:
- services/notificationService.ts
  └─ review-app-performance-zkWSf
  └─ fix/notification-sdk-51-compatibility

- store/learnStore.ts
  └─ review-app-performance-zkWSf
  └─ implement-level-b-refactor

- utils/activityLoader.ts
  └─ review-app-performance-zkWSf
  └─ fix/notification-sdk-51-compatibility
```

**단독 PR 가능**: ⚠️ **조건부**
- 다른 브랜치와 조정 필요
- 충돌 해결 후 가능

**최근 커밋**:
```
eb955b4 fix: resolve runtime crashes in production build
```

**추천**: **3순위** (충돌 브랜치 확인 후)

---

### 3. codex/add-backup-keys-and-update-ui-hints ✅ **추천**

**변경 내역**:
- 4 files changed, +224 insertions

**변경 파일**:
```
⚠️ app/(tabs)/_layout.tsx               (4개 브랜치 수정)
✅ app/(tabs)/backup.tsx                (신규)
⚠️ utils/backup.ts                      (3개 브랜치 수정)
⚠️ utils/index.ts                       (2개 브랜치 수정)
```

**변경 영역**:
- 💾 백업 기능 (user, game settings)
- 🎨 UI 힌트 업데이트

**위험도**: 🟢 **낮음**
- 주로 추가 코드 (224줄)
- 삭제 없음

**충돌 가능성**: **중간 (2개 파일)**
```
충돌 위험:
- app/(tabs)/_layout.tsx
  └─ 4개 브랜치 수정 (가장 위험)

- utils/backup.ts
  └─ 3개 브랜치 수정
```

**단독 PR 가능**: ✅ **가능** (충돌 해결 후)

**추천**: **4순위** (백업 기능 우선순위 판단 필요)

---

### 4. codex/add-store-rehydration-to-backup-utility ✅ **추천**

**변경 내역**:
- 2 files changed, +67 insertions

**변경 파일**:
```
⚠️ utils/backup.ts                      (3개 브랜치 수정)
⚠️ utils/index.ts                       (2개 브랜치 수정)
```

**변경 영역**:
- 💾 Store rehydration 기능

**위험도**: 🟢 **낮음**
- 작은 변경 (67줄)
- 추가만, 삭제 없음

**충돌 가능성**: **중간 (1개 파일)**
```
충돌 위험:
- utils/backup.ts
  └─ add-backup-keys와 함께 머지 가능
```

**단독 PR 가능**: ✅ **가능**
- codex/add-backup-keys 다음에 머지

**추천**: **5순위** (backup-keys와 세트)

---

### 5. claude/review-project-status-Hqz6i ✅ **추천**

**변경 내역**:
- 8 files changed, +6808/-222 lines

**변경 파일**:
```
✅ CONTENT_QUALITY_ROADMAP.md           (신규)
✅ FUTURE_IMPROVEMENTS.md               (신규)
✅ WHATTODO_COMPLETE_MASTER_PROMPT.md   (신규)
✅ WHATTODO_MASTER_PROMPT_SYSTEM.md     (신규)
✅ data/activities/a1/vocabulary/week-1-vocab.json
✅ data/activities/a1/vocabulary/week-2-vocab.json
✅ scripts/validate-exercises.js
✅ types/activity.ts
```

**변경 영역**:
- 📚 A1 Week 1, 2 어휘 추가 (50 words + 150 exercises)
- 📝 문서 4개 추가

**위험도**: 🟢 **낮음**
- 주로 data, docs 파일
- 다른 브랜치와 겹침 없음

**충돌 가능성**: **없음**

**단독 PR 가능**: ✅ **가능**

**추천**: **2순위** (학습 콘텐츠 추가)

---

### 6. codex/implement-level-b-refactor-for-diary-app 🔴 **위험**

**변경 내역**:
- 18 files changed, +748/-90 lines

**변경 파일**:
```
⚠️ app/(tabs)/_layout.tsx               (4개 브랜치 수정)
⚠️ app/(tabs)/game.tsx
⚠️ app/(tabs)/index.tsx
⚠️ app/(tabs)/learn.tsx                 (2개 브랜치 수정)
✅ app/(tabs)/todo.tsx
⚠️ app/_layout.tsx
⚠️ app/settings.tsx                     (3개 브랜치 수정)
✅ docs/backup_instructions.md
✅ docs/project_state_report.md
⚠️ store/gameStore.ts
⚠️ store/journalStore.ts
⚠️ store/learnStore.ts                  (3개 브랜치 수정)
⚠️ store/rewardStore.ts
⚠️ store/srsStore.ts
⚠️ store/streakStore.ts
⚠️ store/taskStore.ts
⚠️ store/userStore.ts
⚠️ utils/backup.ts                      (3개 브랜치 수정)
```

**변경 영역**:
- 🗂️ **모든 Store 파일 수정** (7개)
- 📱 모든 탭 레이아웃 수정
- 💾 백업 시스템 추가

**위험도**: 🔴 **높음**
- Store 전체 수정 (persist 마이그레이션)
- 18개 파일 (가장 광범위)
- 7개 파일 충돌

**충돌 가능성**: **매우 높음 (7개 파일)**
```
충돌 위험:
- app/(tabs)/_layout.tsx (4개 브랜치)
- store/learnStore.ts (3개 브랜치)
- utils/backup.ts (3개 브랜치)
- app/settings.tsx (3개 브랜치)
+ 추가 3개 파일
```

**단독 PR 가능**: ❌ **불가능**
- 다른 브랜치들과 광범위하게 충돌
- 백업 관련 브랜치들과 통합 필요

**최근 커밋**:
```
c334cff Add backup export/import and persist migrations
```

**추천**: **보류** (다른 브랜치 머지 후 재평가)

---

### 7. claude/review-app-performance-zkWSf 🟡 **조건부**

**변경 내역**:
- 23 files changed, +1052/-393 lines

**변경 파일**:
```
⚠️ app.json                             (3개 브랜치 수정)
⚠️ app/(tabs)/learn.tsx                 (2개 브랜치 수정)
⚠️ assets/notification-icon.png         (3개 브랜치 수정)
✅ components/common/AnimatedButton.tsx  (React.memo 추가)
✅ components/common/CircularProgress.tsx
✅ components/common/EmptyState.tsx
✅ components/common/LoadingSpinner.tsx
⚠️ components/game/ThemeSelector.tsx
✅ components/learn/LevelTestView.tsx
✅ components/learn/ReadingView.tsx
⚠️ components/learn/SpeechRecorder.tsx
✅ components/learn/WritingEditor.tsx
✅ components/learn/WritingFeedback.tsx
✅ components/learn/WritingView.tsx
✅ components/learn/exercises/Dictation.tsx
✅ components/todo/AddTaskModal.tsx      (타이머 cleanup 버그 수정)
✅ constants/sizes.ts
✅ data/activityRegistry.ts
⚠️ package-lock.json                    (3개 브랜치 수정)
⚠️ package.json                         (3개 브랜치 수정)
```

**변경 영역**:
- ⚡ 성능 최적화 (React.memo 추가)
- 🐛 버그 수정 (타이머 cleanup, key prop)
- 📦 패키지 업데이트

**위험도**: 🟡 **중간**
- 많은 파일 (23개)
- 하지만 대부분 독립적 개선
- 6개 파일 충돌

**충돌 가능성**: **높음 (6개 파일)**
```
충돌 위험:
- app.json (3개 브랜치)
- package.json (3개 브랜치)
- package-lock.json (3개 브랜치)
- services/notificationService.ts (3개 브랜치)
- utils/activityLoader.ts (3개 브랜치)
- store/learnStore.ts (3개 브랜치)
```

**단독 PR 가능**: ⚠️ **조건부**
- 설정 파일 충돌 해결 필요
- 성능 개선은 독립적

**최근 커밋**:
```
4481072 fix: add timer cleanup for parseTimeoutRef in AddTaskModal
22eb8b4 perf: add React.memo to common components
83def67 fix: replace key={index} anti-patterns with unique keys
```

**추천**: **6순위** (성능 개선 중요하지만 충돌 많음)

---

### 8. claude/review-and-rebuild-app-DWAr7 🔴 **위험**

**변경 내역**:
- 17 files changed, +3650/-143 lines

**변경 파일**:
```
⚠️ app.json                             (3개 브랜치 수정)
⚠️ app/(tabs)/_layout.tsx               (4개 브랜치 수정)
⚠️ app/(tabs)/settings.tsx              (2개 브랜치 수정)
⚠️ app/settings.tsx                     (3개 브랜치 수정)
⚠️ assets/notification-icon.png         (3개 브랜치 수정)
⚠️ assets/sounds/README.md              (2개 브랜치 수정)
⚠️ components/learn/KonglishAlert.tsx   (2개 브랜치 수정)
⚠️ components/learn/exercises/MinimalPairs.tsx (2개)
⚠️ components/learn/exercises/Shadowing.tsx (2개)
⚠️ components/learn/exercises/index.ts  (2개 브랜치 수정)
⚠️ components/learn/index.ts            (2개 브랜치 수정)
⚠️ docs/WIDGET_IMPLEMENTATION.md        (2개 브랜치 수정)
⚠️ package-lock.json                    (3개 브랜치 수정)
⚠️ package.json                         (3개 브랜치 수정)
⚠️ patches/expo-router+3.5.24.patch     (2개 브랜치 수정)
✅ scripts/enhance-content.ts
⚠️ utils/widgetData.ts                  (2개 브랜치 수정)
```

**변경 영역**:
- 🆕 새로운 학습 기능 (KonglishAlert, MinimalPairs, Shadowing)
- 📱 위젯 구현
- 🔧 인프라 개선

**위험도**: 🔴 **높음**
- 17개 파일 수정
- 8개 파일 충돌
- 큰 변경량 (3650줄)

**충돌 가능성**: **매우 높음 (8개 파일)**
```
모든 설정 파일 충돌:
- app.json, package.json, package-lock.json
- 여러 학습 컴포넌트 충돌
```

**단독 PR 가능**: ❌ **불가능**

**최근 커밋**:
```
f584b72 fix: remove unsupported app.json fields for Expo SDK 51
1b4734f chore: add notification icon for Android build
46de772 feat: add new learning features
```

**추천**: **보류** (notification-sdk-51과 통합 검토)

---

### 9. fix/notification-sdk-51-compatibility 🔴 **위험**

**변경 내역**:
- 20 files changed, +4618/-837 lines

**변경 파일**:
```
⚠️ app.json                             (3개 브랜치 수정)
⚠️ app/(tabs)/_layout.tsx               (4개 브랜치 수정)
⚠️ app/(tabs)/settings.tsx              (2개 브랜치 수정)
⚠️ app/settings.tsx                     (3개 브랜치 수정)
⚠️ assets/notification-icon.png         (3개 브랜치 수정)
⚠️ assets/sounds/README.md              (2개 브랜치 수정)
⚠️ components/learn/KonglishAlert.tsx   (2개)
⚠️ components/learn/exercises/* (3개)
⚠️ docs/WIDGET_IMPLEMENTATION.md        (2개)
⚠️ package-lock.json                    (3개)
⚠️ package.json                         (3개)
⚠️ patches/expo-router+3.5.24.patch     (2개)
✅ scripts/enhance-content.ts
✅ scripts/generateActivityLoader.js
⚠️ services/notificationService.ts      (3개)
⚠️ utils/activityLoader.ts              (3개)
⚠️ utils/widgetData.ts                  (2개)
```

**변경 영역**:
- 🔔 알림 SDK 51 호환성
- 📱 안드로이드 설정 수정
- 🆕 A2-C2 레벨 지원

**위험도**: 🔴 **매우 높음**
- 가장 많은 변경 (4618줄)
- 9개 파일 충돌
- 20개 파일 수정

**충돌 가능성**: **최고 (9개 파일)**
```
거의 모든 주요 파일과 충돌
```

**단독 PR 가능**: ❌ **불가능**

**최근 커밋**:
```
97a5ceb fix: remove android folder
7f26eb5 fix: downgrade Android SDK to 34
28fdbe6 feat: add A2-C2 level support
```

**추천**: **보류** (review-and-rebuild와 통합 검토)

---

## 🔥 예상 충돌 포인트 (TOP 10)

### 1. **app/(tabs)/_layout.tsx** 🔴🔴🔴🔴
**충돌 브랜치**: 4개
```
1. review-and-rebuild-app
2. add-backup-keys
3. implement-level-b-refactor
4. notification-sdk-51
```

**충돌 이유**: 모든 브랜치가 탭 레이아웃 수정

**해결 전략**:
- 수동 머지 필수
- 각 브랜치의 의도 파악 후 통합
- 우선순위: notification-sdk-51 (SDK 호환성)

---

### 2. **app.json** 🔴🔴🔴
**충돌 브랜치**: 3개
```
1. review-and-rebuild-app
2. review-app-performance
3. notification-sdk-51
```

**충돌 이유**: 설정 변경 (SDK, permissions, plugins)

**해결 전략**:
- notification-sdk-51 우선 (SDK 버전 중요)
- 다른 브랜치는 notification-sdk-51 기반으로 rebase

---

### 3. **package.json & package-lock.json** 🔴🔴🔴
**충돌 브랜치**: 3개
```
1. review-and-rebuild-app
2. review-app-performance
3. notification-sdk-51
```

**충돌 이유**: 패키지 추가/업데이트

**해결 전략**:
- 모든 변경 사항 수집
- 통합 후 `npm install` 재실행
- package-lock.json은 재생성

---

### 4. **services/notificationService.ts** 🔴🔴🔴
**충돌 브랜치**: 3개
```
1. resume-functionality
2. review-app-performance
3. notification-sdk-51
```

**충돌 이유**:
- resume-functionality: 크래시 수정
- notification-sdk-51: SDK 51 호환성

**해결 전략**:
- notification-sdk-51 우선
- resume-functionality의 버그 수정 체리픽

---

### 5. **utils/backup.ts** 🔴🔴🔴
**충돌 브랜치**: 3개
```
1. add-backup-keys
2. add-store-rehydration
3. implement-level-b-refactor
```

**충돌 이유**: 백업 기능 관련 브랜치들

**해결 전략**:
- 세 브랜치를 하나로 통합
- 순서: backup-keys → rehydration → level-b
- 또는 새 브랜치에서 통합

---

### 6. **utils/activityLoader.ts** 🔴🔴🔴
**충돌 브랜치**: 3개
```
1. resume-functionality
2. review-app-performance (간접)
3. notification-sdk-51
```

**해결 전략**:
- notification-sdk-51 우선 (A2-C2 지원)
- resume-functionality 버그 수정 체리픽

---

### 7. **store/learnStore.ts** 🔴🔴🔴
**충돌 브랜치**: 3개
```
1. resume-functionality
2. review-app-performance (간접)
3. implement-level-b-refactor
```

**해결 전략**:
- implement-level-b는 마지막에
- 다른 브랜치 먼저 머지

---

### 8-10. **학습 컴포넌트들** 🔴🔴
- components/learn/KonglishAlert.tsx (2개)
- components/learn/exercises/MinimalPairs.tsx (2개)
- components/learn/exercises/Shadowing.tsx (2개)

**충돌 브랜치**: review-and-rebuild ↔ notification-sdk-51

**해결 전략**:
- 두 브랜치 통합 검토
- 또는 하나 선택

---

## 📋 추천 머지 순서 (1→9)

### ✅ **Phase 1: 안전한 독립 브랜치** (즉시 가능)

#### **1순위: claude/fix-mobile-touch-input-9Am35** 🟢
```
이유:
✅ 충돌 없음 (tsconfig.json만 수정)
✅ 문서화 (5개 신규 문서)
✅ 버그 수정 (TaskItem 터치)
✅ 다른 브랜치에 영향 없음

머지 명령:
git checkout main
git merge --no-ff claude/fix-mobile-touch-input-9Am35
git push origin main
```

#### **2순위: claude/review-project-status-Hqz6i** 🟢
```
이유:
✅ 충돌 없음
✅ 학습 콘텐츠 추가 (A1 Week 1, 2)
✅ 독립적 data/ 파일

머지 명령:
git merge --no-ff claude/review-project-status-Hqz6i
git push origin main
```

---

### ⚠️ **Phase 2: 조건부 브랜치** (충돌 해결 후)

#### **3순위: claude/resume-functionality-zL4x9** 🟡
```
이유:
⚠️ 프로덕션 크래시 수정 (중요)
⚠️ 3개 파일 충돌 (notification-sdk-51과)
⚠️ 작은 변경 (18줄)

전제조건:
- notification-sdk-51 머지 상태 확인
- 충돌 시 체리픽 고려

머지 방법:
git checkout main
git merge claude/resume-functionality-zL4x9
# 충돌 시:
git checkout --theirs <conflicted-file>
# 수동 검토
```

#### **4순위: codex/add-backup-keys-and-update-ui-hints** 🟢
```
이유:
✅ 백업 기능 (user, game settings)
⚠️ utils/backup.ts 충돌

전제조건:
- rehydration과 함께 머지 검토

머지 순서:
1. add-backup-keys
2. add-store-rehydration (바로 다음)
```

#### **5순위: codex/add-store-rehydration-to-backup-utility** 🟢
```
이유:
✅ backup-keys와 세트
✅ 작은 변경 (67줄)

전제조건:
- backup-keys 먼저 머지

머지:
git merge --no-ff codex/add-store-rehydration-to-backup-utility
```

---

### 🔴 **Phase 3: 복잡한 브랜치** (통합 검토 필요)

#### **6순위: claude/review-app-performance-zkWSf** 🟡
```
이유:
⚡ 성능 최적화 (중요)
🐛 버그 수정들
⚠️ 6개 파일 충돌

전제조건:
- notification-sdk-51 통합 후
- 또는 설정 파일 수동 머지

머지 전략:
1. 성능 최적화 부분만 체리픽
2. 설정 파일은 나중에 통합
```

#### **7순위: 통합 브랜치 그룹** 🔴
```
그룹 A: review-and-rebuild + notification-sdk-51
- 두 브랜치 매우 유사
- 통합 검토 필요
- 하나 선택 또는 새 브랜치에서 통합

그룹 B: 백업 관련 3개
- implement-level-b-refactor
- 위 두 개와 통합

권장:
□ 각 그룹별 통합 브랜치 생성
□ 수동 머지
□ 테스트 후 main에 머지
```

---

## 🚨 **보류 추천**

### ❌ **codex/implement-level-b-refactor-for-diary-app**
```
보류 이유:
🔴 18개 파일 수정 (가장 광범위)
🔴 모든 Store 수정 (7개)
🔴 7개 파일 충돌
🔴 다른 브랜치들과 광범위하게 겹침

조치:
□ 다른 브랜치 모두 머지 후
□ main 기반으로 rebase
□ 또는 필요한 부분만 체리픽
```

### ❌ **claude/review-and-rebuild-app-DWAr7**
```
보류 이유:
🔴 notification-sdk-51과 거의 동일
🔴 8개 파일 충돌
🔴 3650줄 변경

조치:
□ notification-sdk-51과 비교
□ 차이점 파악 후 통합 또는 선택
```

### ❌ **fix/notification-sdk-51-compatibility**
```
보류 이유:
🔴 가장 많은 변경 (4618줄)
🔴 9개 파일 충돌
🔴 다른 모든 브랜치에 영향

조치:
□ review-and-rebuild와 통합 검토
□ 또는 우선 머지 후 다른 브랜치 rebase
```

---

## ✅ 다음 단계 체크리스트 (Phase 2 준비)

### **즉시 실행 가능 (Phase 1)**

```bash
□ 1. fix-mobile-touch-input 머지
  └─ 충돌 없음, 즉시 가능
  └─ 명령: git merge --no-ff claude/fix-mobile-touch-input-9Am35

□ 2. review-project-status 머지
  └─ 충돌 없음, 즉시 가능
  └─ 명령: git merge --no-ff claude/review-project-status-Hqz6i

□ 3. Main 푸시 및 확인
  └─ git push origin main
  └─ 빌드 테스트
```

### **준비 작업 (Phase 2 전)**

```bash
□ 4. 충돌 파일 분석
  └─ app.json diff 확인
  └─ package.json diff 확인
  └─ notificationService.ts diff 확인

□ 5. 백업 브랜치 통합 계획
  └─ backup-keys 검토
  └─ store-rehydration 검토
  └─ 통합 순서 결정

□ 6. 큰 브랜치들 정책 결정
  └─ notification-sdk-51 vs review-and-rebuild
  └─ 하나 선택 또는 통합
  └─ implement-level-b 처리 방법
```

### **통합 브랜치 생성 (권장)**

```bash
□ 7. 백업 기능 통합 브랜치
  └─ git checkout -b integrate/backup-features
  └─ 3개 백업 브랜치 통합
  └─ 테스트 후 main 머지

□ 8. 알림/SDK 통합 브랜치
  └─ git checkout -b integrate/notification-sdk
  └─ notification-sdk-51 + review-and-rebuild
  └─ 중복 제거, 충돌 해결

□ 9. 성능 개선 체리픽
  └─ review-app-performance에서
  └─ 충돌 없는 성능 최적화만 선택
```

### **테스트 계획**

```bash
□ 10. 각 머지 후 테스트
  └─ npm install
  └─ npm run typecheck
  └─ expo start (빌드 확인)
  └─ 주요 기능 테스트

□ 11. 최종 통합 테스트
  └─ 모든 브랜치 머지 후
  └─ E2E 테스트
  └─ 프로덕션 빌드
```

---

## 📊 **요약 대시보드**

### **머지 가능 브랜치**: 5개
```
✅ fix-mobile-touch-input      (즉시)
✅ review-project-status        (즉시)
✅ add-backup-keys             (조건부)
✅ add-store-rehydration       (조건부)
⚠️ resume-functionality        (조건부)
```

### **통합 필요 브랜치**: 4개
```
🔄 review-app-performance      (체리픽 가능)
🔄 review-and-rebuild          (통합 검토)
🔄 notification-sdk-51         (통합 검토)
🔄 implement-level-b           (보류)
```

### **총 변경량**
```
총 9개 브랜치
총 ~19,000 줄 변경
충돌 파일: 23개
독립 머지 가능: 2개
```

### **예상 소요 시간**
```
Phase 1 (즉시):     30분
Phase 2 (조건부):   2-3시간
Phase 3 (통합):     1-2일
```

---

## 🎯 **최종 권장사항**

### **즉시 실행**
1. ✅ `claude/fix-mobile-touch-input-9Am35` 머지
2. ✅ `claude/review-project-status-Hqz6i` 머지

### **단기 (이번 주)**
3. 백업 기능 브랜치 통합 (backup-keys + rehydration)
4. resume-functionality 체리픽 (크래시 수정만)

### **중기 (다음 주)**
5. notification-sdk-51 vs review-and-rebuild 통합 결정
6. review-app-performance 성능 최적화 체리픽
7. 통합 테스트 및 검증

### **장기 (필요시)**
8. implement-level-b-refactor 재평가
9. 불필요한 브랜치 정리
10. 브랜치 전략 재수립

---

**Report End** | 분석 완료 ✅
