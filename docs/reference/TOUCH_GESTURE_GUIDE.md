# React Native 터치/제스처 처리 완벽 가이드

## 📚 목차
1. [기초 개념](#1-기초-개념)
2. [React Native의 터치 시스템](#2-react-native의-터치-시스템)
3. [react-native-gesture-handler란?](#3-react-native-gesture-handler란)
4. [우리 프로젝트의 현재 상태](#4-우리-프로젝트의-현재-상태)
5. [문제점 분석](#5-문제점-분석)
6. [올바른 사용 패턴](#6-올바른-사용-패턴)
7. [단계별 개선 계획](#7-단계별-개선-계획)

---

## 1. 기초 개념

### 1.1 터치 이벤트란?
모바일에서 사용자가 화면을 누르면 발생하는 이벤트입니다:
- **touchStart**: 화면을 누르기 시작
- **touchMove**: 누른 채로 움직임
- **touchEnd**: 손가락을 뗌
- **touchCancel**: 터치가 취소됨 (예: 시스템 알림)

### 1.2 제스처란?
여러 터치 이벤트의 조합으로 만들어지는 사용자 행동:
- **Tap/Press**: 짧게 누르고 떼기
- **Long Press**: 길게 누르고 있기
- **Pan/Swipe**: 누른 채로 움직이기
- **Pinch**: 두 손가락으로 확대/축소
- **Rotation**: 두 손가락으로 회전

---

## 2. React Native의 터치 시스템

### 2.1 기본 컴포넌트

React Native는 3가지 기본 터치 컴포넌트를 제공합니다:

```tsx
// ❌ 구식 (deprecated)
<TouchableOpacity onPress={handlePress}>
  <Text>Click me</Text>
</TouchableOpacity>

// ❌ 구식 (deprecated)
<TouchableHighlight onPress={handlePress}>
  <Text>Click me</Text>
</TouchableHighlight>

// ✅ 권장 (현대적, 2020년 이후)
<Pressable onPress={handlePress}>
  <Text>Click me</Text>
</Pressable>
```

### 2.2 각 컴포넌트의 특징

| 컴포넌트 | 용도 | 장점 | 단점 |
|---------|------|------|------|
| TouchableOpacity | 간단한 버튼 | 쉬움 | 제한적 커스터마이징 |
| TouchableHighlight | 하이라이트 효과 | 시각적 피드백 | 성능 문제 |
| **Pressable** | 모든 터치 인터랙션 | 유연함, 최신 | 약간 복잡 |

### 2.3 Pressable의 장점

```tsx
<Pressable
  onPress={handlePress}
  onPressIn={handlePressIn}     // 누르기 시작
  onPressOut={handlePressOut}   // 손가락 뗌
  onLongPress={handleLongPress} // 길게 누름
  style={({ pressed }) => [
    styles.button,
    { opacity: pressed ? 0.5 : 1 }  // 동적 스타일링
  ]}
>
  <Text>Click me</Text>
</Pressable>
```

---

## 3. react-native-gesture-handler란?

### 3.1 왜 필요한가?

React Native의 기본 터치 시스템은 **JavaScript 스레드**에서 실행됩니다:
```
터치 발생 → Native → JavaScript Bridge → JavaScript → UI 업데이트
```

**문제점**:
- JavaScript가 바쁘면 터치 응답이 느려짐
- 복잡한 제스처 (스와이프, 핀치) 처리 어려움
- 60fps 유지 어려움

**react-native-gesture-handler의 해결책**:
```
터치 발생 → Native에서 직접 처리 → 결과만 JavaScript로 전달
```

### 3.2 핵심 원리

**기본 RN 터치**:
```tsx
// JavaScript 스레드에서 실행
<Pressable onPress={() => {
  // 이 코드는 JS 스레드에서 실행
  console.log('pressed');
}}>
```

**gesture-handler**:
```tsx
// Native 스레드에서 실행
<GestureDetector gesture={panGesture}>
  <View>
    {/* 제스처가 native에서 처리됨 */}
  </View>
</GestureDetector>
```

### 3.3 언제 사용하나?

| 상황 | 사용할 도구 | 이유 |
|------|------------|------|
| 간단한 버튼 클릭 | Pressable | 충분히 빠름 |
| 리스트 항목 클릭 | Pressable | 충분히 빠름 |
| 좌우 스와이프 | gesture-handler | 부드러운 애니메이션 |
| 드래그앤드롭 | gesture-handler | 실시간 추적 필요 |
| 복잡한 제스처 | gesture-handler | 성능 중요 |

---

## 4. 우리 프로젝트의 현재 상태

### 4.1 프로젝트 구조

```
app/
├── _layout.tsx              ← GestureHandlerRootView (최상위)
├── (tabs)/
│   ├── index.tsx           ← Todo 메인
│   ├── learn.tsx           ← 학습 메인
│   └── game.tsx            ← 게임 메인
components/
├── common/
│   └── SwipeableRow.tsx    ← 스와이프 제스처
├── game/
│   └── GameBoard.tsx       ← 게임 제스처
└── todo/
    └── TaskItem.tsx        ← 할일 아이템
```

### 4.2 설치된 라이브러리

```json
"react-native": "0.74.5",                      // 최신 버전
"react-native-gesture-handler": "~2.16.1",     // 최신 버전
"react-native-reanimated": "~3.10.1"           // 애니메이션 라이브러리
```

### 4.3 _layout.tsx 분석

```tsx
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>  ✅ 올바름!
      <SafeAreaProvider>
        <ThemeProvider>
          <PaperProvider>
            <AppContent />
          </PaperProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

**✅ 좋은 점**:
- GestureHandlerRootView가 최상위에 있음
- 이것이 모든 gesture-handler가 작동하는 기반

---

## 5. 문제점 분석

### 5.1 발견된 문제들

#### 문제 1: 혼용 패턴 🔴

**틀린 코드**:
```tsx
// SwipeableRow.tsx (GestureDetector 사용)
<GestureDetector gesture={panGesture}>
  <Animated.View>

    // TaskItem.tsx (React Native Pressable 사용) ❌
    <Pressable onPress={handlePress}>
      <Text>할일</Text>
    </Pressable>

  </Animated.View>
</GestureDetector>
```

**왜 문제인가?**:
1. GestureDetector는 **native 스레드**에서 터치 감지
2. Pressable은 **JavaScript 스레드**에서 터치 감지
3. 두 개가 충돌하여 터치 이벤트가 올바르게 전달 안 됨

**증상**:
- 터치가 안 먹힘
- 스와이프가 안 됨
- 버튼 클릭이 느림

#### 문제 2: 여러 곳에서 Pressable 사용 🟡

프로젝트에서 Pressable을 사용하는 곳:
```
✅ app/(tabs)/index.tsx        - GestureDetector 없음 (안전)
❌ components/todo/TaskItem.tsx - SwipeableRow 안 (위험)
✅ components/learn/FlashCard.tsx - 독립적 사용 (안전)
✅ components/calendar/MonthView.tsx - 독립적 사용 (안전)
```

---

## 6. 올바른 사용 패턴

### 6.1 규칙 1: 같은 계층에서는 같은 라이브러리 사용

```tsx
// ❌ 틀림
<GestureDetector gesture={panGesture}>
  <Pressable>  {/* React Native */}
  </Pressable>
</GestureDetector>

// ✅ 옳음
<GestureDetector gesture={panGesture}>
  <TouchableOpacity>  {/* gesture-handler */}
  </TouchableOpacity>
</GestureDetector>
```

### 6.2 규칙 2: 독립적인 컴포넌트는 Pressable 사용 가능

```tsx
// ✅ 옳음 - GestureDetector 없음
<Pressable onPress={handlePress}>
  <Text>간단한 버튼</Text>
</Pressable>

// ✅ 옳음 - 독립적 사용
<View>
  <Pressable onPress={handlePress}>
    <Text>다른 버튼</Text>
  </Pressable>
</View>
```

### 6.3 규칙 3: 제스처가 필요하면 gesture-handler 전체 사용

```tsx
// ✅ 옳음 - 일관성 있게 gesture-handler 사용
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { TouchableOpacity } from 'react-native-gesture-handler';

<GestureDetector gesture={panGesture}>
  <Animated.View>
    <TouchableOpacity onPress={handlePress}>
      <Text>스와이프 가능한 아이템</Text>
    </TouchableOpacity>
  </Animated.View>
</GestureDetector>
```

### 6.4 Import 패턴 정리

```tsx
// 간단한 버튼만 필요할 때
import { Pressable } from 'react-native';

// 제스처 + 버튼 둘 다 필요할 때
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

// ❌ 절대 이렇게 하지 말 것
import { Pressable } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
// 이 둘을 같이 쓰면 충돌 위험!
```

---

## 7. 단계별 개선 계획

### Phase 1: 전체 조사 ✅ (완료)
- [x] 모든 파일에서 Pressable, TouchableOpacity 찾기
- [x] GestureDetector 사용처 파악
- [x] 문제 패턴 식별

### Phase 2: TaskItem 수정 ✅ (완료)
- [x] TaskItem.tsx의 Pressable → TouchableOpacity 변경
- [x] SwipeableRow와 호환되도록 수정

### Phase 3: 전체 감사 (진행 예정)
- [ ] 모든 Pressable 사용처 검토
- [ ] GestureDetector 내부에 있는지 확인
- [ ] 필요시 TouchableOpacity로 교체

### Phase 4: 일관성 확립 (진행 예정)
- [ ] 코딩 가이드라인 작성
- [ ] ESLint 규칙 추가 (자동 검증)
- [ ] 팀 교육 자료 작성

### Phase 5: 성능 최적화 (진행 예정)
- [ ] 불필요한 re-render 제거
- [ ] memo(), useMemo(), useCallback() 적용
- [ ] 성능 측정 및 개선

---

## 📋 체크리스트: 새로운 터치 컴포넌트 만들 때

```
□ GestureDetector 안에 있나요?
  ├─ YES → TouchableOpacity (gesture-handler) 사용
  └─ NO  → Pressable (react-native) 사용 가능

□ 복잡한 제스처가 필요한가요? (스와이프, 드래그)
  ├─ YES → GestureDetector + gesture-handler 컴포넌트
  └─ NO  → Pressable로 충분

□ 애니메이션이 필요한가요?
  ├─ YES → react-native-reanimated + gesture-handler
  └─ NO  → 기본 컴포넌트 사용

□ 성능이 중요한가요? (리스트, 게임)
  ├─ YES → gesture-handler 사용 (native 스레드)
  └─ NO  → Pressable로 충분
```

---

## 🚨 흔한 실수들

### 실수 1: 중첩된 Pressable
```tsx
// ❌ 틀림 - 부모 Pressable이 자식의 터치를 가로챔
<Pressable onPress={handleParent}>
  <Pressable onPress={handleChild}>
    <Text>Click</Text>
  </Pressable>
</Pressable>

// ✅ 옳음 - stopPropagation 사용
<Pressable onPress={handleParent}>
  <Pressable onPress={(e) => {
    e.stopPropagation();
    handleChild();
  }}>
    <Text>Click</Text>
  </Pressable>
</Pressable>
```

### 실수 2: GestureDetector 안에 Pressable
```tsx
// ❌ 틀림
<GestureDetector gesture={panGesture}>
  <Pressable onPress={handlePress}>
    <Text>Click</Text>
  </Pressable>
</GestureDetector>

// ✅ 옳음
import { TouchableOpacity } from 'react-native-gesture-handler';

<GestureDetector gesture={panGesture}>
  <TouchableOpacity onPress={handlePress}>
    <Text>Click</Text>
  </TouchableOpacity>
</GestureDetector>
```

### 실수 3: GestureHandlerRootView 없음
```tsx
// ❌ 틀림
export default function App() {
  return (
    <View>
      <GestureDetector gesture={panGesture}>
        {/* 작동 안 됨! */}
      </GestureDetector>
    </View>
  );
}

// ✅ 옳음
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={panGesture}>
        {/* 작동함! */}
      </GestureDetector>
    </GestureHandlerRootView>
  );
}
```

---

## 🎯 핵심 정리

1. **Pressable vs TouchableOpacity**
   - Pressable: React Native 기본 (JS 스레드)
   - TouchableOpacity: gesture-handler 제공 (Native 스레드)

2. **언제 어떤 것을 쓰나?**
   - 간단한 버튼: Pressable
   - 제스처와 함께: TouchableOpacity (gesture-handler)

3. **절대 금지**
   - GestureDetector 안에 Pressable 사용
   - 같은 계층에 두 라이브러리 혼용

4. **필수 설정**
   - 최상위에 GestureHandlerRootView
   - 일관된 라이브러리 사용

---

## 📚 참고 자료

- [React Native Pressable 공식 문서](https://reactnative.dev/docs/pressable)
- [react-native-gesture-handler 공식 문서](https://docs.swmansion.com/react-native-gesture-handler/)
- [react-native-reanimated 공식 문서](https://docs.swmansion.com/react-native-reanimated/)

---

**작성일**: 2025-12-23
**버전**: 1.0.0
**상태**: 진행 중
