/**
 * Learning Journal Types
 * Daily learning records and statistics
 */

// Mood state
export type Mood = 'great' | 'good' | 'okay' | 'bad';

// Difficulty rating
export type DifficultyRating = 1 | 2 | 3 | 4 | 5;

// Activity log entry
export interface ActivityLog {
  weekId: string;
  activityId: string;
  activityTitle: string;
  activityType: string;
  timeSpent: number; // minutes
  score: number; // 0-100
  completedAt: string; // ISO timestamp
}

// Journal entry for a day
export interface JournalEntry {
  id: string; // YYYY-MM-DD format
  date: string; // YYYY-MM-DD
  learningTime: number; // Total learning time in minutes
  completedActivities: ActivityLog[];
  notes: string; // User notes (optional)
  mood?: Mood;
  difficulty?: DifficultyRating;
  tags?: string[];
  starsEarned: number; // Stars earned this day
  createdAt: string;
  updatedAt: string;
}

// Streak record for a day
export interface StreakRecord {
  date: string; // YYYY-MM-DD
  maintained: boolean; // Did user study this day?
  learningTime?: number; // minutes
  activitiesCompleted?: number;
}

// Learning streak data
export interface LearningStreak {
  currentStreak: number;
  longestStreak: number;
  lastLearningDate: string; // YYYY-MM-DD
  streakHistory: StreakRecord[]; // Recent 30 days
  totalLearningDays: number;
  updatedAt: string;
}

// Monthly statistics
export interface MonthlyStats {
  month: string; // YYYY-MM
  totalLearningTime: number; // minutes
  learningDays: number;
  completedActivities: number;
  averageDailyTime: number; // minutes
  totalStarsEarned: number;
  mostProductiveDay: string; // Weekday name
  favoriteActivityType?: string;
}

// Skill progress for radar chart
export interface SkillProgress {
  vocabulary: number; // 0-100
  grammar: number;
  listening: number;
  reading: number;
  speaking: number;
  writing: number;
  lastUpdated: string;
}

// Create journal data (input)
export interface CreateJournalData {
  date: string;
  notes?: string;
  mood?: Mood;
  difficulty?: DifficultyRating;
  tags?: string[];
}

// Update journal data (input)
export interface UpdateJournalData {
  notes?: string;
  mood?: Mood;
  difficulty?: DifficultyRating;
  tags?: string[];
}
