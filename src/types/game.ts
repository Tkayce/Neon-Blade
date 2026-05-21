
// Trail system for tracking finger movement
export interface TrailPoint {
  x: number;
  y: number;
  timestamp: number;
  opacity?: number;
}

export interface Trail {
  points: TrailPoint[];
  isActive: boolean;
}

// Game shapes that can be sliced
export interface GameShape {
  id: string;
  type: 'circle' | 'square' | 'glitch';
  x: number; // Initial x position, converted to SharedValue in Spawner
  y: number; // Initial y position, converted to SharedValue in Spawner
  size: number;
  velocity: {
    x: number;
    y: number;
  };
  rotation: number; // Initial rotation, converted to SharedValue in Spawner
  color: string;
  isSliced: boolean;
  createdAt: number;
  // Properties for split pieces
  isHalf?: boolean;
  halfSide?: 'left' | 'right';
  originalSize?: number;
  sliceAngle?: number;
}

// Animated floating text for scores and warnings
export interface FloatingTextData {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  type: 'bonus' | 'warning' | 'combo';
  createdAt: number;
}

// Game state management
export type GameStatus = 'menu' | 'playing' | 'paused' | 'gameOver' | 'tutorial';

export interface GameState {
  score: number;
  lastScore: number;
  highScore: number;
  highScoresByLevel: Record<number, number>; // New: highest score per level
  combo: number;
  status: GameStatus;
  shapes: GameShape[];
  trail: Trail;
  lives: number;
  level: number;
  shapesSliced: number;
  floatingTexts: FloatingTextData[];
}

// Collision detection
export interface CollisionResult {
  hasCollision: boolean;
  shape?: GameShape;
  intersectionPoints?: TrailPoint[];
}

// Screen dimensions for game bounds
export interface GameDimensions {
  width: number;
  height: number;
}

// Progression system - Achievements
export type AchievementId = 
  | 'first-slice'
  | 'combo-10'
  | 'combo-25'
  | 'combo-50'
  | 'shapes-100'
  | 'shapes-500'
  | 'shapes-1000'
  | 'level-5'
  | 'level-10'
  | 'perfect-combo'
  | 'high-score-1000'
  | 'high-score-5000'
  | 'high-score-10000';

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  icon: string; // emoji or icon name
  unlockedAt?: number; // timestamp
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  progress?: number; // current progress (0-1)
  progressMax?: number; // max progress for percentage-based achievements
}

export interface LevelProgress {
  level: number;
  bestScore: number;
  stars: number; // 0-3 stars based on score thresholds
  completed: boolean;
  attempts: number;
  unlockedAt?: number;
}

export interface ProgressionState {
  achievements: Record<AchievementId, Achievement>;
  levelProgress: Record<number, LevelProgress>;
  totalShapesSliced: number;
  totalGamesPlayed: number;
  longestCombo: number;
  unlockedLevels: number[];
}

// Leaderboard system
export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  level: number;
  timestamp: number;
  combo: number;
  shapesSliced: number;
}

export interface DailyChallenge {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  modifiers: {
    speedMultiplier: number;
    spawnRateMultiplier: number;
    pointsMultiplier: number;
  };
  targetScore: number;
  reward: number; // bonus points
  completed: boolean;
  bestScore: number;
}

export interface LeaderboardState {
  local: LeaderboardEntry[];
  dailyChallenges: Record<string, DailyChallenge>;
  playerName: string;
}