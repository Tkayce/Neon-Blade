import type { Achievement, AchievementId, ProgressionState } from '@/types/game';
import { loadProgressionState, saveProgressionState } from '@/utils/storage';
import { useCallback, useEffect, useState } from 'react';

const INITIAL_ACHIEVEMENTS: Record<AchievementId, Achievement> = {
  'first-slice': {
    id: 'first-slice',
    title: 'First Slice',
    description: 'Slice your first shape',
    icon: '🎯',
    rarity: 'common',
  },
  'combo-10': {
    id: 'combo-10',
    title: 'On Fire',
    description: 'Achieve a 10x combo',
    icon: '🔥',
    rarity: 'uncommon',
  },
  'combo-25': {
    id: 'combo-25',
    title: 'Unstoppable',
    description: 'Achieve a 25x combo',
    icon: '⚡',
    rarity: 'rare',
  },
  'combo-50': {
    id: 'combo-50',
    title: 'Legendary',
    description: 'Achieve a 50x combo',
    icon: '👑',
    rarity: 'epic',
  },
  'shapes-100': {
    id: 'shapes-100',
    title: 'Slice Master',
    description: 'Slice 100 shapes total',
    icon: '🏆',
    rarity: 'uncommon',
    progressMax: 100,
  },
  'shapes-500': {
    id: 'shapes-500',
    title: 'Shape Destroyer',
    description: 'Slice 500 shapes total',
    icon: '💎',
    rarity: 'rare',
    progressMax: 500,
  },
  'shapes-1000': {
    id: 'shapes-1000',
    title: 'Eternal Warrior',
    description: 'Slice 1000 shapes total',
    icon: '🌟',
    rarity: 'epic',
    progressMax: 1000,
  },
  'level-5': {
    id: 'level-5',
    title: 'Rising Star',
    description: 'Reach level 5',
    icon: '⭐',
    rarity: 'uncommon',
  },
  'level-10': {
    id: 'level-10',
    title: 'Peak Performance',
    description: 'Reach level 10',
    icon: '🎖️',
    rarity: 'rare',
  },
  'perfect-combo': {
    id: 'perfect-combo',
    title: 'Perfect',
    description: 'Achieve a perfect combo (no misses)',
    icon: '✨',
    rarity: 'epic',
  },
  'high-score-1000': {
    id: 'high-score-1000',
    title: 'Millionaire Club',
    description: 'Score 1000 points',
    icon: '💰',
    rarity: 'common',
  },
  'high-score-5000': {
    id: 'high-score-5000',
    title: 'Elite',
    description: 'Score 5000 points',
    icon: '🏅',
    rarity: 'rare',
  },
  'high-score-10000': {
    id: 'high-score-10000',
    title: 'Legend',
    description: 'Score 10000 points',
    icon: '🔮',
    rarity: 'epic',
  },
};

const INITIAL_PROGRESSION: ProgressionState = {
  achievements: INITIAL_ACHIEVEMENTS,
  levelProgress: {},
  totalShapesSliced: 0,
  totalGamesPlayed: 0,
  longestCombo: 0,
  unlockedLevels: [1],
};

