/**
 * Widget Data Utility
 *
 * 홈 화면 위젯에서 표시할 데이터를 관리합니다.
 * 위젯 구현은 Bare Workflow 필요 (expo prebuild)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WidgetData {
  // 학습
  streak: number;
  todayProgress: number;
  todayGoal: number;
  currentLevel: string;

  // 게임
  bestScore: number;
  highestTile: number;

  // Todo
  pendingTodos: number;
  completedToday: number;

  // 메타
  lastUpdated: string;
}

const WIDGET_DATA_KEY = '@whatTodo/widgetData';

const DEFAULT_WIDGET_DATA: WidgetData = {
  streak: 0,
  todayProgress: 0,
  todayGoal: 3,
  currentLevel: 'A1',
  bestScore: 0,
  highestTile: 0,
  pendingTodos: 0,
  completedToday: 0,
  lastUpdated: new Date().toISOString(),
};

/**
 * 위젯용 데이터 업데이트
 * 학습 완료, Todo 변경, 게임 점수 등의 이벤트 시 호출
 */
export async function updateWidgetData(data: Partial<WidgetData>): Promise<void> {
  try {
    const existing = await getWidgetData();
    const updated: WidgetData = {
      ...existing,
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    await AsyncStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(updated));

    // TODO: 네이티브 위젯 갱신 트리거 (Bare Workflow 필요)
    // iOS: WidgetCenter.shared.reloadAllTimelines()
    // Android: AppWidgetManager.notifyAppWidgetViewDataChanged()
  } catch (error) {
    console.warn('Failed to update widget data:', error);
  }
}

/**
 * 위젯용 데이터 조회
 */
export async function getWidgetData(): Promise<WidgetData> {
  try {
    const data = await AsyncStorage.getItem(WIDGET_DATA_KEY);
    if (data) {
      return { ...DEFAULT_WIDGET_DATA, ...JSON.parse(data) };
    }
  } catch (error) {
    console.warn('Failed to get widget data:', error);
  }

  return DEFAULT_WIDGET_DATA;
}

/**
 * 위젯 데이터 초기화
 */
export async function resetWidgetData(): Promise<void> {
  try {
    await AsyncStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(DEFAULT_WIDGET_DATA));
  } catch (error) {
    console.warn('Failed to reset widget data:', error);
  }
}

/**
 * 학습 진행률 업데이트 헬퍼
 */
export async function updateLearnProgress(
  lessonsCompleted: number,
  dailyGoal: number,
  streak: number,
  level: string
): Promise<void> {
  const progress = Math.min(100, Math.round((lessonsCompleted / dailyGoal) * 100));
  await updateWidgetData({
    todayProgress: progress,
    todayGoal: dailyGoal,
    streak,
    currentLevel: level,
  });
}

/**
 * 게임 점수 업데이트 헬퍼
 */
export async function updateGameScore(bestScore: number, highestTile: number): Promise<void> {
  await updateWidgetData({
    bestScore,
    highestTile,
  });
}

/**
 * Todo 상태 업데이트 헬퍼
 */
export async function updateTodoStatus(pending: number, completedToday: number): Promise<void> {
  await updateWidgetData({
    pendingTodos: pending,
    completedToday,
  });
}
