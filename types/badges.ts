/**
 * Badge System Definitions
 * Uses MaterialCommunityIcons names (NOT emoji)
 */

export type BadgeCategory = 'todo' | 'game' | 'learning' | 'special';

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  icon: string; // MaterialCommunityIcons name
  color: string;
  requirement: BadgeRequirement;
}

export interface BadgeRequirement {
  type: BadgeRequirementType;
  value: number;
}

export type BadgeRequirementType =
  | 'tasks_completed'
  | 'streak_days'
  | 'total_stars'
  | 'game_score'
  | 'game_2048_reached'
  | 'words_learned'
  | 'login_days'
  // Learning-specific requirements
  | 'activities_completed'
  | 'perfect_score'
  | 'all_skills_daily'
  | 'learning_streak'
  | 'vocabulary_mastered'
  | 'grammar_mastered'
  | 'listening_hours'
  | 'speaking_sessions'
  | 'writing_submissions'
  | 'level_reached';

// Badge definitions using Vector Icons (no emoji!)
export const BADGES: Record<string, Badge> = {
  // Todo Badges
  firstTask: {
    id: 'firstTask',
    name: 'First Step',
    description: 'Complete your first task',
    category: 'todo',
    icon: 'check-circle',
    color: '#4CAF50',
    requirement: { type: 'tasks_completed', value: 1 },
  },
  taskMaster10: {
    id: 'taskMaster10',
    name: 'Task Master',
    description: 'Complete 10 tasks',
    category: 'todo',
    icon: 'checkbox-multiple-marked',
    color: '#2196F3',
    requirement: { type: 'tasks_completed', value: 10 },
  },
  taskMaster50: {
    id: 'taskMaster50',
    name: 'Productivity Pro',
    description: 'Complete 50 tasks',
    category: 'todo',
    icon: 'star-circle',
    color: '#9C27B0',
    requirement: { type: 'tasks_completed', value: 50 },
  },
  taskMaster100: {
    id: 'taskMaster100',
    name: 'Task Legend',
    description: 'Complete 100 tasks',
    category: 'todo',
    icon: 'crown',
    color: '#FFD700',
    requirement: { type: 'tasks_completed', value: 100 },
  },

  // Streak Badges
  streak3: {
    id: 'streak3',
    name: 'Getting Started',
    description: '3 day streak',
    category: 'todo',
    icon: 'fire',
    color: '#FF9800',
    requirement: { type: 'streak_days', value: 3 },
  },
  streak7: {
    id: 'streak7',
    name: 'Week Warrior',
    description: '7 day streak',
    category: 'todo',
    icon: 'fire',
    color: '#F44336',
    requirement: { type: 'streak_days', value: 7 },
  },
  streak14: {
    id: 'streak14',
    name: 'Unstoppable',
    description: '14 day streak',
    category: 'todo',
    icon: 'fire',
    color: '#E91E63',
    requirement: { type: 'streak_days', value: 14 },
  },
  streak30: {
    id: 'streak30',
    name: 'Month Master',
    description: '30 day streak',
    category: 'todo',
    icon: 'fire',
    color: '#9C27B0',
    requirement: { type: 'streak_days', value: 30 },
  },

  // Game Badges
  firstGame: {
    id: 'firstGame',
    name: 'Player One',
    description: 'Play your first game',
    category: 'game',
    icon: 'gamepad-variant',
    color: '#3F51B5',
    requirement: { type: 'game_score', value: 1 },
  },
  score1000: {
    id: 'score1000',
    name: 'Score Seeker',
    description: 'Reach 1,000 points',
    category: 'game',
    icon: 'numeric-1-circle',
    color: '#00BCD4',
    requirement: { type: 'game_score', value: 1000 },
  },
  score5000: {
    id: 'score5000',
    name: 'High Scorer',
    description: 'Reach 5,000 points',
    category: 'game',
    icon: 'numeric-5-circle',
    color: '#009688',
    requirement: { type: 'game_score', value: 5000 },
  },
  score10000: {
    id: 'score10000',
    name: 'Score Master',
    description: 'Reach 10,000 points',
    category: 'game',
    icon: 'medal',
    color: '#795548',
    requirement: { type: 'game_score', value: 10000 },
  },
  reach2048: {
    id: 'reach2048',
    name: '2048 Champion',
    description: 'Reach the 2048 tile',
    category: 'game',
    icon: 'trophy',
    color: '#FFC107',
    requirement: { type: 'game_2048_reached', value: 1 },
  },

  // Star Badges
  stars100: {
    id: 'stars100',
    name: 'Star Collector',
    description: 'Earn 100 stars',
    category: 'special',
    icon: 'star',
    color: '#FFEB3B',
    requirement: { type: 'total_stars', value: 100 },
  },
  stars500: {
    id: 'stars500',
    name: 'Star Hoarder',
    description: 'Earn 500 stars',
    category: 'special',
    icon: 'star-circle',
    color: '#FFC107',
    requirement: { type: 'total_stars', value: 500 },
  },
  stars1000: {
    id: 'stars1000',
    name: 'Star Millionaire',
    description: 'Earn 1,000 stars',
    category: 'special',
    icon: 'star-four-points',
    color: '#FF9800',
    requirement: { type: 'total_stars', value: 1000 },
  },

  // Learning Badges - Vocabulary
  words10: {
    id: 'words10',
    name: 'Word Learner',
    description: 'Learn 10 words',
    category: 'learning',
    icon: 'book-open-variant',
    color: '#8BC34A',
    requirement: { type: 'words_learned', value: 10 },
  },
  words50: {
    id: 'words50',
    name: 'Vocabulary Builder',
    description: 'Learn 50 words',
    category: 'learning',
    icon: 'book-education',
    color: '#4CAF50',
    requirement: { type: 'words_learned', value: 50 },
  },
  words100: {
    id: 'words100',
    name: 'Word Master',
    description: 'Learn 100 words',
    category: 'learning',
    icon: 'school',
    color: '#2196F3',
    requirement: { type: 'words_learned', value: 100 },
  },
  words500: {
    id: 'words500',
    name: 'Vocabulary Expert',
    description: 'Learn 500 words',
    category: 'learning',
    icon: 'bookshelf',
    color: '#673AB7',
    requirement: { type: 'words_learned', value: 500 },
  },

  // Learning Badges - Activities
  firstActivity: {
    id: 'firstActivity',
    name: 'First Lesson',
    description: 'Complete your first activity',
    category: 'learning',
    icon: 'pencil-outline',
    color: '#00BCD4',
    requirement: { type: 'activities_completed', value: 1 },
  },
  activities10: {
    id: 'activities10',
    name: 'Active Learner',
    description: 'Complete 10 activities',
    category: 'learning',
    icon: 'pencil',
    color: '#009688',
    requirement: { type: 'activities_completed', value: 10 },
  },
  activities50: {
    id: 'activities50',
    name: 'Dedicated Student',
    description: 'Complete 50 activities',
    category: 'learning',
    icon: 'pencil-box-multiple',
    color: '#3F51B5',
    requirement: { type: 'activities_completed', value: 50 },
  },
  activities100: {
    id: 'activities100',
    name: 'Learning Champion',
    description: 'Complete 100 activities',
    category: 'learning',
    icon: 'certificate',
    color: '#E91E63',
    requirement: { type: 'activities_completed', value: 100 },
  },

  // Learning Badges - Perfect Scores
  perfectScore1: {
    id: 'perfectScore1',
    name: 'Perfect Start',
    description: 'Get your first 100% score',
    category: 'learning',
    icon: 'check-decagram',
    color: '#4CAF50',
    requirement: { type: 'perfect_score', value: 1 },
  },
  perfectScore10: {
    id: 'perfectScore10',
    name: 'Accuracy Master',
    description: 'Get 10 perfect scores',
    category: 'learning',
    icon: 'check-circle',
    color: '#8BC34A',
    requirement: { type: 'perfect_score', value: 10 },
  },
  perfectScore25: {
    id: 'perfectScore25',
    name: 'Perfectionist',
    description: 'Get 25 perfect scores',
    category: 'learning',
    icon: 'seal',
    color: '#CDDC39',
    requirement: { type: 'perfect_score', value: 25 },
  },

  // Learning Badges - All Skills
  allSkillsDaily: {
    id: 'allSkillsDaily',
    name: 'Well Rounded',
    description: 'Practice all 6 skills in one day',
    category: 'learning',
    icon: 'hexagon-multiple',
    color: '#9C27B0',
    requirement: { type: 'all_skills_daily', value: 1 },
  },

  // Learning Badges - Learning Streak
  learningStreak7: {
    id: 'learningStreak7',
    name: 'Week Learner',
    description: '7 day learning streak',
    category: 'learning',
    icon: 'calendar-check',
    color: '#FF9800',
    requirement: { type: 'learning_streak', value: 7 },
  },
  learningStreak30: {
    id: 'learningStreak30',
    name: 'Month Scholar',
    description: '30 day learning streak',
    category: 'learning',
    icon: 'calendar-star',
    color: '#FF5722',
    requirement: { type: 'learning_streak', value: 30 },
  },

  // Learning Badges - Skill Mastery
  grammarPro: {
    id: 'grammarPro',
    name: 'Grammar Pro',
    description: 'Complete 20 grammar activities',
    category: 'learning',
    icon: 'format-text',
    color: '#6366f1',
    requirement: { type: 'grammar_mastered', value: 20 },
  },
  listeningPro: {
    id: 'listeningPro',
    name: 'Listening Pro',
    description: 'Complete 5 hours of listening',
    category: 'learning',
    icon: 'headphones',
    color: '#3b82f6',
    requirement: { type: 'listening_hours', value: 5 },
  },
  speakingPro: {
    id: 'speakingPro',
    name: 'Speaking Pro',
    description: 'Complete 20 speaking sessions',
    category: 'learning',
    icon: 'microphone',
    color: '#22c55e',
    requirement: { type: 'speaking_sessions', value: 20 },
  },
  writingPro: {
    id: 'writingPro',
    name: 'Writing Pro',
    description: 'Submit 20 writing exercises',
    category: 'learning',
    icon: 'fountain-pen-tip',
    color: '#f97316',
    requirement: { type: 'writing_submissions', value: 20 },
  },

  // Learning Badges - Level Progress
  levelA2: {
    id: 'levelA2',
    name: 'Elementary',
    description: 'Reach A2 level',
    category: 'learning',
    icon: 'arrow-up-circle',
    color: '#3b82f6',
    requirement: { type: 'level_reached', value: 2 },
  },
  levelB1: {
    id: 'levelB1',
    name: 'Intermediate',
    description: 'Reach B1 level',
    category: 'learning',
    icon: 'arrow-up-bold-circle',
    color: '#f59e0b',
    requirement: { type: 'level_reached', value: 3 },
  },
  levelB2: {
    id: 'levelB2',
    name: 'Upper Intermediate',
    description: 'Reach B2 level',
    category: 'learning',
    icon: 'rocket-launch',
    color: '#ef4444',
    requirement: { type: 'level_reached', value: 4 },
  },
};

