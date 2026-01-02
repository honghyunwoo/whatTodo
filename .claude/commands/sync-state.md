---
description: state.json 현재 상태로 업데이트
---

.claude/state.json을 현재 상태로 업데이트:

1. 최근 커밋 3개 확인 (`git log --oneline -3`)
2. 파일 수 카운트:
   - `find . -name "*.ts" -o -name "*.tsx" | wc -l`
   - `ls components/**/*.tsx | wc -l`
3. 현재 작업 추론 (최근 커밋 기반)
4. state.json 업데이트:
   - lastUpdated: 오늘 날짜
   - currentWork: 최근 작업 요약
   - recentChanges: 최근 커밋 3개
   - statistics: 파일 수 업데이트
