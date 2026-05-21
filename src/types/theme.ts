export type ThemeMode = 'light' | 'dark';

export interface GameSettings {
  theme: ThemeMode;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
  showTutorial: boolean;
}

export interface Theme {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  shapes: {
    circle: string;
    square: string;
    glitch: string;
  };
  trail: string;
}

export const lightTheme: Theme = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  primary: '#6366F1',
  secondary: '#8B5CF6',
  accent: '#06B6D4',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  shapes: {
    circle: '#06B6D4',
    square: '#8B5CF6',
    glitch: '#EF4444',
  },
  trail: '#6366F1',
};

export const darkTheme: Theme = {
  background: '#000000',
  surface: '#111827',
  primary: '#818CF8',
  secondary: '#A78BFA',
  accent: '#06B6D4',
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  border: '#374151',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  shapes: {
    circle: '#00FFFF',
    square: '#FF00FF',
    glitch: '#FF0000',
  },
  trail: '#00FFFF',
};