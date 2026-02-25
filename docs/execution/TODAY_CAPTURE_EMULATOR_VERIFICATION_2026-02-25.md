# TODAY_CAPTURE_EMULATOR_VERIFICATION_2026-02-25

Updated: 2026-02-25
Owner: hynoo (solo) + Codex
Scope: Today 3초 캡처 UX 실기기/에뮬레이터 검증

## A) 1-Page Diagnosis

### Problem

코드 변경은 완료됐지만, 실제 Android 화면에서 `엔터 저장`, `입력 타입 기억`, `최근 입력 칩 노출 규칙`이 제대로 동작하는지 증거가 필요했다.

### Root Cause

1. PR 설명/정적 테스트만으로는 키보드 done 이벤트와 포커스 흐름을 증명하기 어렵다.
2. UI 상태가 스플래시 타이밍에 걸리면 잘못된 판단을 할 수 있다.

### Priority

1. P0: `할일/메모` 엔터 즉시 저장 실증
2. P0: 앱 재시작 후 마지막 입력 타입(메모) 유지 실증
3. P0: 입력 중 `최근 입력` 칩 숨김 실증

### Risks

1. 에뮬레이터 좌표 탭이 빗나가면 오탐 가능
2. 스플래시 타이밍 덤프로 상태 오판 가능

### Controls

1. `uiautomator dump` + `screencap`을 세트로 기록
2. 핵심 문자열(`enter_save_226a`, placeholder 텍스트)로 검증
3. 스플래시 덤프 발생 시 재덤프

## B) This Week One Metric

- 이름: `캡처 실증 통과율`
- 정의: Top1 캡처 UX 핵심 시나리오 3개 중 통과 개수
- 목표: `3/3`
- 결과: `3/3` 통과

## C) UX Flow + Copy + States (검증 관점)

### 대상 플로우

1. 할일 입력 후 완료 키(Enter)로 저장
2. 메모 탭 선택 후 앱 재시작
3. 텍스트 입력 중 최근 입력 칩 노출 여부 확인

### 상태 체크 포인트

1. 저장 직후 최근 칩에 신규 값 노출
2. 재시작 후 placeholder가 메모 문구로 유지
3. 입력 중 XML에서 `최근 입력` 텍스트 미노출

## D) Verify Plan + DoD + Rollback

### DoD

1. `enter_save_226a`가 엔터 직후 최근 칩에 추가됨
2. 앱 재시작 후 EditText hint가 `떠오르는 생각을 자유롭게...`로 유지됨
3. 입력 중 dump에서 `최근 입력` 텍스트가 나타나지 않음

### Rollback

1. 문서 변경만 존재 (런타임 영향 없음)

## Reproduce / Validate

### Reproduce

1. 에뮬레이터 실행 후 앱 Today 화면 진입
2. 입력창 탭 -> 문자열 입력 -> Enter 키 전송
3. 메모 탭 선택 후 앱 강제 종료/재실행
4. 메모 입력 중 UI dump 수집

### Validate

1. `enter_save_226a`가 최근 입력 칩에 추가됨
2. 재시작 후 메모 placeholder 유지
3. 입력 중 최근 칩 숨김

### Commands

```bash
adb shell input tap 540 1430
adb shell input text enter_save_226a
adb shell input keyevent 66
adb shell uiautomator dump /sdcard/window_after_enter.xml
adb pull /sdcard/window_after_enter.xml _tmp_window_after_enter.xml
rg "enter_save_226a" _tmp_window_after_enter.xml

adb shell input tap 250 1230
adb shell uiautomator dump /sdcard/window_memo.xml
adb pull /sdcard/window_memo.xml _tmp_window_memo.xml
rg "떠오르는 생각을 자유롭게" _tmp_window_memo.xml

adb shell am force-stop com.honghyunwoo.whattodo
adb shell monkey -p com.honghyunwoo.whattodo -c android.intent.category.LAUNCHER 1
adb shell uiautomator dump /sdcard/window_after_restart2.xml
adb pull /sdcard/window_after_restart2.xml _tmp_window_after_restart2.xml
rg "떠오르는 생각을 자유롭게" _tmp_window_after_restart2.xml

adb shell input text typing_check_1
adb shell uiautomator dump /sdcard/window_typing.xml
adb pull /sdcard/window_typing.xml _tmp_window_typing.xml
rg "최근 입력|typing_check_1" _tmp_window_typing.xml
```

## Evidence Files (local)

1. `_tmp_verify_capture_enter_save_todo_after.png`
2. `_tmp_window_after_enter.xml`
3. `_tmp_verify_capture_after_restart2_memo_persist.png`
4. `_tmp_window_after_restart2.xml`
5. `_tmp_verify_capture_typing_recent_hidden.png`
6. `_tmp_window_typing.xml`
