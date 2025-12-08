/**
 * UUID v4 생성 함수
 * crypto.randomUUID() 사용 (React Native에서 지원)
 */
export function generateId(): string {
  // React Native 환경에서 crypto.randomUUID() 지원
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // 폴백: 간단한 UUID v4 구현
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
