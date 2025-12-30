/**
 * Skill Store
 * 스킬 진행률 추적 (백엔드 트래킹 시스템)
 * 예: grammar.article: 80%, vocab.food: 65%
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/storage';
import { SkillCategory, SkillState, SkillUpdate } from '@/types/scenario';

// ─────────────────────────────────────
// 스킬 메타데이터
// ─────────────────────────────────────

export const SKILL_DEFINITIONS: Record<
  string,
  { name: string; nameKo: string; category: SkillCategory }
> = {
  // Grammar Skills
  'grammar.article': {
    name: 'Articles (a/an/the)',
    nameKo: '관사 (a/an/the)',
    category: 'grammar',
  },
  'grammar.tense': { name: 'Verb Tenses', nameKo: '시제', category: 'grammar' },
  'grammar.question': { name: 'Question Forms', nameKo: '의문문', category: 'grammar' },
  'grammar.polite': { name: 'Polite Expressions', nameKo: '정중한 표현', category: 'grammar' },
  'grammar.possession': { name: 'Possessives', nameKo: '소유 표현', category: 'grammar' },
  'grammar.permission': { name: 'Permission Forms', nameKo: '허가 표현', category: 'grammar' },
  'grammar.suggestion': { name: 'Suggestions', nameKo: '제안 표현', category: 'grammar' },
  'grammar.request': { name: 'Requests', nameKo: '요청 표현', category: 'grammar' },
  'grammar.conditional': { name: 'Conditionals', nameKo: '조건문', category: 'grammar' },
  'grammar.passive': { name: 'Passive Voice', nameKo: '수동태', category: 'grammar' },

  // Vocabulary Skills
  'vocab.airport': { name: 'Airport Vocabulary', nameKo: '공항 어휘', category: 'vocab' },
  'vocab.food': { name: 'Food & Drinks', nameKo: '음식/음료 어휘', category: 'vocab' },
  'vocab.restaurant': { name: 'Restaurant Terms', nameKo: '식당 어휘', category: 'vocab' },
  'vocab.shopping': { name: 'Shopping Words', nameKo: '쇼핑 어휘', category: 'vocab' },
  'vocab.hotel': { name: 'Hotel Terms', nameKo: '호텔 어휘', category: 'vocab' },
  'vocab.business': { name: 'Business Terms', nameKo: '비즈니스 어휘', category: 'vocab' },
  'vocab.health': { name: 'Health & Medical', nameKo: '건강/의료 어휘', category: 'vocab' },
  'vocab.directions': { name: 'Directions', nameKo: '길 안내 어휘', category: 'vocab' },
  'vocab.numbers': { name: 'Numbers & Time', nameKo: '숫자/시간 어휘', category: 'vocab' },
  'vocab.emotions': { name: 'Emotions', nameKo: '감정 표현', category: 'vocab' },

  // Speaking Skills
  'speaking.pronunciation': { name: 'Pronunciation', nameKo: '발음', category: 'speaking' },
  'speaking.fluency': { name: 'Fluency', nameKo: '유창성', category: 'speaking' },
  'speaking.intonation': { name: 'Intonation', nameKo: '억양', category: 'speaking' },

  // Listening Skills
  'listening.comprehension': {
    name: 'Listening Comprehension',
    nameKo: '청해력',
    category: 'listening',
  },
  'listening.speed': { name: 'Fast Speech', nameKo: '빠른 말 듣기', category: 'listening' },

  // Reading Skills
  'reading.comprehension': { name: 'Reading Comprehension', nameKo: '독해력', category: 'reading' },
  'reading.speed': { name: 'Reading Speed', nameKo: '읽기 속도', category: 'reading' },

  // Writing Skills
  'writing.sentence': { name: 'Sentence Structure', nameKo: '문장 구조', category: 'writing' },
  'writing.paragraph': { name: 'Paragraph Writing', nameKo: '문단 작성', category: 'writing' },
};

// ─────────────────────────────────────
// State 타입
// ─────────────────────────────────────

interface SkillStoreState {
  // 스킬 상태
  skills: Record<string, SkillState>; // skillId -> SkillState

  // 히스토리 (최근 업데이트)
  recentUpdates: SkillUpdate[];

  // 로딩/에러
  isLoading: boolean;
  error: string | null;
}

interface SkillStoreActions {
  // 스킬 업데이트
  recordSkillAttempt: (skillIds: string[], isCorrect: boolean) => void;

  // 조회
  getSkill: (skillId: string) => SkillState | undefined;
  getSkillsByCategory: (category: SkillCategory) => SkillState[];
  getWeakSkills: (limit?: number) => SkillState[];
  getStrongSkills: (limit?: number) => SkillState[];
  getOverallProgress: () => {
    total: number;
    average: number;
    byCategory: Record<SkillCategory, number>;
  };

  // 초기화
  initializeSkill: (skillId: string) => void;
  resetSkill: (skillId: string) => void;
  resetAllSkills: () => void;

  // 유틸리티
  clearError: () => void;
}

// ─────────────────────────────────────
// 초기 상태
// ─────────────────────────────────────

const initialState: SkillStoreState = {
  skills: {},
  recentUpdates: [],
  isLoading: false,
  error: null,
};

// ─────────────────────────────────────
// 헬퍼 함수
// ─────────────────────────────────────

/**
 * 스킬 진행률 계산 (SM-2 간소화 버전)
 */
