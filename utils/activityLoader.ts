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

// ─────────────────────────────────────
// CEFR 레벨 타입 정의
// ─────────────────────────────────────

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';

export const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

export const CEFR_LEVEL_INFO: Record<CEFRLevel, { name: string; description: string }> = {
  A1: { name: 'Beginner', description: 'Basic phrases and expressions' },
  A2: { name: 'Elementary', description: 'Everyday expressions and simple sentences' },
  B1: { name: 'Intermediate', description: 'Main points and simple connected text' },
  B2: { name: 'Upper Intermediate', description: 'Complex text and abstract topics' },
};

// ─────────────────────────────────────
// 동적 로딩 캐시 및 인프라
// ─────────────────────────────────────

type ActivityCache = Record<CEFRLevel, Record<ActivityType, Record<string, Activity>> | null>;

// 레벨별 캐시 (동적 로딩된 데이터 저장)
const activityCache: ActivityCache = {
  A1: null,
  A2: null,
  B1: null,
  B2: null,
};

// 레벨별 로딩 상태
const loadingPromises: Record<CEFRLevel, Promise<void> | null> = {
  A1: null,
  A2: null,
  B1: null,
  B2: null,
};

// 레벨이 로드되었는지 확인
export function isLevelLoaded(level: CEFRLevel): boolean {
  return activityCache[level] !== null;
}

// 단일 활동 파일 동적 로드
async function loadActivityFile(
  level: CEFRLevel,
  type: ActivityType,
  weekNum: number
): Promise<Activity> {
  const levelLower = level.toLowerCase();
  const typeToFile: Record<ActivityType, string> = {
    vocabulary: 'vocab',
    grammar: 'grammar',
    listening: 'listening',
    reading: 'reading',
    speaking: 'speaking',
    writing: 'writing',
  };
  const fileName = `week-${weekNum}-${typeToFile[type]}`;

  // 동적 import 사용
  const module = await import(`@/data/activities/${levelLower}/${type}/${fileName}.json`);
  return module.default as Activity;
}

// 레벨 전체 프리로드
export async function preloadLevel(level: CEFRLevel): Promise<void> {
  // 이미 로드되었으면 스킵
  if (activityCache[level] !== null) {
    return;
  }

  // 이미 로딩 중이면 기존 Promise 반환
  if (loadingPromises[level] !== null) {
    return loadingPromises[level]!;
  }

  // 로딩 시작
  loadingPromises[level] = (async () => {
    const types: ActivityType[] = [
      'vocabulary',
      'grammar',
      'listening',
      'reading',
      'speaking',
      'writing',
    ];

    const levelData: Record<ActivityType, Record<string, Activity>> = {
      vocabulary: {},
      grammar: {},
      listening: {},
      reading: {},
      speaking: {},
      writing: {},
    };

    // 병렬로 모든 활동 로드
    const promises: Promise<void>[] = [];

    for (const type of types) {
      for (let week = 1; week <= 8; week++) {
        promises.push(
          loadActivityFile(level, type, week).then((activity) => {
            levelData[type][`week-${week}`] = activity;
          })
        );
      }
    }

    await Promise.all(promises);
    activityCache[level] = levelData;
    loadingPromises[level] = null;
  })();

  return loadingPromises[level]!;
}

// ─────────────────────────────────────
// A1 레벨: 동적 로딩 사용 (preloadLevel('A1') 필요)
// ─────────────────────────────────────

// ─────────────────────────────────────
// A2 레벨: 동적 로딩 사용 (preloadLevel('A2') 필요)
// ─────────────────────────────────────

// ─────────────────────────────────────
// B1 레벨: 동적 로딩 사용 (preloadLevel('B1') 필요)
// ─────────────────────────────────────

// ─────────────────────────────────────
// B2 레벨: 동적 로딩 사용 (preloadLevel('B2') 필요)
// ─────────────────────────────────────

// ─────────────────────────────────────
// 데이터 맵 (모든 레벨 동적 로딩 사용)
// ─────────────────────────────────────

type ActivityData = Record<ActivityType, Record<string, Activity>>;
type LevelActivityData = Partial<Record<CEFRLevel, ActivityData>>;

// 모든 레벨이 동적 로딩을 사용하므로 ACTIVITIES는 빈 객체
// 레거시 호환성을 위해 유지
const ACTIVITIES: LevelActivityData = {
  // A1: 동적 로딩 사용 (preloadLevel('A1') 호출 필요)
  // A2: 동적 로딩 사용 (preloadLevel('A2') 호출 필요)
  // B1: 동적 로딩 사용 (preloadLevel('B1') 호출 필요)
  // B2: 동적 로딩 사용 (preloadLevel('B2') 호출 필요)
};

// ─────────────────────────────────────
// 활동 로더 함수
// ─────────────────────────────────────

/**
 * 특정 레벨과 주차의 활동 데이터 로드
 * 캐시를 먼저 확인하고, 없으면 정적 ACTIVITIES에서 조회
 */
export function loadActivity(
  level: CEFRLevel,
  type: ActivityType,
  weekId: string
): Activity | null {
  // 1. 캐시에서 먼저 확인 (동적 로딩된 데이터)
  const cachedLevel = activityCache[level];
  if (cachedLevel) {
    const cachedType = cachedLevel[type];
    if (cachedType && cachedType[weekId]) {
      return cachedType[weekId];
    }
  }

  // 2. 정적 ACTIVITIES에서 조회 (아직 마이그레이션되지 않은 레벨)
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
  };

  return labels[level] || level;
}

/**
 * 총 활동 수 반환
 */
export function getTotalActivitiesCount(): number {
  return CEFR_LEVELS.length * 8 * 6; // 4 levels * 8 weeks * 6 activities = 192
}

/**
 * 특정 레벨의 활동 수 반환
 */
export function getLevelActivitiesCount(level: CEFRLevel): number {
  return 8 * 6; // 8 weeks * 6 activities = 48
}
