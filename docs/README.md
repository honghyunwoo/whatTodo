# ⚠️ 문서 읽기 전에

**반드시 이 순서대로 읽으세요!**

---

## 📖 문서 읽기 순서

### 1. 🔥 **CURRENT_STATE.md** (가장 중요!)

**반드시 여기서부터 시작하세요!**

- 현재 앱 상태
- 최신 정보 (레벨, 활동 수, 기술 스택)
- 알려진 문제
- 다음 세션 시작점

**경로**: `docs/CURRENT_STATE.md`

---

### 2. 📊 **execution/whatTodo_심층_분석_보고서.md**

상세 분석 보고서:
- 전체 기능 목록
- 코드 품질 분석
- 개선 제안

**경로**: `docs/execution/whatTodo_심층_분석_보고서.md`

---

### 3. 🎯 **implementation/MASTER_PLAN.md**

전체 실행 계획:
- Phase 1-4 상세 계획
- 각 Task별 작업 내용
- 예상 타임라인
- 문서 관리 규칙

**경로**: `docs/implementation/MASTER_PLAN.md`

---

### 4. 📚 **reference/** (필요 시)

참고 자료:
- `TOUCH_GESTURE_GUIDE.md`: 터치/제스처 가이드
- `DEVELOPMENT_GUIDE.md`: 개발 가이드

**경로**: `docs/reference/`

---

## ❌ 절대 읽지 마세요!

### `archive/` 폴더

오래된 문서들이 보관되어 있습니다.

**문제점**:
- ❌ 4개 레벨(A1-B2)이라고 잘못 기재 (실제: 6개 A1-C2)
- ❌ 192개 활동이라고 잘못 기재 (실제: 288개)
- ❌ 오래된 분석 정보

**경로**: `docs/archive/` - 참고용으로만 보관

---

## 📁 문서 구조

```
docs/
├── README.md                    ← 이 파일
├── CURRENT_STATE.md            ← 🔥 항상 여기부터!
│
├── execution/                   ← 분석 보고서
│   └── whatTodo_심층_분석_보고서.md
│
├── implementation/              ← 실행 계획
│   ├── MASTER_PLAN.md          ← 전체 Phase 계획
│   ├── phase-1-stability/
│   │   ├── PLAN.md
│   │   ├── PROGRESS.md
│   │   ├── CHANGES.md
│   │   └── COMPLETE.md (완료 시)
│   ├── phase-2-quality/
│   ├── phase-3-ux/
│   └── phase-4-advanced/
│
├── reference/                   ← 참고 자료
│   ├── TOUCH_GESTURE_GUIDE.md
│   └── DEVELOPMENT_GUIDE.md
│
└── archive/                     ← ❌ 오래된 문서
    ├── 2025-12-23/
    │   ├── ARCHITECTURE_ANALYSIS.md
    │   ├── CODEBASE_HEALTH_REPORT.md
    │   └── ...
    └── README.md
```

---

## 🚀 새 세션 시작하기

1. **CURRENT_STATE.md 읽기**
   ```bash
   cat docs/CURRENT_STATE.md
   ```

2. **현재 Phase 확인**
   - Phase 1: 안정성 확보
   - Phase 2: 코드 품질
   - Phase 3: UX 개선
   - Phase 4: 고급 기능

3. **PROGRESS.md 확인**
   ```bash
   cat docs/implementation/phase-X-xxx/PROGRESS.md
   ```

4. **작업 시작!**

---

## 💡 팁

### Phase 작업 중
- 파일 수정 시 `CHANGES.md`에 기록
- 완료한 작업 `PROGRESS.md`에 체크
- 중요한 결정사항 `PLAN.md`에 추가

### 커밋 메시지
```
<type>(phase-X): <description>

Phase: X
Task: X.X
Files: file1.ts, file2.tsx
```

---

**마지막 업데이트**: 2025-12-24
**다음 Phase**: Phase 1 - 안정성 확보
