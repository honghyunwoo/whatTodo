/**
 * Motivation Service
 *
 * 동기부여 메시지 시스템
 * - 스트릭 유지/위험 알림
 * - 복귀 환영 메시지
 * - 성취 축하
 * - 격려 메시지
 *
 * 핵심 기능:
 * 1. 톤 선택 (friendly, strict, playful)
 * 2. 쿨다운 (messageKey 기반, 문자열 변경과 독립)
 * 3. CTA 버튼 (바로 세션 시작)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/storage';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

/** 메시지 타입 */
export type MessageType =
  | 'streak_maintain' // "🔥 5일 연속!"
  | 'streak_danger' // "😰 오늘 학습하면 유지!"
  | 'comeback' // "📚 돌아오셨네요!"
  | 'achievement' // "🎉 이번 주 목표 달성!"
  | 'encouragement'; // "💪 조금만 더!"

/** 메시지 톤 */
export type MessageTone = 'friendly' | 'strict' | 'playful';

/**
 * 메시지 키 (쿨다운 추적용)
 * 중요: 문자열 변경과 독립적으로 쿨다운 관리
 */
export type MessageKey =
  // Streak related
  | 'streak_danger_v1'
  | 'streak_maintain_v1'
  | 'streak_milestone_7_v1'
  | 'streak_milestone_30_v1'
  | 'streak_milestone_100_v1'
  // Comeback
  | 'comeback_short_v1' // 1-3일 부재
  | 'comeback_medium_v1' // 4-7일 부재
  | 'comeback_long_v1' // 7일+ 부재
  // Achievement
  | 'achievement_weekly_v1'
  | 'achievement_lesson_v1'
  | 'achievement_level_up_v1'
  // Encouragement
  | 'encouragement_almost_v1'
  | 'encouragement_start_v1'
  | 'encouragement_progress_v1';

/** CTA (Call To Action) */
export interface MessageCTA {
  label: string;
  action: 'start_quick_session' | 'start_lesson' | 'view_stats' | 'none';
  sessionMinutes?: number; // start_quick_session용
}

/** 동기부여 메시지 */
export interface MotivationMessage {
  key: MessageKey; // 쿨다운 추적용 (필수!)
  type: MessageType;
  tone: MessageTone;
  emoji: string;
  title: string;
  message: string;
  cta?: MessageCTA;
}

/** 사용자 통계 (메시지 선택용) */
export interface UserStats {
  currentStreak: number;
  lastStudyDate: string | null;
  todayCompleted: boolean;
  weeklyProgress: number; // 0-100
  isStreakAtRisk: boolean;
  daysSinceLastStudy: number;
}

/** 쿨다운 설정 */
interface CooldownConfig {
  sameMessageCooldownDays: number; // 같은 메시지 쿨다운 (일)
  lastShown: Record<MessageKey, string>; // key → ISO date
}

// ─────────────────────────────────────
// Message Templates
// ─────────────────────────────────────