function calculateProgress(correctCount: number, totalCount: number): number {
  if (totalCount === 0) return 0;

  // 기본 정답률
  const accuracy = (correctCount / totalCount) * 100;

  // 최소 시도 횟수 가중치 (5회 이상이면 100%)
  const attemptWeight = Math.min(totalCount / 5, 1);

  // 가중치 적용된 진행률
  return Math.round(accuracy * attemptWeight);
}

/**
 * 연속 정답 스트릭 계산
 */
function updateStreak(currentStreak: number, isCorrect: boolean): number {
  return isCorrect ? currentStreak + 1 : 0;
}

// ─────────────────────────────────────
// Store
// ─────────────────────────────────────

export const useSkillStore = create<SkillStoreState & SkillStoreActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ─────────────────────────────────────
      // 스킬 업데이트
      // ─────────────────────────────────────

      recordSkillAttempt: (skillIds: string[], isCorrect: boolean) => {
        const now = new Date();

        set((state) => {
          const updatedSkills = { ...state.skills };
          const updates: SkillUpdate[] = [];

          for (const skillId of skillIds) {
            // 스킬이 없으면 초기화
            if (!updatedSkills[skillId]) {
              const definition = SKILL_DEFINITIONS[skillId];
              if (!definition) {
                console.warn(`[SkillStore] Unknown skill: ${skillId}`);
                continue;
              }

              updatedSkills[skillId] = {
                id: skillId,
                category: definition.category,
                name: definition.name,
                nameKo: definition.nameKo,
                progress: 0,
                correctCount: 0,
                totalCount: 0,
                streak: 0,
              };
            }

            const skill = updatedSkills[skillId];

            // 업데이트
            const newCorrectCount = isCorrect ? skill.correctCount + 1 : skill.correctCount;
            const newTotalCount = skill.totalCount + 1;
            const newStreak = updateStreak(skill.streak, isCorrect);
            const newProgress = calculateProgress(newCorrectCount, newTotalCount);

            updatedSkills[skillId] = {
              ...skill,
              correctCount: newCorrectCount,
              totalCount: newTotalCount,
              progress: newProgress,
              streak: newStreak,
              lastPracticed: now,
            };

            updates.push({
              skillId,
              isCorrect,
              timestamp: now,
            });
          }

          return {
            skills: updatedSkills,
            recentUpdates: [...updates, ...state.recentUpdates].slice(0, 100), // 최근 100개만 유지
          };
        });
      },

      // ─────────────────────────────────────
      // 조회
      // ─────────────────────────────────────

      getSkill: (skillId: string) => {
        return get().skills[skillId];
      },

      getSkillsByCategory: (category: SkillCategory) => {
        const { skills } = get();
        return Object.values(skills).filter((s) => s.category === category);
      },

      getWeakSkills: (limit = 5) => {
        const { skills } = get();
        return Object.values(skills)
          .filter((s) => s.totalCount >= 3) // 최소 3회 이상 시도한 것만
          .sort((a, b) => a.progress - b.progress)
          .slice(0, limit);
      },

      getStrongSkills: (limit = 5) => {
        const { skills } = get();
        return Object.values(skills)
          .filter((s) => s.totalCount >= 3)
          .sort((a, b) => b.progress - a.progress)
          .slice(0, limit);
      },

      getOverallProgress: () => {
        const { skills } = get();
        const skillList = Object.values(skills);

        if (skillList.length === 0) {
          return {
            total: 0,
            average: 0,
            byCategory: {
              grammar: 0,
              vocab: 0,
              speaking: 0,
              listening: 0,
              reading: 0,
              writing: 0,
            },
          };
        }

        // 전체 평균
        const total = skillList.length;
        const average = Math.round(skillList.reduce((sum, s) => sum + s.progress, 0) / total);

        // 카테고리별 평균
        const byCategory: Record<SkillCategory, number> = {
          grammar: 0,
          vocab: 0,
          speaking: 0,
          listening: 0,
          reading: 0,
          writing: 0,
        };

        const categoryCounts: Record<SkillCategory, number> = {
          grammar: 0,
          vocab: 0,
          speaking: 0,
          listening: 0,
          reading: 0,
          writing: 0,
        };

        for (const skill of skillList) {
          byCategory[skill.category] += skill.progress;
          categoryCounts[skill.category]++;
        }

        for (const category of Object.keys(byCategory) as SkillCategory[]) {
          if (categoryCounts[category] > 0) {
            byCategory[category] = Math.round(byCategory[category] / categoryCounts[category]);
          }
        }

        return { total, average, byCategory };
      },

      // ─────────────────────────────────────
      // 초기화
      // ─────────────────────────────────────

      initializeSkill: (skillId: string) => {
        const definition = SKILL_DEFINITIONS[skillId];
        if (!definition) {
          console.warn(`[SkillStore] Unknown skill: ${skillId}`);
          return;
        }

        set((state) => ({
          skills: {
            ...state.skills,
            [skillId]: {
              id: skillId,
              category: definition.category,
              name: definition.name,
              nameKo: definition.nameKo,
              progress: 0,
              correctCount: 0,
              totalCount: 0,
              streak: 0,
            },
          },
        }));
      },

      resetSkill: (skillId: string) => {
        const definition = SKILL_DEFINITIONS[skillId];
        if (!definition) return;

        set((state) => ({
          skills: {
            ...state.skills,
            [skillId]: {
              id: skillId,
              category: definition.category,
              name: definition.name,
              nameKo: definition.nameKo,
              progress: 0,
              correctCount: 0,
              totalCount: 0,
              streak: 0,
            },
          },
        }));
      },

      resetAllSkills: () => {
        set({ skills: {}, recentUpdates: [] });
      },

      // ─────────────────────────────────────
      // 유틸리티
      // ─────────────────────────────────────

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: STORAGE_KEYS.SKILLS,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        skills: state.skills,
        recentUpdates: state.recentUpdates.slice(0, 50), // 최근 50개만 저장
      }),
    }
  )
);

// ─────────────────────────────────────
// 카테고리 메타데이터
// ─────────────────────────────────────

export const SKILL_CATEGORIES: Record<
  SkillCategory,
  { label: string; labelKo: string; icon: string; color: string }
> = {
  grammar: { label: 'Grammar', labelKo: '문법', icon: 'book', color: '#4CAF50' },
  vocab: { label: 'Vocabulary', labelKo: '어휘', icon: 'text', color: '#2196F3' },
  speaking: { label: 'Speaking', labelKo: '말하기', icon: 'mic', color: '#FF9800' },
  listening: { label: 'Listening', labelKo: '듣기', icon: 'headphones', color: '#9C27B0' },
  reading: { label: 'Reading', labelKo: '읽기', icon: 'book-open', color: '#F44336' },
  writing: { label: 'Writing', labelKo: '쓰기', icon: 'edit-2', color: '#00BCD4' },
};
