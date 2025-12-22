# Multi-Feature Learning & Diary App

## Overview
A comprehensive mobile application built with Expo + React Native + TypeScript featuring:
1. **Enhanced Diary/Journal** - Mood tracking with 8 moods, tags, search, daily prompts, and statistics
2. **English Learning System** - CEFR A1-C2 support with 6 activity types and adaptive level testing
3. **2048 Game** - Classic puzzle game with tile animations, undo, and statistics

## Current State
- App runs successfully in Replit web environment
- All three tabs (Todo/Diary, Learn, Game) fully functional
- Local storage via AsyncStorage/Zustand for persistence

## Project Architecture

### Diary System
- `store/diaryStore.ts` - 8 mood types with color coding, tags, streaks, search, statistics
- `app/diary/[date].tsx` - Entry editor with mood selection, prompts, tag input
- `app/(tabs)/index.tsx` - Calendar view with stats dashboard
- `components/calendar/MonthView.tsx` - Monthly calendar grid

### Learning System
- `store/learnStore.ts` - CEFR A1-C2 levels, 8 weeks of content, activity tracking
- `utils/levelTest.ts` - Adaptive placement test covering all 6 CEFR levels
- `components/learn/LevelTestView.tsx` - Interactive level test UI
- `data/vocabulary.ts` - Vocabulary data organized by CEFR level

### 2048 Game
- `store/gameStore.ts` - Game state, undo history, statistics, themes
- `components/game/Tile.tsx` - Animated tiles (pop-in, merge, position transitions)
- `components/game/GameBoard.tsx` - Swipe gesture handling, game grid
- `components/game/GameHeader.tsx` - Score, undo button with badge, settings

### Technical Notes
- **expo-notifications**: Lazy loading for web platform compatibility
- **Web Compatibility**: Proxy server on port 5000 forwards to Expo dev server (19006)
- **Sound files**: Optional, handled gracefully with try-catch

## Workflow
- `Expo Web`: Runs `bash start-web.sh` for development

## Development Setup
- Expo SDK with webpack for web builds
- React Native Paper for UI components
- expo-router for navigation
- Zustand + AsyncStorage for state management
- react-native-reanimated for tile animations

## Recent Changes
- 2025-12-22: Fixed stats dashboard reactivity issue
- 2025-12-22: Added C1/C2 CEFR levels to level test
- 2025-12-22: Fixed WEEK_IDS duplicate export error
- 2025-12-22: Enhanced diary with 8 moods, tags, prompts, streaks, statistics
- 2025-12-22: Verified 2048 game animations and undo functionality

## User Preferences
- App displays in Korean by default
- Dark mode support available