export const useProgression = () => {
  const [progression, setProgression] = useState<ProgressionState>(INITIAL_PROGRESSION);
  const [newAchievements, setNewAchievements] = useState<AchievementId[]>([]);

  // Load progression on mount
  useEffect(() => {
    (async () => {
      const loaded = await loadProgressionState();
      if (loaded) {
        setProgression(loaded);
      }
    })();
  }, []);

  // Check and award achievements
  const checkAchievements = useCallback(
    async (gameData: {
      score: number;
      combo: number;
      shapesSliced: number;
      level: number;
      lives: number;
    }) => {
      const updated = { ...progression };
      const newUnlocked: AchievementId[] = [];

      // First Slice
      if (gameData.shapesSliced > 0 && !progression.achievements['first-slice'].unlockedAt) {
        updated.achievements['first-slice'].unlockedAt = Date.now();
        newUnlocked.push('first-slice');
      }

      // Combo achievements
      if (gameData.combo >= 10 && !progression.achievements['combo-10'].unlockedAt) {
        updated.achievements['combo-10'].unlockedAt = Date.now();
        newUnlocked.push('combo-10');
      }
      if (gameData.combo >= 25 && !progression.achievements['combo-25'].unlockedAt) {
        updated.achievements['combo-25'].unlockedAt = Date.now();
        newUnlocked.push('combo-25');
      }
      if (gameData.combo >= 50 && !progression.achievements['combo-50'].unlockedAt) {
        updated.achievements['combo-50'].unlockedAt = Date.now();
        newUnlocked.push('combo-50');
      }

      // Shape count achievements (update progress)
      updated.totalShapesSliced += gameData.shapesSliced;
      if (
        updated.totalShapesSliced >= 100 &&
        !progression.achievements['shapes-100'].unlockedAt
      ) {
        updated.achievements['shapes-100'].unlockedAt = Date.now();
        newUnlocked.push('shapes-100');
      }
      if (
        updated.totalShapesSliced >= 500 &&
        !progression.achievements['shapes-500'].unlockedAt
      ) {
        updated.achievements['shapes-500'].unlockedAt = Date.now();
        newUnlocked.push('shapes-500');
      }
      if (
        updated.totalShapesSliced >= 1000 &&
        !progression.achievements['shapes-1000'].unlockedAt
      ) {
        updated.achievements['shapes-1000'].unlockedAt = Date.now();
        newUnlocked.push('shapes-1000');
      }

      // Level achievements
      if (gameData.level >= 5 && !progression.achievements['level-5'].unlockedAt) {
        updated.achievements['level-5'].unlockedAt = Date.now();
        newUnlocked.push('level-5');
      }
      if (gameData.level >= 10 && !progression.achievements['level-10'].unlockedAt) {
        updated.achievements['level-10'].unlockedAt = Date.now();
        newUnlocked.push('level-10');
      }

      // Score achievements
      if (gameData.score >= 1000 && !progression.achievements['high-score-1000'].unlockedAt) {
        updated.achievements['high-score-1000'].unlockedAt = Date.now();
        newUnlocked.push('high-score-1000');
      }
      if (gameData.score >= 5000 && !progression.achievements['high-score-5000'].unlockedAt) {
        updated.achievements['high-score-5000'].unlockedAt = Date.now();
        newUnlocked.push('high-score-5000');
      }
      if (gameData.score >= 10000 && !progression.achievements['high-score-10000'].unlockedAt) {
        updated.achievements['high-score-10000'].unlockedAt = Date.now();
        newUnlocked.push('high-score-10000');
      }

      // Update longest combo
      if (gameData.combo > updated.longestCombo) {
        updated.longestCombo = gameData.combo;
      }

      if (newUnlocked.length > 0) {
        setProgression(updated);
        setNewAchievements(newUnlocked);
        await saveProgressionState(updated);
      }
    },
    [progression]
  );

  const updateLevelScore = useCallback(
    async (level: number, score: number) => {
      const updated = { ...progression };
      const levelProgress = updated.levelProgress[level] || {
        level,
        bestScore: 0,
        stars: 0,
        completed: false,
        attempts: 1,
        unlockedAt: Date.now(),
      };

      levelProgress.attempts = (levelProgress.attempts || 0) + 1;

      // Calculate stars based on score thresholds
      const baseScore = 500 * level;
      let stars = 0;
      if (score >= baseScore) stars = 1;
      if (score >= baseScore * 1.5) stars = 2;
      if (score >= baseScore * 2) stars = 3;

      if (score > levelProgress.bestScore) {
        levelProgress.bestScore = score;
        levelProgress.stars = Math.max(levelProgress.stars, stars);
        levelProgress.completed = true;
      }

      // Unlock next level
      if (levelProgress.completed && !updated.unlockedLevels.includes(level + 1)) {
        updated.unlockedLevels.push(level + 1);
        updated.unlockedLevels.sort((a, b) => a - b);
      }

      updated.levelProgress[level] = levelProgress;
      updated.totalGamesPlayed += 1;

      setProgression(updated);
      await saveProgressionState(updated);
    },
    [progression]
  );

  const clearNewAchievements = useCallback(() => {
    setNewAchievements([]);
  }, []);

  return {
    progression,
    newAchievements,
    checkAchievements,
    updateLevelScore,
    clearNewAchievements,
  };
};
