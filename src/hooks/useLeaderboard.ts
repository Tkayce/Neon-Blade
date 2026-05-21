import type { DailyChallenge, LeaderboardEntry, LeaderboardState } from '@/types/game';
import {
    addLeaderboardEntry,
    getDailyChallenge,
    loadLeaderboardState,
    saveDailyChallenge,
    setPlayerName as setPlayerNameStorage
} from '@/utils/storage';
import { useCallback, useEffect, useState } from 'react';

const INITIAL_LEADERBOARD: LeaderboardState = {
  local: [],
  dailyChallenges: {},
  playerName: 'Player',
};

const generateTodayChallenge = (): DailyChallenge => {
  const today = new Date().toISOString().split('T')[0];
  const seed = today.split('-').reduce((acc, part) => acc + parseInt(part), 0);
  const random = Math.sin(seed) * 10000;
  const frac = random - Math.floor(random);

  return {
    id: `daily-${today}`,
    date: today,
    modifiers: {
      speedMultiplier: 0.8 + frac * 0.4, // 0.8 - 1.2
      spawnRateMultiplier: 0.9 + (frac * 0.5) % 0.3, // 0.9 - 1.2
      pointsMultiplier: 1 + (frac * 0.5), // 1.0 - 1.5
    },
    targetScore: Math.round(3000 + frac * 2000), // 3000-5000
    reward: Math.round(500 + frac * 500), // 500-1000
    completed: false,
    bestScore: 0,
  };
};

export const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardState>(INITIAL_LEADERBOARD);
  const [todayChallenge, setTodayChallenge] = useState<DailyChallenge | null>(null);

  // Load leaderboard on mount
  useEffect(() => {
    (async () => {
      const loaded = await loadLeaderboardState();
      if (loaded) {
        setLeaderboard(loaded);
      } else {
        setLeaderboard(INITIAL_LEADERBOARD);
      }

      // Load or generate today's challenge
      const today = new Date().toISOString().split('T')[0];
      const challenge = loaded ? await getDailyChallenge(loaded, today) : null;
      if (challenge) {
        setTodayChallenge(challenge);
      } else {
        setTodayChallenge(generateTodayChallenge());
      }
    })();
  }, []);

  const addEntry = useCallback(
    async (entry: Omit<LeaderboardEntry, 'id'>) => {
      const newEntry: LeaderboardEntry = {
        ...entry,
        id: `${Date.now()}-${Math.random()}`,
      };

      const updated = { ...leaderboard };
      await addLeaderboardEntry(updated, newEntry);
      setLeaderboard(updated);
      return newEntry;
    },
    [leaderboard]
  );

  const setPlayerName = useCallback(
    async (name: string) => {
      const updated = { ...leaderboard };
      updated.playerName = name;
      await setPlayerNameStorage(updated, name);
      setLeaderboard(updated);
    },
    [leaderboard]
  );

  const updateDailyChallenge = useCallback(
    async (score: number) => {
      if (!todayChallenge) return;

      const today = new Date().toISOString().split('T')[0];
      const updated = { ...leaderboard };
      const challenge = { ...todayChallenge };

      if (score > challenge.bestScore) {
        challenge.bestScore = score;
      }

      if (score >= challenge.targetScore && !challenge.completed) {
        challenge.completed = true;
      }

      await saveDailyChallenge(updated, challenge);
      setLeaderboard(updated);
      setTodayChallenge(challenge);
    },
    [leaderboard, todayChallenge]
  );

  const getTopScores = useCallback((limit: number = 10): LeaderboardEntry[] => {
    return [...leaderboard.local].sort((a, b) => b.score - a.score).slice(0, limit);
  }, [leaderboard]);

  const getPlayerRank = useCallback((score: number): number => {
    return [...leaderboard.local].filter(entry => entry.score > score).length + 1;
  }, [leaderboard]);

  return {
    leaderboard,
    todayChallenge,
    addEntry,
    setPlayerName,
    updateDailyChallenge,
    getTopScores,
    getPlayerRank,
  };
};
