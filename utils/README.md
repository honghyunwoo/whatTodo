# Day 유틸리티 사용 가이드

## 개요

`day.ts`는 whatTodo의 핵심 개념인 "Day"를 구현한 유틸리티입니다.
Task, Diary, Journal Store를 통합하여 날짜별 데이터를 제공합니다.

## 핵심 개념

**Day = Todo + 일기 + 학습 기록**

하루의 모든 활동을 하나의 객체로 통합하여 제공합니다.

## 주요 함수

### getDayData(date: string): DayData

특정 날짜의 전체 데이터를 조회합니다.

```typescript
import { getDayData } from '@/utils/day';

const day = getDayData('2025-01-15');
console.log(day);
// {
//   date: '2025-01-15',
//   todos: [...],        // 해당 날짜의 Todo 리스트
//   diaryEntry: {...},   // 해당 날짜의 일기 (있다면)
//   journalEntry: {...}, // 해당 날짜의 학습 기록 (있다면)
//   summary: {
//     completedTodos: 3,
//     totalTodos: 5,
//     completionRate: 60,
//     learningTime: 15,
//     hasNote: true,
//     hasDiary: false,
//     insight: "괜찮은 하루예요 😊"
//   }
// }
```

### getTodayData(): DayData

오늘의 데이터를 조회합니다.

```typescript
import { getTodayData } from '@/utils/day';

const today = getTodayData();
console.log(`오늘 완료율: ${today.summary.completionRate}%`);
```

### getRecentDays(days: number): DayData[]

최근 N일의 데이터를 조회합니다 (최신순).

```typescript
import { getRecentDays } from '@/utils/day';

// 최근 7일
const week = getRecentDays(7);
week.forEach((day) => {
  console.log(`${day.date}: ${day.summary.completionRate}%`);
});
```

### getWeeklyActivity(): WeeklyActivity[]

주간 활동 데이터를 조회합니다 (차트용).

```typescript
import { getWeeklyActivity } from '@/utils/day';

const activities = getWeeklyActivity();
// [
//   { date: '2025-01-09', dayOfWeek: '월', completedCount: 3, learningTime: 15, hasActivity: true },
//   { date: '2025-01-10', dayOfWeek: '화', completedCount: 2, learningTime: 20, hasActivity: true },
//   ...
// ]
```

### getMonthSummaries(year: number, month: number): Record<string, DaySummary>

특정 월의 모든 날짜 요약 데이터 (캘린더 히트맵용).

```typescript
import { getMonthSummaries } from '@/utils/day';

const jan2025 = getMonthSummaries(2025, 1);
console.log(jan2025['2025-01-15'].completionRate); // 80
```

## React 컴포넌트에서 사용

### useMemo로 캐싱

```typescript
import { useMemo } from 'react';
import { getDayData } from '@/utils/day';

function DayView({ date }: { date: string }) {
  const dayData = useMemo(() => getDayData(date), [date]);

  return (
    <View>
      <Text>완료율: {dayData.summary.completionRate}%</Text>
      <Text>학습 시간: {dayData.summary.learningTime}분</Text>
    </View>
  );
}
```

### Store 변경 감지

```typescript
import { useTaskStore } from '@/store/taskStore';
import { getDayData } from '@/utils/day';

function TodayView() {
  const tasks = useTaskStore((state) => state.tasks);
  const today = useMemo(() => getTodayData(), [tasks.length]);

  return <Text>오늘 할 일: {today.summary.totalTodos}</Text>;
}
```

## 유틸리티 함수

### 날짜 형식 변환

```typescript
import { formatDateToString, parseStringToDate, getTodayString } from '@/utils/day';

// Date → 문자열
const dateStr = formatDateToString(new Date()); // "2025-01-15"

// 문자열 → Date
const date = parseStringToDate('2025-01-15');

// 오늘 문자열
const today = getTodayString(); // "2025-01-15"
```

### 색상/이모지 변환

```typescript
import { getColorByCompletionRate, getEmojiByCompletionRate } from '@/utils/day';

// 완료율 → 색상 (캘린더 히트맵)
const color = getColorByCompletionRate(80); // "#4CAF50"

// 완료율 → 이모지
const emoji = getEmojiByCompletionRate(100); // "🎉"
```

## 중요 참고사항

### 날짜 형식

모든 날짜는 **YYYY-MM-DD 형식의 문자열**을 사용합니다.

```typescript
// ✅ 올바른 형식
getDayData('2025-01-15');

// ❌ 잘못된 형식
getDayData('1/15/2025'); // 미국 형식 X
getDayData('2025-1-15'); // 패딩 없음 X
```

### 성능 고려사항

- `getDayData()`는 순수 함수입니다 (Store의 상태만 읽음).
- React 컴포넌트에서는 `useMemo`로 캐싱하세요.
- `getCurrentStreak()`는 최대 365번 호출되므로 자주 호출하지 마세요.

### Store와의 관계

Day 유틸리티는 **기존 Store를 건드리지 않습니다**.

- taskStore: Todo 데이터
- diaryStore: 일기 데이터
- journalStore: 학습 기록 데이터

→ Day는 이 세 Store를 **읽기만** 합니다.

## 예제: Day Page 구현

```typescript
import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { getDayData } from '@/utils/day';

export default function DayPage() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const dayData = useMemo(() => getDayData(date), [date]);

  return (
    <ScrollView>
      {/* Todo 타임라인 */}
      <View>
        {dayData.todos.map((todo) => (
          <Text key={todo.id}>{todo.title}</Text>
        ))}
      </View>

      {/* 자동 요약 */}
      <View>
        <Text>완료율: {dayData.summary.completionRate}%</Text>
        <Text>{dayData.summary.insight}</Text>
      </View>

      {/* 한 줄 기록 */}
      {dayData.journalEntry?.notes && (
        <Text>{dayData.journalEntry.notes}</Text>
      )}
    </ScrollView>
  );
}
```

## 타입 정의

전체 타입 정의는 `types/day.ts`를 참고하세요.

주요 타입:
- `DayData`: 하루 전체 데이터
- `DaySummary`: 자동 생성 요약
- `WeeklyActivity`: 주간 활동 데이터
