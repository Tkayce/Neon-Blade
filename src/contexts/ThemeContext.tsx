import { GameSettings, Theme, ThemeMode, darkTheme, lightTheme } from '@/types/theme';
import React, { ReactNode, createContext, useContext, useState } from 'react';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  settings: GameSettings;
  toggleTheme: () => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const defaultSettings: GameSettings = {
  theme: 'dark',
  soundEnabled: true,
  vibrationEnabled: true,
  difficulty: 'normal',
  showTutorial: true,
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  
  const theme = settings.theme === 'light' ? lightTheme : darkTheme;

  const toggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const value: ThemeContextType = {
    theme,
    themeMode: settings.theme,
    settings,
    toggleTheme,
    updateSettings,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};