const MESSAGES: Record<MessageTone, Record<MessageKey, Omit<MotivationMessage, 'key' | 'tone'>>> = {
  friendly: {
    streak_danger_v1: {
      type: 'streak_danger',
      emoji: '😰',
      title: '스트릭이 위험해요!',
      message: '오늘 학습하면 스트릭을 유지할 수 있어요. 2분만 투자해볼까요?',
      cta: {
        label: '2분 세션 시작',
        action: 'start_quick_session',
        sessionMinutes: 2,
      },
    },
    streak_maintain_v1: {
      type: 'streak_maintain',
      emoji: '🔥',
      title: '스트릭 유지 중!',
      message: '잘하고 있어요! 오늘도 학습하면 스트릭이 계속됩니다.',
      cta: {
        label: '오늘의 학습',
        action: 'start_lesson',
      },
    },
    streak_milestone_7_v1: {
      type: 'achievement',
      emoji: '🎉',
      title: '일주일 연속 학습!',
      message: '대단해요! 7일 연속 학습 달성! 꾸준함이 실력을 만들어요.',
    },
    streak_milestone_30_v1: {
      type: 'achievement',
      emoji: '🏆',
      title: '한 달 연속 학습!',
      message: '정말 대단해요! 30일 연속 학습! 당신은 진정한 학습자입니다.',
    },
    streak_milestone_100_v1: {
      type: 'achievement',
      emoji: '👑',
      title: '100일 달성!',
      message: '전설이 되셨습니다! 100일 연속 학습을 달성한 당신에게 경의를!',
    },
    comeback_short_v1: {
      type: 'comeback',
      emoji: '👋',
      title: '다시 만나서 반가워요!',
      message: '짧은 휴식 후 돌아오셨군요. 다시 시작해볼까요?',
      cta: {
        label: '가볍게 시작',
        action: 'start_quick_session',
        sessionMinutes: 2,
      },
    },
    comeback_medium_v1: {
      type: 'comeback',
      emoji: '🤗',
      title: '돌아오셨네요!',
      message: '잠시 쉬었다 오셨군요. 천천히 다시 시작해봐요.',
      cta: {
        label: '복습부터 시작',
        action: 'start_quick_session',
        sessionMinutes: 5,
      },
    },
    comeback_long_v1: {
      type: 'comeback',
      emoji: '📚',
      title: '오랜만이에요!',
      message: '다시 돌아오신 것을 환영해요! 새로운 마음으로 시작해볼까요?',
      cta: {
        label: '처음부터 시작',
        action: 'start_lesson',
      },
    },
    achievement_weekly_v1: {
      type: 'achievement',
      emoji: '🎯',
      title: '이번 주 목표 달성!',
      message: '이번 주 학습 목표를 모두 달성했어요! 정말 잘했어요!',
      cta: {
        label: '통계 보기',
        action: 'view_stats',
      },
    },
    achievement_lesson_v1: {
      type: 'achievement',
      emoji: '✅',
      title: '레슨 완료!',
      message: '레슨을 완료했어요! 다음 레슨도 도전해볼까요?',
      cta: {
        label: '다음 레슨',
        action: 'start_lesson',
      },
    },
    achievement_level_up_v1: {
      type: 'achievement',
      emoji: '⬆️',
      title: '레벨 업!',
      message: '축하합니다! 새로운 레벨로 올라갔어요!',
    },
    encouragement_almost_v1: {
      type: 'encouragement',
      emoji: '💪',
      title: '거의 다 됐어요!',
      message: '조금만 더 하면 오늘 목표 달성! 힘내세요!',
      cta: {
        label: '마저 끝내기',
        action: 'start_quick_session',
        sessionMinutes: 2,
      },
    },
    encouragement_start_v1: {
      type: 'encouragement',
      emoji: '🌟',
      title: '오늘도 화이팅!',
      message: '작은 시작이 큰 변화를 만들어요. 지금 시작해볼까요?',
      cta: {
        label: '시작하기',
        action: 'start_lesson',
      },
    },
    encouragement_progress_v1: {
      type: 'encouragement',
      emoji: '📈',
      title: '꾸준히 성장 중!',
      message: '매일 조금씩, 하지만 확실하게 성장하고 있어요.',
    },
  },
  strict: {
    streak_danger_v1: {
      type: 'streak_danger',
      emoji: '⚠️',
      title: '스트릭 위험',
      message: '오늘 학습하지 않으면 연속 기록이 끊깁니다.',
      cta: {
        label: '지금 학습',
        action: 'start_quick_session',
        sessionMinutes: 2,
      },
    },
    streak_maintain_v1: {
      type: 'streak_maintain',
      emoji: '🔥',
      title: '스트릭 유지',
      message: '오늘 학습을 완료하세요.',
      cta: {
        label: '학습 시작',
        action: 'start_lesson',
      },
    },
    streak_milestone_7_v1: {
      type: 'achievement',
      emoji: '✓',
      title: '7일 달성',
      message: '일주일 연속 학습 완료. 계속 유지하세요.',
    },
    streak_milestone_30_v1: {
      type: 'achievement',
      emoji: '✓',
      title: '30일 달성',
      message: '한 달 연속 학습 완료. 멈추지 마세요.',
    },
    streak_milestone_100_v1: {
      type: 'achievement',
      emoji: '★',
      title: '100일 달성',
      message: '100일 연속 학습. 이제 습관입니다.',
    },
    comeback_short_v1: {
      type: 'comeback',
      emoji: '→',
      title: '다시 시작',
      message: '그만큼 쉬었으면 됐습니다. 학습을 재개하세요.',
      cta: {
        label: '학습 시작',
        action: 'start_quick_session',
        sessionMinutes: 5,
      },
    },
    comeback_medium_v1: {
      type: 'comeback',
      emoji: '→',
      title: '복귀',
      message: '오랜만입니다. 잊어버린 내용부터 복습하세요.',
      cta: {
        label: '복습 시작',
        action: 'start_quick_session',
        sessionMinutes: 5,
      },
    },
    comeback_long_v1: {
      type: 'comeback',
      emoji: '↺',
      title: '재시작',
      message: '오래 쉬셨습니다. 처음부터 다시 확인하세요.',
      cta: {
        label: '처음부터',
        action: 'start_lesson',
      },
    },
    achievement_weekly_v1: {
      type: 'achievement',
      emoji: '✓',
      title: '주간 목표 달성',
      message: '이번 주 목표를 완료했습니다.',
    },
    achievement_lesson_v1: {
      type: 'achievement',
      emoji: '✓',
      title: '레슨 완료',
      message: '다음 레슨으로 진행하세요.',
      cta: {
        label: '다음',
        action: 'start_lesson',
      },
    },
    achievement_level_up_v1: {
      type: 'achievement',
      emoji: '↑',
      title: '레벨 상승',
      message: '다음 단계로 올라갔습니다.',
    },
    encouragement_almost_v1: {
      type: 'encouragement',
      emoji: '→',
      title: '거의 완료',
      message: '조금 남았습니다. 끝내세요.',
      cta: {
        label: '마무리',
        action: 'start_quick_session',
        sessionMinutes: 2,
      },
    },
    encouragement_start_v1: {
      type: 'encouragement',
      emoji: '!',
      title: '시작하세요',
      message: '오늘 학습을 아직 시작하지 않았습니다.',
      cta: {
        label: '시작',
        action: 'start_lesson',
      },
    },
    encouragement_progress_v1: {
      type: 'encouragement',
      emoji: '→',
      title: '진행 중',
      message: '계속하세요.',
    },
  },
  playful: {
    streak_danger_v1: {
      type: 'streak_danger',
      emoji: '🆘',
      title: '스트릭이 울고 있어요!',
      message: '오늘 안 하면 스트릭이 슬퍼해요... 2분만요!',
      cta: {
        label: '스트릭 구하기 🦸',
        action: 'start_quick_session',
        sessionMinutes: 2,
      },
    },
    streak_maintain_v1: {
      type: 'streak_maintain',
      emoji: '🔥',
      title: '불타오르는 스트릭!',
      message: '와우! 스트릭이 활활 타오르고 있어요~',
      cta: {
        label: '불 더 지피기',
        action: 'start_lesson',
      },
    },
    streak_milestone_7_v1: {
      type: 'achievement',
      emoji: '🎊',
      title: '일주일 클리어!',
      message: '7일 연속! 당신 혹시... 천재?! 🧠',
    },
    streak_milestone_30_v1: {
      type: 'achievement',
      emoji: '🎪',
      title: '한 달 돌파!',
      message: '30일 연속! 이제 영어가 습관이 됐군요! 👏',
    },
    streak_milestone_100_v1: {
      type: 'achievement',
      emoji: '🦸',
      title: '전설의 시작!',
      message: '100일?! 당신은 진정한 영어 마스터! 🎮',
    },
    comeback_short_v1: {
      type: 'comeback',
      emoji: '👀',
      title: '어디 갔다 왔어요?',
      message: '잠깐 쉬고 왔구나~ 다시 달려볼까요?',
      cta: {
        label: '고고! 🚀',
        action: 'start_quick_session',
        sessionMinutes: 2,
      },
    },
    comeback_medium_v1: {
      type: 'comeback',
      emoji: '🙈',
      title: '오랜만이네요!',
      message: '어디서 뭐하다 왔어요? 궁금하다~ 일단 시작!',
      cta: {
        label: '다시 시작!',
        action: 'start_quick_session',
        sessionMinutes: 5,
      },
    },
    comeback_long_v1: {
      type: 'comeback',
      emoji: '🎬',
      title: '컴백 완료!',
      message: '오~ 드디어 돌아왔군요! 영어가 보고 싶었대요~',
      cta: {
        label: '영어야 안녕!',
        action: 'start_lesson',
      },
    },
    achievement_weekly_v1: {
      type: 'achievement',
      emoji: '🏅',
      title: '이번 주 올클!',
      message: '이번 주 목표 완전 정복! 당신 진짜 대단해요!',
      cta: {
        label: '자랑하기',
        action: 'view_stats',
      },
    },
    achievement_lesson_v1: {
      type: 'achievement',
      emoji: '🎮',
      title: '레슨 클리어!',
      message: '한 판 클리어! 다음 스테이지 갈까요?',
      cta: {
        label: '다음 스테이지',
        action: 'start_lesson',
      },
    },
    achievement_level_up_v1: {
      type: 'achievement',
      emoji: '🚀',
      title: '레벨 업!',
      message: '레벨 업! 당신의 영어 실력이 진화했다!',
    },
    encouragement_almost_v1: {
      type: 'encouragement',
      emoji: '🏃',
      title: '거의 다 왔어요!',
      message: '조금만 더! 결승선이 바로 앞이에요!',
      cta: {
        label: '골인! 🎯',
        action: 'start_quick_session',
        sessionMinutes: 2,
      },
    },
    encouragement_start_v1: {
      type: 'encouragement',
      emoji: '🌈',
      title: '오늘도 화이팅!',
      message: '오늘의 모험을 시작해볼까요? 🗺️',
      cta: {
        label: '모험 시작!',
        action: 'start_lesson',
      },
    },
    encouragement_progress_v1: {
      type: 'encouragement',
      emoji: '🌱',
      title: '쑥쑥 성장 중!',
      message: '매일 조금씩, 당신의 영어가 자라고 있어요! 🌳',
    },
  },
};

