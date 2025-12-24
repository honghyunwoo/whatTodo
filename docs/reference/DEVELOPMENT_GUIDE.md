# 개발 가이드라인

**목적**: 실수를 방지하고 일관된 코드 품질을 유지하기 위한 가이드

---

## 🎯 핵심 원칙

### 1. **같은 계층에서는 같은 라이브러리 사용**

```tsx
// ❌ 절대 금지
import { Pressable } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';

<GestureDetector gesture={panGesture}>
  <Pressable onPress={...}>  {/* 충돌! */}
    <Text>Click</Text>
  </Pressable>
</GestureDetector>

// ✅ 올바름
import { TouchableOpacity, GestureDetector } from 'react-native-gesture-handler';

<GestureDetector gesture={panGesture}>
  <TouchableOpacity onPress={...}>
    <Text>Click</Text>
  </TouchableOpacity>
</GestureDetector>
```

### 2. **독립적인 컴포넌트는 Pressable 사용 가능**

```tsx
// ✅ 안전 - GestureDetector 없음
import { Pressable } from 'react-native';

<Pressable onPress={handlePress}>
  <Text>간단한 버튼</Text>
</Pressable>
```

### 3. **복잡한 제스처는 gesture-handler 사용**

```tsx
// ✅ 드래그, 스와이프 등
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const panGesture = Gesture.Pan()
  .onUpdate((event) => { ... })
  .onEnd((event) => { ... });

<GestureDetector gesture={panGesture}>
  <Animated.View>{/* ... */}</Animated.View>
</GestureDetector>
```

---

## 📋 개발 전 체크리스트

새로운 컴포넌트를 만들기 전에 **항상** 확인하세요:

### Phase 1: 요구사항 분석
```
□ 어떤 인터랙션이 필요한가?
  □ 단순 클릭/탭 → Pressable
  □ 스와이프/드래그 → GestureDetector
  □ 복잡한 제스처 → GestureDetector + Gesture.Pan/Pinch 등

□ 부모 컴포넌트를 확인했는가?
  □ GestureDetector 안인가? → gesture-handler 컴포넌트 사용
  □ SwipeableRow 안인가? → gesture-handler 컴포넌트 사용
  □ 독립적인가? → Pressable 사용 가능

□ 애니메이션이 필요한가?
  □ YES → react-native-reanimated 사용
  □ NO → 기본 컴포넌트
```

### Phase 2: 구현
```
□ import 문이 올바른가?
  □ GestureDetector 사용 → gesture-handler에서 import
  □ Pressable만 사용 → react-native에서 import

□ 컴포넌트 계층이 올바른가?
  □ 같은 라이브러리 컴포넌트 사용
  □ 중첩 Pressable 없음
  □ stopPropagation 필요시 추가

□ 성능 최적화를 했는가?
  □ memo() 사용 (리스트 아이템)
  □ useCallback() 사용 (이벤트 핸들러)
  □ useMemo() 사용 (복잡한 계산)
```

### Phase 3: 테스트
```
□ 모바일에서 테스트했는가?
  □ 터치 반응 확인
  □ 제스처 동작 확인
  □ 스크롤과 충돌 없음 확인

□ 엣지 케이스 테스트
  □ 빠르게 연속 클릭
  □ 긴 누르기
  □ 여러 손가락 터치
```

---

## 🎨 컴포넌트 패턴

### 패턴 1: 간단한 버튼

```tsx
import React, { useCallback } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

export function SimpleButton({ onPress, title }) {
  const handlePress = useCallback(() => {
    onPress?.();
  }, [onPress]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        { opacity: pressed ? 0.7 : 1 }
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}
```

### 패턴 2: 스와이프 가능한 리스트 아이템

```tsx
import React, { useCallback } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SwipeableRow } from '@/components/common/SwipeableRow';

export function SwipeableListItem({ item, onPress, onDelete }) {
  const handlePress = useCallback(() => {
    onPress?.(item);
  }, [item, onPress]);

  return (
    <SwipeableRow
      rightAction={{
        icon: 'trash',
        color: '#FFFFFF',
        backgroundColor: '#FF3B30',
        onPress: onDelete,
      }}
      onSwipeLeft={onDelete}
    >
      <TouchableOpacity  {/* ✅ gesture-handler의 TouchableOpacity */}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {/* 내용 */}
      </TouchableOpacity>
    </SwipeableRow>
  );
}
```

