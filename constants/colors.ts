export const COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  error: '#FF3B30', // Alias for danger

  background: '#FFF9F0', // Warm cream (was #F2F2F7)
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#C6C6C8',

  // Priority colors
  priority: {
    low: '#8E8E93',
    medium: '#FF9500',
    high: '#FF3B30',
    urgent: '#FF2D55',
  },

  // Activity colors - 활동별 고유 색상
  activity: {
    vocabulary: { main: '#FF6B6B', light: '#FFE8E8', gradient: ['#FF6B6B', '#FF8E8E'] },
    grammar: { main: '#4ECDC4', light: '#E0F7F5', gradient: ['#4ECDC4', '#7EDBD4'] },
    listening: { main: '#45B7D1', light: '#E0F4F9', gradient: ['#45B7D1', '#72C9DD'] },
    reading: { main: '#96CEB4', light: '#E8F5EE', gradient: ['#96CEB4', '#B3DBC9'] },
    speaking: { main: '#DDA0DD', light: '#F5E8F5', gradient: ['#DDA0DD', '#E6BCE6'] },
    writing: { main: '#F7DC6F', light: '#FDF8E4', gradient: ['#F7DC6F', '#F9E68F'] },
  },

  // Streak and motivation colors
  streak: {
    fire: '#FF6B35',
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
  },

  // Dark mode
  dark: {
    background: '#000000',
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
  },
} as const;

/**
 * Utility function to add alpha to a hex color
 */
export function withAlpha(color: string, alpha: number): string {
  // Remove # if present
  const hex = color.replace('#', '');

  // Parse the hex color
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