// ─────────────────────────────────────
// Cooldown Management
// ─────────────────────────────────────

const COOLDOWN_STORAGE_KEY = STORAGE_KEYS.MOTIVATION_COOLDOWN || 'motivation-cooldown';
const DEFAULT_COOLDOWN_DAYS = 3;

let cooldownCache: CooldownConfig | null = null;

async function loadCooldown(): Promise<CooldownConfig> {
  if (cooldownCache) return cooldownCache;

  try {
    const stored = await AsyncStorage.getItem(COOLDOWN_STORAGE_KEY);
    if (stored) {
      cooldownCache = JSON.parse(stored);
      return cooldownCache!;
    }
  } catch {
    // 에러 무시
  }

  cooldownCache = {
    sameMessageCooldownDays: DEFAULT_COOLDOWN_DAYS,
    lastShown: {} as Record<MessageKey, string>,
  };
  return cooldownCache;
}

async function saveCooldown(config: CooldownConfig): Promise<void> {
  cooldownCache = config;
  try {
    await AsyncStorage.setItem(COOLDOWN_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // 에러 무시
  }
}

async function isOnCooldown(key: MessageKey): Promise<boolean> {
  const config = await loadCooldown();
  const lastShown = config.lastShown[key];
  if (!lastShown) return false;

  const lastDate = new Date(lastShown);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  return diffDays < config.sameMessageCooldownDays;
}

async function markMessageShown(key: MessageKey): Promise<void> {
  const config = await loadCooldown();
  config.lastShown[key] = new Date().toISOString();
  await saveCooldown(config);
}

// ─────────────────────────────────────
// Message Selection Logic
// ─────────────────────────────────────

/**
 * 마지막 학습일로부터 경과일 계산 (유틸리티)
 */
export function calculateDaysSinceLastStudy(lastStudyDate: string | null): number {
  if (!lastStudyDate) return 999;
  const last = new Date(lastStudyDate);
  const now = new Date();
  return Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
}

function selectMessageKey(stats: UserStats): MessageKey {
  const { currentStreak, todayCompleted, weeklyProgress, isStreakAtRisk, daysSinceLastStudy } =
    stats;

  // 1. 스트릭 위험 (최우선)
  if (isStreakAtRisk && !todayCompleted) {
    return 'streak_danger_v1';
  }

  // 2. 복귀 메시지 (오래 쉬었다면)
  if (daysSinceLastStudy >= 7) {
    return 'comeback_long_v1';
  }
  if (daysSinceLastStudy >= 4) {
    return 'comeback_medium_v1';
  }
  if (daysSinceLastStudy >= 1 && currentStreak === 0) {
    return 'comeback_short_v1';
  }

  // 3. 마일스톤 축하
  if (currentStreak === 100) return 'streak_milestone_100_v1';
  if (currentStreak === 30) return 'streak_milestone_30_v1';
  if (currentStreak === 7) return 'streak_milestone_7_v1';

  // 4. 주간 목표 달성
  if (weeklyProgress >= 100 && todayCompleted) {
    return 'achievement_weekly_v1';
  }

  // 5. 거의 다 완료
  if (weeklyProgress >= 80 && !todayCompleted) {
    return 'encouragement_almost_v1';
  }

  // 6. 스트릭 유지 중
  if (currentStreak > 0 && todayCompleted) {
    return 'streak_maintain_v1';
  }

  // 7. 진행 중
  if (todayCompleted) {
    return 'encouragement_progress_v1';
  }

  // 8. 기본: 시작 격려
  return 'encouragement_start_v1';
}

// ─────────────────────────────────────
// Public API
// ─────────────────────────────────────

export const motivationService = {
  /**
   * 현재 상황에 맞는 동기부여 메시지 가져오기
   * 쿨다운 적용됨
   */
  async getMotivationMessage(
    stats: UserStats,
    tone: MessageTone = 'friendly'
  ): Promise<MotivationMessage | null> {
    const primaryKey = selectMessageKey(stats);

    // 쿨다운 체크
    if (await isOnCooldown(primaryKey)) {
      // 대체 메시지 시도
      const fallbackKey = getFallbackKey(primaryKey);
      if (fallbackKey && !(await isOnCooldown(fallbackKey))) {
        return buildMessage(fallbackKey, tone);
      }
      return null;
    }

    // 메시지 반환 (표시 기록)
    await markMessageShown(primaryKey);
    return buildMessage(primaryKey, tone);
  },

  /**
   * 특정 메시지 강제 가져오기 (쿨다운 무시)
   */
  getMessage(key: MessageKey, tone: MessageTone = 'friendly'): MotivationMessage {
    return buildMessage(key, tone);
  },

  /**
   * 스트릭 위험 메시지 (항상 표시, 쿨다운 무시)
   */
  getStreakDangerMessage(tone: MessageTone = 'friendly'): MotivationMessage {
    return buildMessage('streak_danger_v1', tone);
  },

  /**
   * 쿨다운 초기화
   */
  async resetCooldown(): Promise<void> {
    cooldownCache = null;
    await AsyncStorage.removeItem(COOLDOWN_STORAGE_KEY);
  },

  /**
   * 메시지 표시 기록 (컴포넌트에서 호출)
   */
  async markShown(key: MessageKey): Promise<void> {
    await markMessageShown(key);
  },
};

// ─────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────

function buildMessage(key: MessageKey, tone: MessageTone): MotivationMessage {
  const template = MESSAGES[tone][key];
  return {
    key,
    tone,
    ...template,
  };
}

function getFallbackKey(key: MessageKey): MessageKey | null {
  const fallbacks: Partial<Record<MessageKey, MessageKey>> = {
    streak_danger_v1: 'encouragement_start_v1',
    streak_maintain_v1: 'encouragement_progress_v1',
    comeback_short_v1: 'encouragement_start_v1',
    comeback_medium_v1: 'encouragement_start_v1',
    comeback_long_v1: 'encouragement_start_v1',
    achievement_weekly_v1: 'encouragement_progress_v1',
    encouragement_almost_v1: 'encouragement_start_v1',
  };
  return fallbacks[key] || null;
}

export default motivationService;
