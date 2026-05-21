import type { Achievement, AchievementId, DailyChallenge, LeaderboardEntry, LeaderboardState, LevelProgress, ProgressionState } from '@/types/game';
import AsyncStorage from '@react-native-async-storage/async-storage';

// High Scores
export const saveHighScores = async (scores: Record<number, number>) => {
  try {
    await AsyncStorage.setItem('highScoresByLevel', JSON.stringify(scores));
  } catch (e) {
    // handle error
  }
};

export const loadHighScores = async (): Promise<Record<number, number>> => {
  try {
    const value = await AsyncStorage.getItem('highScoresByLevel');
    if (value) return JSON.parse(value);
  } catch (e) {
    // handle error
  }
  return {};
};

// Progression System
export const saveProgressionState = async (progression: ProgressionState) => {
  try {
    await AsyncStorage.setItem('progressionState', JSON.stringify(progression));
  } catch (e) {
    // handle error
  }
};

export const loadProgressionState = async (): Promise<ProgressionState | null> => {
  try {
    const value = await AsyncStorage.getItem('progressionState');
    if (value) return JSON.parse(value);
  } catch (e) {
    // handle error
  }
  return null;
};

export const updateAchievement = async (progression: ProgressionState, achievementId: AchievementId, updates: Partial<Achievement>) => {
  if (progression.achievements[achievementId]) {
    progression.achievements[achievementId] = {
      ...progression.achievements[achievementId],
      ...updates,
    };
    await saveProgressionState(progression);
  }
};

export const updateLevelProgress = async (progression: ProgressionState, level: number, updates: Partial<LevelProgress>) => {
  if (!progression.levelProgress[level]) {
    progression.levelProgress[level] = {
      level,
      bestScore: 0,
      stars: 0,
      completed: false,
      attempts: 0,
      ...updates,
    };
  } else {
    progression.levelProgress[level] = {
      ...progression.levelProgress[level],
      ...updates,
    };
  }
  await saveProgressionState(progression);
};

// Leaderboards
export const saveLeaderboardState = async (leaderboard: LeaderboardState) => {
  try {
    await AsyncStorage.setItem('leaderboardState', JSON.stringify(leaderboard));
  } catch (e) {
    // handle error
  }
};

export const loadLeaderboardState = async (): Promise<LeaderboardState | null> => {
  try {
    const value = await AsyncStorage.getItem('leaderboardState');
    if (value) return JSON.parse(value);
  } catch (e) {
    // handle error
  }
  return null;
};

export const addLeaderboardEntry = async (leaderboard: LeaderboardState, entry: LeaderboardEntry) => {
  leaderboard.local.push(entry);
  // Keep top 100 entries only
  leaderboard.local.sort((a, b) => b.score - a.score);
  leaderboard.local = leaderboard.local.slice(0, 100);
  await saveLeaderboardState(leaderboard);
};

export const saveDailyChallenge = async (leaderboard: LeaderboardState, challenge: DailyChallenge) => {
  leaderboard.dailyChallenges[challenge.date] = challenge;
  await saveLeaderboardState(leaderboard);
};

export const getDailyChallenge = async (leaderboard: LeaderboardState, date: string): Promise<DailyChallenge | null> => {
  return leaderboard.dailyChallenges[date] || null;
};

export const setPlayerName = async (leaderboard: LeaderboardState, playerName: string) => {
  leaderboard.playerName = playerName;
  await saveLeaderboardState(leaderboard);
};