// Get badges by category
export const getBadgesByCategory = (category: BadgeCategory): Badge[] => {
  return Object.values(BADGES).filter((badge) => badge.category === category);
};

// Get all badge IDs
export const getAllBadgeIds = (): string[] => {
  return Object.keys(BADGES);
};

// Stats interface for badge checking
export interface BadgeStats {
  tasksCompleted?: number;
  streakDays?: number;
  totalStars?: number;
  gameScore?: number;
  has2048?: boolean;
  wordsLearned?: number;
  loginDays?: number;
  // Learning-specific stats
  activitiesCompleted?: number;
  perfectScores?: number;
  allSkillsDaily?: boolean;
  learningStreak?: number;
  vocabularyMastered?: number;
  grammarMastered?: number;
  listeningHours?: number;
  speakingSessions?: number;
  writingSubmissions?: number;
  currentLevel?: number; // 1=A1, 2=A2, 3=B1, 4=B2, 5=C1, 6=C2
}

// Check if a badge requirement is met
export const isBadgeUnlocked = (badge: Badge, stats: BadgeStats): boolean => {
  const { type, value } = badge.requirement;

  switch (type) {
    case 'tasks_completed':
      return (stats.tasksCompleted || 0) >= value;
    case 'streak_days':
      return (stats.streakDays || 0) >= value;
    case 'total_stars':
      return (stats.totalStars || 0) >= value;
    case 'game_score':
      return (stats.gameScore || 0) >= value;
    case 'game_2048_reached':
      return stats.has2048 === true;
    case 'words_learned':
      return (stats.wordsLearned || 0) >= value;
    case 'login_days':
      return (stats.loginDays || 0) >= value;
    // Learning-specific requirements
    case 'activities_completed':
      return (stats.activitiesCompleted || 0) >= value;
    case 'perfect_score':
      return (stats.perfectScores || 0) >= value;
    case 'all_skills_daily':
      return stats.allSkillsDaily === true;
    case 'learning_streak':
      return (stats.learningStreak || 0) >= value;
    case 'vocabulary_mastered':
      return (stats.vocabularyMastered || 0) >= value;
    case 'grammar_mastered':
      return (stats.grammarMastered || 0) >= value;
    case 'listening_hours':
      return (stats.listeningHours || 0) >= value;
    case 'speaking_sessions':
      return (stats.speakingSessions || 0) >= value;
    case 'writing_submissions':
      return (stats.writingSubmissions || 0) >= value;
    case 'level_reached':
      return (stats.currentLevel || 1) >= value;
    default:
      return false;
  }
};
