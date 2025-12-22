# Diary Calendar App

## Overview
A mobile diary/calendar application built with Expo + React Native + TypeScript. Originally a todo list app, it has been transformed into a diary app where users can select dates on a calendar and write diary entries with mood tracking.

## Current State
- App runs successfully in Replit web environment
- Monthly calendar view displays with date selection
- Diary entries are stored locally using AsyncStorage via Zustand

## Project Architecture

### Key Components
- `components/calendar/MonthView.tsx` - Monthly calendar grid with navigation
- `store/diaryStore.ts` - Zustand store with AsyncStorage persistence for diary entries
- `app/diary/[date].tsx` - Diary entry editor page with mood selection
- `app/(tabs)/index.tsx` - Main calendar view screen

### Technical Notes
- **expo-notifications**: Uses lazy loading pattern to avoid web platform issues. The module is only dynamically imported on native platforms.
- **Web Compatibility**: Proxy server forwards port 5000 to Expo dev server on port 19006
- **Sound files**: Currently missing (warning only, not blocking)

## Workflow
- `Expo Web`: Runs `bash start-web.sh` to start Expo webpack server with proxy

## Development Setup
The app uses:
- Expo SDK with webpack for web builds
- React Native Paper for UI components
- expo-router for navigation
- Zustand + AsyncStorage for state management

## Recent Changes
- 2025-12-22: Fixed expo-notifications web compatibility by implementing lazy loading
- 2025-12-22: Resolved circular dependency between userStore and notificationService
- 2025-12-22: Converted app from todo list to diary/calendar application

## User Preferences
- App displays in Korean by default
- Dark mode support available
