/**
 * UUID v4 생성 함수
 * 폴백 방식으로 안전하게 ID 생성
 */
export function generateId(): string {
  // crypto.randomUUID() 안전하게 시도
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // 무시하고 폴백으로
  }

  // 폴백: 간단한 UUID v4 구현
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
