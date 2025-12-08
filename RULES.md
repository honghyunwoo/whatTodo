# What To Do? - 개발 규칙

> **작업 중 언제든 참고하세요!**

---

## 🚨 절대 규칙 (NEVER)

```
❌ 여러 작업 동시 진행
❌ TodoWrite 없이 작업 시작
❌ 테스트 없이 Git commit
❌ 코드 중복 (DRY 위반)
❌ 매직 넘버/문자열 직접 사용
❌ 파일 200줄 초과
❌ 함수 50줄 초과
❌ if-else 4단계 이상 중첩
❌ any 타입 사용
❌ console.log 커밋
```

---

## ✅ 항상 규칙 (ALWAYS)

```
✅ 작업 전 TodoWrite 작성
✅ 5-10분 단위로 태스크 분해
✅ 완료 즉시 체크표시
✅ 테스트 → Git commit
✅ 코드 중복 발견 시 즉시 리팩토링
✅ 상수는 constants/index.ts에
✅ 파일/폴더 알파벳 순 정렬
✅ import 문 정렬 (라이브러리 → 로컬)
✅ 불확실하면 사용자에게 질문
✅ 좋은 아이디어 즉시 제안
```

---

## 📁 파일/폴더 정렬

```
components/
├── common/          # 공통 (알파벳 순)
├── learn/           # 학습
└── todo/            # 투두

규칙:
1. 폴더 먼저, 파일 나중
2. 알파벳 순
3. index.tsx 맨 위
```

---

## 📦 Import 정렬 (8단계)

```typescript
import React from 'react';                    // 1. React
import { View } from 'react-native';          // 2. React Native
import { useNavigation } from '@...';         // 3. 라이브러리
import { create } from 'zustand';             // 4. 라이브러리

import { Task } from '@/types/task';          // 5. 타입
import { useTaskStore } from '@/store/...';   // 6. Hook/Store
import { Button } from '@/components/...';    // 7. 컴포넌트
import { COLORS } from '@/constants';         // 8. 상수
```

---

## 🎯 네이밍 규칙

```typescript
// 파일명
TaskList.tsx        // 컴포넌트: PascalCase
useTaskStore.ts     // Hook: use + camelCase
task.ts             // 타입/유틸: lowercase

// 코드
const taskList = [];              // 변수: camelCase
const MAX_TASKS = 100;            // 상수: UPPER_SNAKE_CASE
function addTask() {}             // 함수: camelCase
const TaskItem = () => {};        // 컴포넌트: PascalCase
interface Task {}                 // 타입: PascalCase
```

---

## 🔧 커밋 메시지

```
feat: 새 기능 추가
fix: 버그 수정
refactor: 리팩토링
chore: 설정/도구 변경
docs: 문서 작성
test: 테스트 추가
style: 코드 포맷팅 (기능 변경 없음)

예시:
✅ "feat(todo): add TaskList component"
✅ "fix(store): resolve AsyncStorage error"
❌ "update" (너무 모호)
❌ "fix bug" (구체적이지 않음)
```

---

## 📋 매 작업마다 체크

```
[ ] TodoWrite로 태스크 생성?
[ ] 5-10분 단위로 분해?
[ ] 이전 작업 완료 & 커밋?
[ ] 테스트 계획 있음?
[ ] 불확실한 부분 질문?
```

---

## 💾 커밋 전 체크

```
[ ] 코드 정리? (console.log 제거)
[ ] 타입 에러 0?
[ ] 테스트 통과?
[ ] 커밋 메시지 명확?
[ ] 코드 중복 없음?
[ ] 파일/폴더 정렬 OK?
[ ] 매직 넘버/문자열 상수화?
```

---

## 📝 파일 작성 후 체크

```
[ ] 파일 200줄 이하?
[ ] 함수 50줄 이하?
[ ] import 정렬 OK?
[ ] 네이밍 명확?
[ ] 중첩 3단계 이하?
[ ] 코드 중복 없음?
```

---

## 🛠️ 상수 사용 (매직 제거)

```typescript
// ❌ 나쁜 예
await AsyncStorage.setItem('tasks', data);
if (priority === 'high') { ... }
padding: 16;

// ✅ 좋은 예
await AsyncStorage.setItem(STORAGE_KEYS.TASKS, data);
if (priority === PRIORITY.HIGH) { ... }
padding: SIZES.spacing.md;
```

---

## 🧹 코드 중복 제거

```typescript
// ❌ 중복 있음
const saveTask = async (task) => { ... };
const saveSettings = async (settings) => { ... };

// ✅ 유틸 함수 추출
const saveToStorage = async <T>(key: string, data: T) => { ... };

// 사용
await saveToStorage(STORAGE_KEYS.TASKS, tasks);
await saveToStorage(STORAGE_KEYS.SETTINGS, settings);
```

---

## 🚦 Early Return 패턴

```typescript
// ❌ 중첩 깊음
function processTask(task: Task) {
  if (task) {
    if (task.completed) {
      if (task.priority === 'high') {
        // ...
      }
    }
  }
}

// ✅ Early return
function processTask(task: Task) {
  if (!task) return;
  if (!task.completed) return;
  if (task.priority !== 'high') return;

  // ...
}
```

---

## 🔍 스파게티 방지 체크

```
[ ] 200줄 넘는 파일? → 분리
[ ] 같은 로직 3곳 이상? → 공통 함수
[ ] if-else 3단계 이상? → Early return
[ ] 매직 넘버/문자열? → 상수
[ ] 함수 이름 불명확? → 리네이밍
[ ] import 10개 이상? → 리팩토링
```

---

## 🎨 React Native 최적화

```typescript
// React.memo (컴포넌트)
export const TaskItem = React.memo(({ task }) => { ... });

// useMemo (비싼 계산)
const filteredTasks = useMemo(() =>
  tasks.filter(t => t.completed),
  [tasks]
);

// useCallback (함수 전달)
const handlePress = useCallback(() => { ... }, []);

// FlatList 최적화
<FlatList
  data={tasks}
  keyExtractor={(item) => item.id}
  getItemLayout={...}  // 고정 높이 시
/>
```

---

## 📞 소통 규칙

```
✅ 좋은 아이디어? → 즉시 제안
✅ 불확실함? → 실행 전 확인
✅ 개선 방안? → 사용자에게 물어보기
✅ 에러 발생? → 상세히 설명
```

---

## 🎯 품질 기준

```
✅ 빌드 에러: 0
✅ 타입 에러: 0
✅ 테스트 통과: 100%
✅ 코드 중복: 0%
✅ 파일 200줄 이하
✅ 함수 50줄 이하
✅ 중첩 3단계 이하
```

---

## 📊 Git 전략

```
feature/task-crud        # 기능 브랜치
main                     # 메인 브랜치

워크플로우:
1. feature 브랜치 생성
2. 작은 단위로 커밋
3. 테스트 통과 확인
4. main으로 머지
5. feature 브랜치 삭제
```

---

## 🔑 핵심 가치

```
빠른 출시 < 제대로 만들기
복잡함 < 단순함
많은 기능 < 완성도
동시 작업 < 순차적 완성
```

---

**작업 중 헷갈리면 이 파일을 보세요!** 🚀
