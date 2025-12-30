/**
 * AI Store
 * AI 회화 상태 관리
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/storage';
import { CEFRLevel } from '@/types/activity';
import {
  ConversationMessage,
  ConversationContext,
  AIResponse,
  AIUsage,
  aiTutor,
} from '@/services/aiTutor';
import { generateId } from '@/utils/id';

// ─────────────────────────────────────
// State 타입
// ─────────────────────────────────────

interface AIState {
  // 현재 대화
  isActive: boolean;
  currentContext: ConversationContext | null;
  messages: ConversationMessage[];

  // 로딩/에러
  isLoading: boolean;
  error: string | null;

  // 사용량
  usage: AIUsage;
  isPremium: boolean;

  // 설정
  preferredLevel: CEFRLevel;
  autoCorrect: boolean;
  showTranslation: boolean;

  // 히스토리
  conversationHistory: {
    sessionId: string;
    topic: string;
    level: CEFRLevel;
    messageCount: number;
    startedAt: Date;
    endedAt?: Date;
  }[];
}

interface AIActions {
  // 대화 관리
  startConversation: (level: CEFRLevel, topic?: string) => Promise<AIResponse | null>;
  sendMessage: (message: string) => Promise<AIResponse | null>;
  endConversation: () => void;

  // 문법 검사
  checkGrammar: (text: string) => Promise<import('@/services/aiTutor').GrammarFeedback | null>;

  // 설정
  setPreferredLevel: (level: CEFRLevel) => void;
  setAutoCorrect: (enabled: boolean) => void;
  setShowTranslation: (enabled: boolean) => void;

  // 사용량
  canUseAI: () => { canUse: boolean; remaining: number };
  resetDailyUsage: () => void;

  // 유틸리티
  clearError: () => void;
  clearHistory: () => void;
}

// ─────────────────────────────────────
// 초기 상태
// ─────────────────────────────────────

const initialState: AIState = {
  isActive: false,
  currentContext: null,
  messages: [],
  isLoading: false,
  error: null,
  usage: {
    dailyCount: 0,
    lastResetDate: new Date().toISOString().split('T')[0],
    totalCount: 0,
  },
  isPremium: false,
  preferredLevel: 'A1',
  autoCorrect: true,
  showTranslation: true,
  conversationHistory: [],
};

// ─────────────────────────────────────
// Store
// ─────────────────────────────────────

export const useAIStore = create<AIState & AIActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ─────────────────────────────────────
      // 대화 관리
      // ─────────────────────────────────────

      startConversation: async (level: CEFRLevel, topic?: string) => {
        const { canUseAI } = get();
        const { canUse } = canUseAI();

        if (!canUse && !get().isPremium) {
          set({ error: '오늘의 무료 AI 대화 횟수를 모두 사용했습니다.' });
          return null;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await aiTutor.startConversation(level, topic);

          const sessionId = generateId();
          const context: ConversationContext = {
            topic: response.topic || topic || 'General',
            level,
            conversationHistory: [],
            sessionId,
          };

          const assistantMessage: ConversationMessage = {
            role: 'assistant',
            content: response.message,
            timestamp: new Date(),
          };

          set((state) => ({
            isActive: true,
            currentContext: context,
            messages: [assistantMessage],
            isLoading: false,
            usage: aiTutor.incrementUsage(state.usage),
            conversationHistory: [
              {
                sessionId,
                topic: context.topic,
                level,
                messageCount: 1,
                startedAt: new Date(),
              },
              ...state.conversationHistory,
            ],
          }));

          return response;
        } catch (error) {
          console.error('[AIStore] Start conversation failed:', error);
          set({
            error: error instanceof Error ? error.message : 'AI 대화를 시작할 수 없습니다.',
            isLoading: false,
          });
          return null;
        }
      },

      sendMessage: async (message: string) => {
        const { currentContext, messages, canUseAI, isPremium } = get();
        const { canUse } = canUseAI();

        if (!currentContext) {
          set({ error: '대화가 시작되지 않았습니다.' });
          return null;
        }

        if (!canUse && !isPremium) {
          set({ error: '오늘의 무료 AI 대화 횟수를 모두 사용했습니다.' });
          return null;
        }

        set({ isLoading: true, error: null });

        // 사용자 메시지 추가
        const userMessage: ConversationMessage = {
          role: 'user',
          content: message,
          timestamp: new Date(),
        };

        const updatedContext: ConversationContext = {
          ...currentContext,
          conversationHistory: [...messages, userMessage],
        };

        try {
          const response = await aiTutor.continueConversation(message, updatedContext);

          const assistantMessage: ConversationMessage = {
            role: 'assistant',
            content: response.message,
            timestamp: new Date(),
          };

          set((state) => ({
            currentContext: updatedContext,
            messages: [...state.messages, userMessage, assistantMessage],
            isLoading: false,
            usage: aiTutor.incrementUsage(state.usage),
            conversationHistory: state.conversationHistory.map((h, i) =>
              i === 0 ? { ...h, messageCount: h.messageCount + 2 } : h
            ),
          }));

          return response;
        } catch (error) {
          console.error('[AIStore] Send message failed:', error);
          set({
            error: error instanceof Error ? error.message : '메시지 전송에 실패했습니다.',
            isLoading: false,
          });
          return null;
        }
      },

      endConversation: () => {
        set((state) => ({
          isActive: false,
          currentContext: null,
          messages: [],
          conversationHistory: state.conversationHistory.map((h, i) =>
            i === 0 ? { ...h, endedAt: new Date() } : h
          ),
        }));
      },

      // ─────────────────────────────────────
      // 문법 검사
      // ─────────────────────────────────────

      checkGrammar: async (text: string) => {
        const { preferredLevel, canUseAI, isPremium } = get();
        const { canUse } = canUseAI();

        if (!canUse && !isPremium) {
          set({ error: '오늘의 무료 AI 사용 횟수를 모두 사용했습니다.' });
          return null;
        }

        set({ isLoading: true, error: null });

        try {
          const feedback = await aiTutor.checkGrammar(text, preferredLevel);

          set((state) => ({
            isLoading: false,
            usage: aiTutor.incrementUsage(state.usage),
          }));

          return feedback;
        } catch (error) {
          console.error('[AIStore] Grammar check failed:', error);
          set({
            error: error instanceof Error ? error.message : '문법 검사에 실패했습니다.',
            isLoading: false,
          });
          return null;
        }
      },

      // ─────────────────────────────────────
      // 설정
      // ─────────────────────────────────────

      setPreferredLevel: (level: CEFRLevel) => {
        set({ preferredLevel: level });
      },

      setAutoCorrect: (enabled: boolean) => {
        set({ autoCorrect: enabled });
      },

      setShowTranslation: (enabled: boolean) => {
        set({ showTranslation: enabled });
      },

      // ─────────────────────────────────────
      // 사용량
      // ─────────────────────────────────────

      canUseAI: () => {
        const { usage, isPremium } = get();
        if (isPremium) {
          return { canUse: true, remaining: Infinity };
        }
        return aiTutor.checkUsageLimit(usage);
      },

      resetDailyUsage: () => {
        const today = new Date().toISOString().split('T')[0];
        set((state) => ({
          usage: {
            ...state.usage,
            dailyCount: 0,
            lastResetDate: today,
          },
        }));
      },

      // ─────────────────────────────────────
      // 유틸리티
      // ─────────────────────────────────────

      clearError: () => {
        set({ error: null });
      },

      clearHistory: () => {
        set({ conversationHistory: [] });
      },
    }),
    {
      name: STORAGE_KEYS.AI || '@whatTodo:ai',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        usage: state.usage,
        isPremium: state.isPremium,
        preferredLevel: state.preferredLevel,
        autoCorrect: state.autoCorrect,
        showTranslation: state.showTranslation,
        conversationHistory: state.conversationHistory.slice(0, 50), // 최근 50개만 저장
      }),
    }
  )
);