### 패턴 3: 드래그 가능한 컴포넌트

```tsx
import React, { useMemo } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

export function DraggableBox() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate((event) => {
          translateX.value = event.translationX;
          translateY.value = event.translationY;
        })
        .onEnd(() => {
          // 애니메이션으로 원위치
          translateX.value = withSpring(0);
          translateY.value = withSpring(0);
        }),
    []
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.box, animatedStyle]}>
        {/* 내용 */}
      </Animated.View>
    </GestureDetector>
  );
}
```

### 패턴 4: 중첩된 터치 이벤트

```tsx
import React from 'react';
import { Pressable, View } from 'react-native';

export function CardWithButton() {
  const handleCardPress = () => {
    console.log('Card pressed');
  };

  const handleButtonPress = (e) => {
    // ✅ 부모로 이벤트 전파 막기
    e?.stopPropagation?.();
    console.log('Button pressed');
  };

  return (
    <Pressable onPress={handleCardPress}>
      <View>
        <Text>카드 내용</Text>
        <Pressable onPress={handleButtonPress}>
          <Text>버튼</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
```

---

## 🚫 금지 패턴

### ❌ 1. GestureDetector 안에 Pressable

```tsx
// ❌ 절대 금지
<GestureDetector gesture={panGesture}>
  <Pressable onPress={...}>
    <Text>Click</Text>
  </Pressable>
</GestureDetector>

// ✅ 올바름
import { TouchableOpacity } from 'react-native-gesture-handler';

<GestureDetector gesture={panGesture}>
  <TouchableOpacity onPress={...}>
    <Text>Click</Text>
  </TouchableOpacity>
</GestureDetector>
```

### ❌ 2. GestureHandlerRootView 없이 GestureDetector 사용

```tsx
// ❌ 작동 안 됨
function App() {
  return (
    <View>
      <GestureDetector gesture={panGesture}>
        {/* ... */}
      </GestureDetector>
    </View>
  );
}

// ✅ 올바름
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={panGesture}>
        {/* ... */}
      </GestureDetector>
    </GestureHandlerRootView>
  );
}
```

### ❌ 3. 불필요한 re-render

```tsx
// ❌ 매번 새로운 함수 생성
<Pressable onPress={() => handlePress(item)}>

// ✅ useCallback 사용
const handlePress = useCallback(() => {
  doSomething(item);
}, [item]);

<Pressable onPress={handlePress}>
```

---

## 📚 참고할 기존 코드

### 모범 사례

1. **components/game/GameBoard.tsx**
   - GestureDetector + Gesture.Pan 완벽 구현
   - 복잡한 제스처 처리 패턴
   - 성능 최적화 (memo, useCallback, useMemo)

2. **components/common/SwipeableRow.tsx**
   - 스와이프 제스처 재사용 컴포넌트
   - 애니메이션 처리
   - 햅틱 피드백

3. **components/todo/TaskItem.tsx**
   - SwipeableRow 내부에서 TouchableOpacity 사용
   - 올바른 제스처 처리

### 코드 참고 순서

```
1. 비슷한 인터랙션을 하는 기존 컴포넌트 찾기
   ↓
2. 해당 컴포넌트의 패턴 분석
   ↓
3. 동일한 라이브러리/패턴 사용
   ↓
4. 필요시 수정 및 확장
```

---

## 🔍 디버깅 가이드

### 터치가 작동하지 않을 때

1. **GestureHandlerRootView 확인**
   ```tsx
   // app/_layout.tsx에서 확인
   <GestureHandlerRootView style={{ flex: 1 }}>
   ```

2. **라이브러리 혼용 확인**
   ```bash
   # Pressable과 GestureDetector 동시 사용 확인
   grep -r "from 'react-native'" | grep Pressable
   grep -r "GestureDetector"
   ```

