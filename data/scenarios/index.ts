/**
 * Scenario Data Loader
 * JSON 파일에서 시나리오 데이터 로드
 */

import { Scenario, ScenarioCategory } from '@/types/scenario';

// JSON 파일 직접 import (Metro bundler가 처리)
import travelData from './travel.json';
import dailyData from './daily.json';
import businessData from './business.json';
import emergencyData from './emergency.json';
import socialData from './social.json';

// ─────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────

interface ScenarioFile {
  category: ScenarioCategory;
  scenarios: Scenario[];
}

// ─────────────────────────────────────
// 데이터 변환
// ─────────────────────────────────────

/**
 * JSON 데이터를 Scenario 배열로 변환
 */
function parseScenarioFile(data: ScenarioFile): Scenario[] {
  return data.scenarios.map((scenario) => ({
    ...scenario,
    category: data.category,
  }));
}

// ─────────────────────────────────────
// 시나리오 데이터 로드
// ─────────────────────────────────────

/**
 * 모든 시나리오 로드
 */
export function loadAllScenarios(): Scenario[] {
  const allScenarios: Scenario[] = [
    ...parseScenarioFile(travelData as ScenarioFile),
    ...parseScenarioFile(dailyData as ScenarioFile),
    ...parseScenarioFile(businessData as ScenarioFile),
    ...parseScenarioFile(emergencyData as ScenarioFile),
    ...parseScenarioFile(socialData as ScenarioFile),
  ];

  return allScenarios;
}

/**
 * 카테고리별 시나리오 로드
 */
export function loadScenariosByCategory(category: ScenarioCategory): Scenario[] {
  const dataMap: Record<ScenarioCategory, ScenarioFile> = {
    travel: travelData as ScenarioFile,
    daily: dailyData as ScenarioFile,
    business: businessData as ScenarioFile,
    emergency: emergencyData as ScenarioFile,
    social: socialData as ScenarioFile,
  };

  const data = dataMap[category];
  return data ? parseScenarioFile(data) : [];
}

/**
 * 시나리오 ID로 단일 시나리오 조회
 */
export function getScenarioById(id: string): Scenario | undefined {
  const allScenarios = loadAllScenarios();
  return allScenarios.find((s) => s.id === id);
}

/**
 * 카테고리별 시나리오 개수
 */
export function getScenarioCountByCategory(): Record<ScenarioCategory, number> {
  return {
    travel: (travelData as ScenarioFile).scenarios.length,
    daily: (dailyData as ScenarioFile).scenarios.length,
    business: (businessData as ScenarioFile).scenarios.length,
    emergency: (emergencyData as ScenarioFile).scenarios.length,
    social: (socialData as ScenarioFile).scenarios.length,
  };
}

/**
 * 전체 시나리오 개수
 */
export function getTotalScenarioCount(): number {
  const counts = getScenarioCountByCategory();
  return Object.values(counts).reduce((sum, count) => sum + count, 0);
}

/**
 * 전체 표현 개수
 */
export function getTotalExpressionCount(): number {
  const allScenarios = loadAllScenarios();
  return allScenarios.reduce((sum, s) => sum + s.expressions.length, 0);
}

// ─────────────────────────────────────
// 추천 시나리오
// ─────────────────────────────────────

/**
 * 초급자를 위한 추천 시나리오 (A1, A2)
 */
export function getBeginnerScenarios(): Scenario[] {
  return loadAllScenarios().filter((s) => s.level === 'A1' || s.level === 'A2');
}

/**
 * 카테고리별 첫 번째 시나리오 (각 카테고리 시작점)
 */
export function getCategoryStarters(): Scenario[] {
  const categories: ScenarioCategory[] = ['daily', 'travel', 'social', 'business', 'emergency'];

  return categories
    .map((category) => {
      const scenarios = loadScenariosByCategory(category);
      // 가장 쉬운 시나리오 반환
      return scenarios.sort((a, b) => a.difficulty - b.difficulty)[0];
    })
    .filter(Boolean);
}

// ─────────────────────────────────────
// 통계
// ─────────────────────────────────────

/**
 * 시나리오 데이터 통계
 */
export function getScenarioStats() {
  const allScenarios = loadAllScenarios();

  return {
    totalScenarios: allScenarios.length,
    totalExpressions: allScenarios.reduce((sum, s) => sum + s.expressions.length, 0),
    byCategory: getScenarioCountByCategory(),
    byLevel: {
      A1: allScenarios.filter((s) => s.level === 'A1').length,
      A2: allScenarios.filter((s) => s.level === 'A2').length,
      B1: allScenarios.filter((s) => s.level === 'B1').length,
      B2: allScenarios.filter((s) => s.level === 'B2').length,
      C1: allScenarios.filter((s) => s.level === 'C1').length,
      C2: allScenarios.filter((s) => s.level === 'C2').length,
    },
    byDifficulty: {
      easy: allScenarios.filter((s) => s.difficulty === 1).length,
      medium: allScenarios.filter((s) => s.difficulty === 2).length,
      hard: allScenarios.filter((s) => s.difficulty === 3).length,
    },
  };
}

// ─────────────────────────────────────
// Export Default
// ─────────────────────────────────────

export default {
  loadAllScenarios,
  loadScenariosByCategory,
  getScenarioById,
  getScenarioCountByCategory,
  getTotalScenarioCount,
  getTotalExpressionCount,
  getBeginnerScenarios,
  getCategoryStarters,
  getScenarioStats,
};
