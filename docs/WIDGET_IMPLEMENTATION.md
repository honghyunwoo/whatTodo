# 위젯 구현 가이드

## 개요

홈 화면 위젯을 통해 사용자가 앱을 열지 않고도 정보를 확인할 수 있습니다.

### 위젯 기능 계획

| 위젯 | 플랫폼 | 표시 정보 |
|------|--------|-----------|
| 학습 진행률 | Android/iOS | 오늘 학습 현황, 스트릭 |
| Todo 목록 | Android/iOS | 오늘 할 일 목록 |
| 2048 점수 | Android | 최고 점수, 빠른 시작 버튼 |

---

## Android 위젯 구현

### 방법 1: expo-widgets (실험적)

```bash
npx expo install expo-widgets
```

### 방법 2: react-native-android-widget

Bare workflow 필요:
```bash
npx expo prebuild
npm install react-native-android-widget
```

### 위젯 컴포넌트 예시

```tsx
// widgets/LearnWidget.tsx
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function LearnWidget({ streak, todayProgress }) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
      }}
    >
      <TextWidget
        text={`🔥 ${streak}일 연속`}
        style={{ fontSize: 18, fontWeight: 'bold' }}
      />
      <TextWidget
        text={`오늘 진행률: ${todayProgress}%`}
        style={{ fontSize: 14, color: '#666' }}
      />
    </FlexWidget>
  );
}
```

---

## iOS 위젯 구현 (WidgetKit)

iOS 14+ 위젯은 Swift로 작성해야 합니다.

### 필요 사항
1. Bare workflow (expo prebuild)
2. Xcode
3. Swift 코드 작성

### App Groups 설정
앱과 위젯 간 데이터 공유를 위해 App Groups 설정 필요:

```json
// app.json
{
  "expo": {
    "ios": {
      "entitlements": {
        "com.apple.security.application-groups": ["group.com.whatTodo.shared"]
      }
    }
  }
}
```

---

## 데이터 공유 준비

위젯에서 앱 데이터에 접근하려면 공유 저장소가 필요합니다.

### utils/widgetData.ts

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WidgetData {
  streak: number;
  todayProgress: number;
  todayGoal: number;
  bestScore: number;
  pendingTodos: number;
  lastUpdated: string;
}

const WIDGET_DATA_KEY = '@whatTodo/widgetData';

/**
 * 위젯용 데이터 업데이트
 * 학습 완료, Todo 변경 등의 이벤트 시 호출
 */
export async function updateWidgetData(data: Partial<WidgetData>): Promise<void> {
  try {
    const existing = await getWidgetData();
    const updated: WidgetData = {
      ...existing,
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    await AsyncStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(updated));

    // 네이티브 위젯 갱신 트리거 (구현 필요)
    // await refreshWidgets();
  } catch (error) {
    console.warn('Failed to update widget data:', error);
  }
}

/**
 * 위젯용 데이터 조회
 */
export async function getWidgetData(): Promise<WidgetData> {
  try {
    const data = await AsyncStorage.getItem(WIDGET_DATA_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('Failed to get widget data:', error);
  }

  return {
    streak: 0,
    todayProgress: 0,
    todayGoal: 3,
    bestScore: 0,
    pendingTodos: 0,
    lastUpdated: new Date().toISOString(),
  };
}
```

---

## 구현 로드맵

### Phase 1: 데이터 준비 (현재 가능)
- [x] widgetData.ts 유틸리티 생성
- [ ] 앱 이벤트에서 위젯 데이터 업데이트 호출

### Phase 2: Android 위젯 (Bare Workflow 필요)
- [ ] expo prebuild 실행
- [ ] react-native-android-widget 설치
- [ ] 위젯 컴포넌트 구현
- [ ] android/app/src/main/res/xml/widget_info.xml 설정

### Phase 3: iOS 위젯 (Xcode 필요)
- [ ] WidgetKit Extension 추가
- [ ] Swift 위젯 구현
- [ ] App Groups 설정
- [ ] 데이터 공유 브릿지 구현

---

## 참고 자료

- [react-native-android-widget](https://github.com/nicobrinkkemper/react-native-android-widget)
- [Apple WidgetKit Documentation](https://developer.apple.com/documentation/widgetkit)
- [Expo Prebuild](https://docs.expo.dev/workflow/prebuild/)
- [App Groups (iOS)](https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_security_application-groups)

---

## 현재 상태

**Expo Managed Workflow 제한사항:**
- 네이티브 위젯은 Bare Workflow 필요
- `expo prebuild` 실행 후 구현 가능
- 현재는 위젯 데이터 준비 단계만 완료

향후 Bare Workflow로 전환 시 위젯 구현을 진행할 수 있습니다.