3. **부모 컴포넌트 확인**
   - 부모가 GestureDetector인가?
   - 부모가 터치 이벤트를 막고 있는가?

4. **zIndex 확인**
   ```tsx
   // 터치 영역이 다른 요소에 가려져 있을 수 있음
   <View style={{ zIndex: 1 }}>
   ```

5. **pointerEvents 확인**
   ```tsx
   // pointerEvents="none"이면 터치 불가
   <View pointerEvents="auto">  {/* 또는 "box-none" */}
   ```

### 제스처가 충돌할 때

1. **simultaneousHandlers 사용**
   ```tsx
   const panGesture = Gesture.Pan()
     .simultaneousWithExternalGesture(scrollGesture);
   ```

2. **activeOffset 조정**
   ```tsx
   const panGesture = Gesture.Pan()
     .activeOffsetX([-10, 10])  // 좌우 10px 이동 후 활성화
     .activeOffsetY([-10, 10]); // 상하 10px 이동 후 활성화
   ```

3. **failOffsetY 사용 (수평 제스처 우선)**
   ```tsx
   const panGesture = Gesture.Pan()
     .failOffsetY([-20, 20]);  // 수직 20px 이상 이동 시 실패
   ```

---

## 🎓 교육 자료

### 신규 개발자 온보딩

1. **필수 읽기**
   - [TOUCH_GESTURE_GUIDE.md](./TOUCH_GESTURE_GUIDE.md)
   - [CODEBASE_HEALTH_REPORT.md](./CODEBASE_HEALTH_REPORT.md)
   - 현재 문서 (DEVELOPMENT_GUIDELINES.md)

2. **실습 과제**
   - [ ] 간단한 버튼 컴포넌트 만들기 (Pressable)
   - [ ] 스와이프 가능한 리스트 아이템 만들기 (SwipeableRow)
   - [ ] 드래그 가능한 박스 만들기 (GestureDetector)

3. **코드 리뷰 포인트**
   - [ ] 올바른 라이브러리 사용
   - [ ] 성능 최적화 (memo, useCallback)
   - [ ] 접근성 고려 (accessibilityLabel)

---

## ✅ PR 체크리스트

Pull Request를 올리기 전에 확인:

### 코드 품질
```
□ 올바른 import 사용 (react-native vs gesture-handler)
□ 성능 최적화 적용 (memo, useCallback, useMemo)
□ 타입스크립트 타입 정의
□ 주석 추가 (복잡한 로직)
```

### 터치/제스처
```
□ 모바일에서 터치 테스트 완료
□ 제스처 충돌 없음
□ 스크롤과 충돌 없음
□ 햅틱 피드백 추가 (필요시)
```

### 문서화
```
□ 새로운 패턴이면 가이드 업데이트
□ 복잡한 제스처는 주석 설명
□ README 업데이트 (필요시)
```

---

## 🔄 버전 관리

### 라이브러리 업데이트 시

```bash
# 항상 같이 업데이트
npm update react-native-gesture-handler
npm update react-native-reanimated

# 테스트
npm run typecheck
npm test

# 모바일 테스트
expo start
```

### 주요 버전 변경 시

1. **Breaking Changes 확인**
   - [gesture-handler changelog](https://github.com/software-mansion/react-native-gesture-handler/releases)
   - [reanimated changelog](https://github.com/software-mansion/react-native-reanimated/releases)

2. **마이그레이션 가이드 읽기**

3. **전체 테스트**
   - 모든 터치 인터랙션
   - 모든 제스처
   - 성능 측정

---

## 📞 도움 요청

### 막혔을 때

1. **문서 먼저 확인**
   - TOUCH_GESTURE_GUIDE.md
   - 공식 문서

2. **기존 코드 참고**
   - GameBoard.tsx
   - SwipeableRow.tsx
   - TaskItem.tsx

3. **질문하기**
   - 어떤 인터랙션을 구현하려는가?
   - 어떤 문제가 발생했는가?
   - 어떤 시도를 했는가?

---

**작성일**: 2025-12-23
**마지막 업데이트**: 2025-12-23
**버전**: 1.0.0
