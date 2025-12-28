import {
  Activity,
  ActivityType,
  GrammarActivity,
  ListeningActivity,
  ReadingActivity,
  SpeakingActivity,
  VocabularyActivity,
  WritingActivity,
} from '@/types/activity';

// Import static activities data
import { ACTIVITIES } from '@/data/activities';

// ─────────────────────────────────────
// CEFR 레벨 타입 정의
// ─────────────────────────────────────

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const CEFR_LEVEL_INFO: Record<CEFRLevel, { name: string; description: string }> = {
  A1: { name: 'Beginner', description: 'Basic phrases and expressions' },
  A2: { name: 'Elementary', description: 'Everyday expressions and simple sentences' },
  B1: { name: 'Intermediate', description: 'Main points and simple connected text' },
  B2: { name: 'Upper Intermediate', description: 'Complex text and abstract topics' },
  C1: { name: 'Advanced', description: 'Complex ideas and implicit meaning' },
  C2: { name: 'Proficient', description: 'Near-native fluency and precision' },
};

// ─────────────────────────────────────
// 레벨 로딩 상태 (하위 호환성 유지)
// ─────────────────────────────────────

// 정적 import이므로 항상 로드됨
export function isLevelLoaded(_level: CEFRLevel): boolean {
  return true;
}

// 정적 import이므로 즉시 반환
export async function preloadLevel(_level: CEFRLevel): Promise<void> {
  return Promise.resolve();
}

// ─────────────────────────────────────
// 활동 로더 함수
// ─────────────────────────────────────

/**
 * 특정 레벨과 주차의 활동 데이터 로드
 */
export function loadActivity(
  level: CEFRLevel,
  type: ActivityType,
  weekId: string
): Activity | null {
  const levelActivities = ACTIVITIES[level];
  if (!levelActivities) return null;

  const typeActivities = levelActivities[type];
  if (!typeActivities) return null;

  return typeActivities[weekId] || null;
}

/**
 * 특정 레벨과 주차의 어휘 활동 로드
 */
export function loadVocabulary(level: CEFRLevel, weekId: string): VocabularyActivity | null {
  return loadActivity(level, 'vocabulary', weekId) as VocabularyActivity | null;
}

/**
 * 특정 레벨과 주차의 문법 활동 로드
 */
export function loadGrammar(level: CEFRLevel, weekId: string): GrammarActivity | null {
  return loadActivity(level, 'grammar', weekId) as GrammarActivity | null;
}

/**
 * 특정 레벨과 주차의 듣기 활동 로드
 */
export function loadListening(level: CEFRLevel, weekId: string): ListeningActivity | null {
  return loadActivity(level, 'listening', weekId) as ListeningActivity | null;
}

/**
 * 특정 레벨과 주차의 읽기 활동 로드
 */
export function loadReading(level: CEFRLevel, weekId: string): ReadingActivity | null {
  return loadActivity(level, 'reading', weekId) as ReadingActivity | null;
}

/**
 * 특정 레벨과 주차의 말하기 활동 로드
 */
export function loadSpeaking(level: CEFRLevel, weekId: string): SpeakingActivity | null {
  return loadActivity(level, 'speaking', weekId) as SpeakingActivity | null;
}

/**
 * 특정 레벨과 주차의 쓰기 활동 로드
 */
export function loadWriting(level: CEFRLevel, weekId: string): WritingActivity | null {
  return loadActivity(level, 'writing', weekId) as WritingActivity | null;
}

/**
 * 특정 레벨과 주차의 모든 활동 로드
 */
export function loadWeekActivities(level: CEFRLevel, weekId: string): Activity[] {
  const activities: Activity[] = [];

  const types: ActivityType[] = [
    'vocabulary',
    'grammar',
    'listening',
    'reading',
    'speaking',
    'writing',
  ];

  for (const type of types) {
    const activity = loadActivity(level, type, weekId);
    if (activity) {
      activities.push(activity);
    }
  }

  return activities;
}

/**
 * 특정 레벨의 모든 활동 로드
 */
export function loadLevelActivities(level: CEFRLevel): Activity[] {
  const activities: Activity[] = [];
  const weeks = ['week-1', 'week-2', 'week-3', 'week-4', 'week-5', 'week-6', 'week-7', 'week-8'];

  for (const weekId of weeks) {
    const weekActivities = loadWeekActivities(level, weekId);
    activities.push(...weekActivities);
  }

  return activities;
}

/**
 * 활동 ID로 활동 찾기
 */
export function findActivityById(activityId: string): Activity | null {
  const types: ActivityType[] = [
    'vocabulary',
    'grammar',
    'listening',
    'reading',
    'speaking',
    'writing',
  ];

  for (const level of CEFR_LEVELS) {
    for (const type of types) {
      const weekActivities = ACTIVITIES[level]?.[type];
      if (!weekActivities) continue;
      for (const weekId of Object.keys(weekActivities)) {
        const activity = weekActivities[weekId];
        if (activity && activity.id === activityId) {
          return activity;
        }
      }
    }
  }

  return null;
}

/**
 * 활동 타입별 아이콘 반환 (MaterialCommunityIcons 이름)
 */
export function getActivityIcon(type: ActivityType): string {
  const icons: Record<ActivityType, string> = {
    vocabulary: 'book-open-variant',
    grammar: 'book-alphabet',
    listening: 'headphones',
    reading: 'file-document-outline',
    speaking: 'microphone',
    writing: 'pencil',
  };

  return icons[type] || 'book';
}

/**
 * 활동 타입별 한글명 반환
 */
export function getActivityLabel(type: ActivityType): string {
  const labels: Record<ActivityType, string> = {
    vocabulary: '단어',
    grammar: '문법',
    listening: '듣기',
    reading: '읽기',
    speaking: '말하기',
    writing: '쓰기',
  };

  return labels[type] || type;
}

/**
 * 레벨별 한글명 반환
 */
export function getLevelLabel(level: CEFRLevel): string {
  const labels: Record<CEFRLevel, string> = {
    A1: '입문',
    A2: '초급',
    B1: '중급',
    B2: '중상급',
    C1: '고급',
    C2: '최고급',
  };

  return labels[level] || level;
}

/**
 * 총 활동 수 반환
 */
export function getTotalActivitiesCount(): number {
  return CEFR_LEVELS.length * 8 * 6; // 6 levels * 8 weeks * 6 activities = 288
}

/**
 * 특정 레벨의 활동 수 반환
 */
export function getLevelActivitiesCount(_level: CEFRLevel): number {
  return 8 * 6; // 8 weeks * 6 activities = 48
}
