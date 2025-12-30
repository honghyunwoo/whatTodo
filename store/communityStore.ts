/**
 * Community Store
 * 커뮤니티 레슨 상태 관리
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/constants/storage';
import {
  CommunityLesson,
  CommunityUser,
  LessonFilter,
  LessonSortBy,
  LessonDownload,
  LessonReview,
  CreateLessonInput,
  CreatorLevel,
  CREATOR_LEVEL_INFO,
} from '@/types/community';
import firebase, { COLLECTIONS } from '@/services/firebase';
import { generateId } from '@/utils/id';

// ─────────────────────────────────────
// State 타입
// ─────────────────────────────────────

interface CommunityState {
  // 현재 사용자
  currentUser: CommunityUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // 레슨 목록
  popularLessons: CommunityLesson[];
  recentLessons: CommunityLesson[];
  featuredLessons: CommunityLesson[];
  searchResults: CommunityLesson[];

  // 내 레슨
  myLessons: CommunityLesson[];
  myDownloads: LessonDownload[];
  myDrafts: CreateLessonInput[];

  // 필터/정렬
  currentFilter: LessonFilter;
  currentSort: LessonSortBy;

  // 캐시
  lessonCache: Record<string, CommunityLesson>;
  lastFetchTime: number | null;
}

interface CommunityActions {
  // 인증
  initializeAuth: () => Promise<void>;
  setNickname: (nickname: string) => Promise<boolean>;

  // 레슨 조회
  fetchPopularLessons: () => Promise<void>;
  fetchRecentLessons: () => Promise<void>;
  fetchFeaturedLessons: () => Promise<void>;
  fetchLessonById: (lessonId: string) => Promise<CommunityLesson | null>;
  searchLessons: (query: string, filter?: LessonFilter) => Promise<void>;

  // 내 레슨 관리
  fetchMyLessons: () => Promise<void>;
  createLesson: (input: CreateLessonInput) => Promise<string | null>;
  updateLesson: (lessonId: string, input: Partial<CreateLessonInput>) => Promise<boolean>;
  deleteLesson: (lessonId: string) => Promise<boolean>;
  publishLesson: (lessonId: string) => Promise<boolean>;

  // 레슨 다운로드
  downloadLesson: (lessonId: string) => Promise<boolean>;
  markLessonCompleted: (lessonId: string, score: number) => Promise<boolean>;
  fetchMyDownloads: () => Promise<void>;

  // 리뷰
  submitReview: (lessonId: string, rating: number, comment?: string) => Promise<boolean>;

  // 드래프트 관리 (로컬)
  saveDraft: (draft: CreateLessonInput) => void;
  deleteDraft: (index: number) => void;
  clearDrafts: () => void;

  // 필터/정렬
  setFilter: (filter: LessonFilter) => void;
  setSort: (sort: LessonSortBy) => void;
  clearFilter: () => void;

  // 유틸리티
  clearError: () => void;
  refreshAll: () => Promise<void>;
}

// ─────────────────────────────────────
// 초기 상태
// ─────────────────────────────────────

const initialState: CommunityState = {
  currentUser: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  popularLessons: [],
  recentLessons: [],
  featuredLessons: [],
  searchResults: [],
  myLessons: [],
  myDownloads: [],
  myDrafts: [],
  currentFilter: {},
  currentSort: 'popular',
  lessonCache: {},
  lastFetchTime: null,
};

// ─────────────────────────────────────
// 헬퍼 함수
// ─────────────────────────────────────

function calculateCreatorLevel(totalDownloads: number): CreatorLevel {
  if (totalDownloads >= CREATOR_LEVEL_INFO.platinum.minDownloads) return 'platinum';
  if (totalDownloads >= CREATOR_LEVEL_INFO.gold.minDownloads) return 'gold';
  if (totalDownloads >= CREATOR_LEVEL_INFO.silver.minDownloads) return 'silver';
  if (totalDownloads >= CREATOR_LEVEL_INFO.bronze.minDownloads) return 'bronze';
  return 'beginner';
}

// ─────────────────────────────────────
// Store
// ─────────────────────────────────────

export const useCommunityStore = create<CommunityState & CommunityActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ─────────────────────────────────────
      // 인증
      // ─────────────────────────────────────

      initializeAuth: async () => {
        if (!firebase.isConfigured()) {
          console.log('[CommunityStore] Firebase not configured, using offline mode');
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const user = await firebase.signInAnonymously();
          if (user) {
            // 사용자 프로필 가져오기 또는 생성
            let userProfile = await firebase.readDocument<CommunityUser>(
              COLLECTIONS.USERS,
              user.uid
            );

            if (!userProfile) {
              // 새 사용자 프로필 생성
              userProfile = {
                id: user.uid,
                nickname: `학습자${Math.floor(Math.random() * 10000)}`,
                createdAt: new Date(),
                updatedAt: new Date(),
                lessonsCreated: 0,
                lessonsDownloaded: 0,
                totalDownloads: 0,
                averageRating: 0,
                badges: [],
                creatorLevel: 'beginner',
              };

              await firebase.writeDocument(COLLECTIONS.USERS, user.uid, userProfile);
            }

            set({
              currentUser: userProfile,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('[CommunityStore] Auth failed:', error);
          set({
            error: '인증에 실패했습니다. 오프라인 모드로 진행합니다.',
            isLoading: false,
          });
        }
      },

      setNickname: async (nickname: string) => {
        const { currentUser } = get();
        if (!currentUser || !firebase.isConfigured()) return false;

        try {
          await firebase.updateDocument(COLLECTIONS.USERS, currentUser.id, { nickname });
          set({ currentUser: { ...currentUser, nickname } });
          return true;
        } catch (error) {
          console.error('[CommunityStore] Set nickname failed:', error);
          return false;
        }
      },

      // ─────────────────────────────────────
      // 레슨 조회
      // ─────────────────────────────────────

      fetchPopularLessons: async () => {
        if (!firebase.isConfigured()) return;

        set({ isLoading: true });
        try {
          const lessons = await firebase.queryDocuments<CommunityLesson>(COLLECTIONS.LESSONS, {
            field: 'status',
            operator: '==',
            value: 'published',
            orderByField: 'downloadCount',
            orderDirection: 'desc',
            limitCount: 20,
          });
          set({ popularLessons: lessons, isLoading: false });
        } catch (error) {
          console.error('[CommunityStore] Fetch popular lessons failed:', error);
          set({ isLoading: false });
        }
      },

      fetchRecentLessons: async () => {
        if (!firebase.isConfigured()) return;

        set({ isLoading: true });
        try {
          const lessons = await firebase.queryDocuments<CommunityLesson>(COLLECTIONS.LESSONS, {
            field: 'status',
            operator: '==',
            value: 'published',
            orderByField: 'publishedAt',
            orderDirection: 'desc',
            limitCount: 20,
          });
          set({ recentLessons: lessons, isLoading: false });
        } catch (error) {
          console.error('[CommunityStore] Fetch recent lessons failed:', error);
          set({ isLoading: false });
        }
      },

      fetchFeaturedLessons: async () => {
        if (!firebase.isConfigured()) return;

        set({ isLoading: true });
        try {
          const lessons = await firebase.queryDocuments<CommunityLesson>(COLLECTIONS.LESSONS, {
            field: 'isFeatured',
            operator: '==',
            value: true,
            limitCount: 10,
          });
          set({ featuredLessons: lessons, isLoading: false });
        } catch (error) {
          console.error('[CommunityStore] Fetch featured lessons failed:', error);
          set({ isLoading: false });
        }
      },

      fetchLessonById: async (lessonId: string) => {
        const { lessonCache } = get();
        if (lessonCache[lessonId]) {
          return lessonCache[lessonId];
        }

        if (!firebase.isConfigured()) return null;

        try {
          const lesson = await firebase.readDocument<CommunityLesson>(
            COLLECTIONS.LESSONS,
            lessonId
          );
          if (lesson) {
            set({ lessonCache: { ...lessonCache, [lessonId]: lesson } });
          }
          return lesson;
        } catch (error) {
          console.error('[CommunityStore] Fetch lesson failed:', error);
          return null;
        }
      },

      searchLessons: async (query: string, filter?: LessonFilter) => {
        if (!firebase.isConfigured()) {
          set({ searchResults: [] });
          return;
        }

        set({ isLoading: true, currentFilter: filter || {} });
        try {
          // 간단한 검색 (Firestore 제한으로 서버 사이드 검색은 제한적)
          const lessons = await firebase.queryDocuments<CommunityLesson>(COLLECTIONS.LESSONS, {
            field: 'status',
            operator: '==',
            value: 'published',
            limitCount: 50,
          });

          // 클라이언트 사이드 필터링
          const filtered = lessons.filter((lesson) => {
            const matchesQuery =
              !query ||
              lesson.title.toLowerCase().includes(query.toLowerCase()) ||
              lesson.description.toLowerCase().includes(query.toLowerCase()) ||
              lesson.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()));

            const matchesCategory = !filter?.category || lesson.category === filter.category;
            const matchesLevel = !filter?.level || lesson.level === filter.level;
            const matchesDifficulty =
              !filter?.difficulty || lesson.difficulty === filter.difficulty;
            const matchesRating = !filter?.minRating || lesson.averageRating >= filter.minRating;

            return (
              matchesQuery && matchesCategory && matchesLevel && matchesDifficulty && matchesRating
            );
          });

          set({ searchResults: filtered, isLoading: false });
        } catch (error) {
          console.error('[CommunityStore] Search failed:', error);
          set({ isLoading: false });
        }
      },

      // ─────────────────────────────────────
      // 내 레슨 관리
      // ─────────────────────────────────────

      fetchMyLessons: async () => {
        const { currentUser } = get();
        if (!currentUser || !firebase.isConfigured()) return;

        set({ isLoading: true });
        try {
          const lessons = await firebase.queryDocuments<CommunityLesson>(COLLECTIONS.LESSONS, {
            field: 'authorId',
            operator: '==',
            value: currentUser.id,
          });
          set({ myLessons: lessons, isLoading: false });
        } catch (error) {
          console.error('[CommunityStore] Fetch my lessons failed:', error);
          set({ isLoading: false });
        }
      },

      createLesson: async (input: CreateLessonInput) => {
        const { currentUser } = get();
        if (!currentUser || !firebase.isConfigured()) {
          // 오프라인 모드: 드래프트로 저장
          get().saveDraft(input);
          return null;
        }

        set({ isLoading: true, error: null });
        try {
          const lessonId = generateId();
          const now = new Date();

          const lesson: CommunityLesson = {
            id: lessonId,
            ...input,
            words: input.words.map((w) => ({ ...w, id: generateId() })),
            sentences: input.sentences.map((s) => ({ ...s, id: generateId() })),
            quizzes: input.quizzes.map((q) => ({ ...q, id: generateId() })),
            authorId: currentUser.id,
            authorNickname: currentUser.nickname,
            authorLevel: currentUser.creatorLevel,
            estimatedMinutes: Math.ceil(
              (input.words.length * 0.5 + input.sentences.length * 1 + input.quizzes.length * 1) / 3
            ),
            downloadCount: 0,
            averageRating: 0,
            reviewCount: 0,
            status: 'draft',
            isPublic: false,
            isFeatured: false,
            createdAt: now,
            updatedAt: now,
          };

          await firebase.writeDocument(COLLECTIONS.LESSONS, lessonId, lesson);

          // 사용자 레슨 수 업데이트
          await firebase.updateDocument(COLLECTIONS.USERS, currentUser.id, {
            lessonsCreated: currentUser.lessonsCreated + 1,
          });

          set((state) => ({
            myLessons: [lesson, ...state.myLessons],
            currentUser: {
              ...currentUser,
              lessonsCreated: currentUser.lessonsCreated + 1,
            },
            isLoading: false,
          }));

          return lessonId;
        } catch (error) {
          console.error('[CommunityStore] Create lesson failed:', error);
          set({ error: '레슨 생성에 실패했습니다.', isLoading: false });
          return null;
        }
      },

      updateLesson: async (lessonId: string, input: Partial<CreateLessonInput>) => {
        if (!firebase.isConfigured()) return false;

        try {
          // Convert input words/sentences/quizzes to include IDs if provided
          const processedInput: Partial<CommunityLesson> = {
            ...input,
            words: input.words?.map((w) => ({ ...w, id: generateId() })),
            sentences: input.sentences?.map((s) => ({ ...s, id: generateId() })),
            quizzes: input.quizzes?.map((q) => ({ ...q, id: generateId() })),
          };

          await firebase.updateDocument(COLLECTIONS.LESSONS, lessonId, processedInput);
          set((state) => ({
            myLessons: state.myLessons.map((l) =>
              l.id === lessonId ? ({ ...l, ...processedInput } as CommunityLesson) : l
            ),
          }));
          return true;
        } catch (error) {
          console.error('[CommunityStore] Update lesson failed:', error);
          return false;
        }
      },

      deleteLesson: async (lessonId: string) => {
        if (!firebase.isConfigured()) return false;

        try {
          await firebase.deleteDocument(COLLECTIONS.LESSONS, lessonId);
          set((state) => ({
            myLessons: state.myLessons.filter((l) => l.id !== lessonId),
          }));
          return true;
        } catch (error) {
          console.error('[CommunityStore] Delete lesson failed:', error);
          return false;
        }
      },

      publishLesson: async (lessonId: string) => {
        if (!firebase.isConfigured()) return false;

        try {
          await firebase.updateDocument(COLLECTIONS.LESSONS, lessonId, {
            status: 'published',
            isPublic: true,
            publishedAt: new Date(),
          });
          set((state) => ({
            myLessons: state.myLessons.map((l) =>
              l.id === lessonId
                ? { ...l, status: 'published' as const, isPublic: true, publishedAt: new Date() }
                : l
            ),
          }));
          return true;
        } catch (error) {
          console.error('[CommunityStore] Publish lesson failed:', error);
          return false;
        }
      },

      // ─────────────────────────────────────
      // 레슨 다운로드
      // ─────────────────────────────────────

      downloadLesson: async (lessonId: string) => {
        const { currentUser, lessonCache } = get();
        if (!currentUser || !firebase.isConfigured()) return false;

        try {
          // 다운로드 기록 생성
          const downloadId = generateId();
          const download: LessonDownload = {
            id: downloadId,
            lessonId,
            userId: currentUser.id,
            downloadedAt: new Date(),
            completed: false,
          };

          await firebase.writeDocument(COLLECTIONS.DOWNLOADS, downloadId, download);

          // 레슨 다운로드 수 증가
          const lesson = lessonCache[lessonId];
          if (lesson) {
            await firebase.updateDocument(COLLECTIONS.LESSONS, lessonId, {
              downloadCount: lesson.downloadCount + 1,
            });
          }

          // 사용자 다운로드 수 증가
          await firebase.updateDocument(COLLECTIONS.USERS, currentUser.id, {
            lessonsDownloaded: currentUser.lessonsDownloaded + 1,
          });

          set((state) => ({
            myDownloads: [download, ...state.myDownloads],
            currentUser: {
              ...currentUser,
              lessonsDownloaded: currentUser.lessonsDownloaded + 1,
            },
          }));

          return true;
        } catch (error) {
          console.error('[CommunityStore] Download lesson failed:', error);
          return false;
        }
      },

      markLessonCompleted: async (lessonId: string, score: number) => {
        const { myDownloads } = get();
        const download = myDownloads.find((d) => d.lessonId === lessonId);
        if (!download || !firebase.isConfigured()) return false;

        try {
          await firebase.updateDocument(COLLECTIONS.DOWNLOADS, download.id, {
            completed: true,
            completedAt: new Date(),
            score,
          });

          set((state) => ({
            myDownloads: state.myDownloads.map((d) =>
              d.lessonId === lessonId
                ? { ...d, completed: true, completedAt: new Date(), score }
                : d
            ),
          }));

          return true;
        } catch (error) {
          console.error('[CommunityStore] Mark completed failed:', error);
          return false;
        }
      },

      fetchMyDownloads: async () => {
        const { currentUser } = get();
        if (!currentUser || !firebase.isConfigured()) return;

        try {
          const downloads = await firebase.queryDocuments<LessonDownload>(COLLECTIONS.DOWNLOADS, {
            field: 'userId',
            operator: '==',
            value: currentUser.id,
            orderByField: 'downloadedAt',
            orderDirection: 'desc',
          });
          set({ myDownloads: downloads });
        } catch (error) {
          console.error('[CommunityStore] Fetch downloads failed:', error);
        }
      },

      // ─────────────────────────────────────
      // 리뷰
      // ─────────────────────────────────────

      submitReview: async (lessonId: string, rating: number, comment?: string) => {
        const { currentUser } = get();
        if (!currentUser || !firebase.isConfigured()) return false;

        try {
          const reviewId = generateId();
          const review: LessonReview = {
            id: reviewId,
            lessonId,
            userId: currentUser.id,
            userNickname: currentUser.nickname,
            rating,
            comment,
            createdAt: new Date(),
            updatedAt: new Date(),
            helpfulCount: 0,
            notHelpfulCount: 0,
          };

          await firebase.writeDocument(COLLECTIONS.REVIEWS, reviewId, review);
          return true;
        } catch (error) {
          console.error('[CommunityStore] Submit review failed:', error);
          return false;
        }
      },

      // ─────────────────────────────────────
      // 드래프트 관리 (로컬)
      // ─────────────────────────────────────

      saveDraft: (draft: CreateLessonInput) => {
        set((state) => ({
          myDrafts: [...state.myDrafts, draft],
        }));
      },

      deleteDraft: (index: number) => {
        set((state) => ({
          myDrafts: state.myDrafts.filter((_, i) => i !== index),
        }));
      },

      clearDrafts: () => {
        set({ myDrafts: [] });
      },

      // ─────────────────────────────────────
      // 필터/정렬
      // ─────────────────────────────────────

      setFilter: (filter: LessonFilter) => {
        set({ currentFilter: filter });
      },

      setSort: (sort: LessonSortBy) => {
        set({ currentSort: sort });
      },

      clearFilter: () => {
        set({ currentFilter: {}, currentSort: 'popular' });
      },

      // ─────────────────────────────────────
      // 유틸리티
      // ─────────────────────────────────────

      clearError: () => {
        set({ error: null });
      },

      refreshAll: async () => {
        const actions = get();
        await Promise.all([
          actions.fetchPopularLessons(),
          actions.fetchRecentLessons(),
          actions.fetchFeaturedLessons(),
          actions.fetchMyLessons(),
          actions.fetchMyDownloads(),
        ]);
        set({ lastFetchTime: Date.now() });
      },
    }),
    {
      name: STORAGE_KEYS.COMMUNITY || 'community-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        myDrafts: state.myDrafts,
        currentFilter: state.currentFilter,
        currentSort: state.currentSort,
      }),
    }
  )
);
