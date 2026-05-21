import { ThemeContext } from '@/contexts/ThemeContext';
import type { FloatingTextData, GameDimensions, GameShape, GameState, Trail } from '@/types/game';
import { loadHighScores, saveHighScores } from '@/utils/storage';
import { Audio } from 'expo-av';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLeaderboard } from './useLeaderboard';
import { useProgression } from './useProgression';

// Static mapping for sound files
const soundMap: Record<string, any> = {
  'Slice.mp3': require('../../assets/sounds/Slice.mp3'),
  'Red-Slice.mp3': require('../../assets/sounds/Red-Slice.mp3'),
  'Success.mp3': require('../../assets/sounds/Success.mp3'),
};

// Play a sound file from assets/sounds using expo-av (cross-platform)
const playSoundFile = async (fileName: string, enabled: boolean) => {
  if (!enabled) return;
  try {
    const source = soundMap[fileName];
    if (!source) return;
    const { sound } = await Audio.Sound.createAsync(
      source,
      { shouldPlay: true }
    );
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch {
    return;
  }
};

interface UseGameLogicProps {
  dimensions: GameDimensions;
}

export const useGameLogic = ({ dimensions }: UseGameLogicProps) => {
  const themeContext = useContext(ThemeContext);
  const settings = themeContext?.settings || {
    theme: 'dark',
    soundEnabled: true,
    vibrationEnabled: true,
    difficulty: 'normal',
    showTutorial: true,
  };

  // Progression and leaderboard hooks
  const progression = useProgression();
  const leaderboard = useLeaderboard();

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lastScore: 0,
    highScore: 0,
    highScoresByLevel: {},
    combo: 0,
    status: 'menu',
    shapes: [],
    trail: { points: [], isActive: false },
    lives: 3,
    level: 1,
    shapesSliced: 0,
    floatingTexts: [],
  });

  // Load high scores from storage on mount
  useEffect(() => {
    (async () => {
      const loaded = await loadHighScores();
      setGameState(prev => ({ ...prev, highScoresByLevel: loaded }));
    })();
  }, []);

  const currentComboRef = useRef(0);
  const lastSliceTimeRef = useRef(0);
  const comboTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Game control functions
  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      status: 'playing',
      score: 0,
      lastScore: 0,
      combo: 0,
      shapes: [],
      lives: 3,
      level: 1,
      shapesSliced: 0,
      trail: { points: [], isActive: false },
      floatingTexts: [],
      // Keep highScoresByLevel
    }));
    currentComboRef.current = 0;
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      status: prev.status === 'paused' ? 'playing' : 'paused',
    }));
  }, []);

  const gameOver = useCallback(() => {
    setGameState(prev => {
      const newHighScore = Math.max(prev.score, prev.highScore);
      const newHighScoresByLevel = { ...prev.highScoresByLevel };
      if (!newHighScoresByLevel[prev.level] || prev.score > newHighScoresByLevel[prev.level]) {
        newHighScoresByLevel[prev.level] = prev.score;
        saveHighScores(newHighScoresByLevel);
      }

      // Track achievements
      progression.checkAchievements({
        score: prev.score,
        combo: prev.combo,
        shapesSliced: prev.shapesSliced,
        level: prev.level,
        lives: prev.lives,
      });

      // Update level progress
      progression.updateLevelScore(prev.level, prev.score);

      // Add leaderboard entry
      leaderboard.addEntry({
        playerName: leaderboard.leaderboard.playerName,
        score: prev.score,
        level: prev.level,
        timestamp: Date.now(),
        combo: prev.combo,
        shapesSliced: prev.shapesSliced,
      });

      // Update daily challenge
      leaderboard.updateDailyChallenge(prev.score);

      return {
        ...prev,
        status: 'gameOver',
        lastScore: prev.score,
        highScore: newHighScore,
        highScoresByLevel: newHighScoresByLevel,
      };
    });
  }, [progression, leaderboard]);

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      status: 'menu',
      score: 0,
      combo: 0,
      shapes: [],
      lives: 3,
      level: 1,
      shapesSliced: 0,
      trail: { points: [], isActive: false },
    }));
    currentComboRef.current = 0;
  }, []);

  // Shape spawning logic
  const createFloatingText = useCallback((
    text: string, 
    x: number, 
    y: number, 
    color: string, 
    type: 'bonus' | 'warning' | 'combo'
  ) => {
    const newText: FloatingTextData = {
      id: `text_${Date.now()}_${Math.random()}`,
      text,
      x,
      y,
      color,
      type,
      createdAt: Date.now(),
    };

    setGameState(prev => ({
      ...prev,
      floatingTexts: [...prev.floatingTexts, newText],
    }));

    // Auto-remove after animation completes
    setTimeout(() => {
      setGameState(prevState => ({
        ...prevState,
        floatingTexts: prevState.floatingTexts.filter(t => t.id !== newText.id),
      }));
    }, 2500); // Longer timeout to ensure animation completes
  }, []);

  // Remove floating text by ID
  const removeFloatingText = useCallback((textId: string) => {
    setGameState(prev => ({
      ...prev,
      floatingTexts: prev.floatingTexts.filter(t => t.id !== textId),
    }));
  }, []);

  // Level progression - get spawn rate and difficulty based on level
  const getLevelConfig = useCallback((level: number) => {
    return {
      spawnRate: Math.max(800 - (level * 100), 300), // Faster spawning at higher levels
      maxShapes: Math.min(3 + Math.floor(level / 2), 8), // More shapes on screen
      glitchChance: Math.min(0.1 + (level * 0.05), 0.4), // More glitch shapes
      speedMultiplier: 1 + (level * 0.1), // Shapes fall faster
      pointsToNextLevel: level * 500, // Points needed for next level
    };
  }, []);

  // Check for level progression
  const checkLevelProgression = useCallback(() => {
    const config = getLevelConfig(gameState.level);
    if (gameState.score >= config.pointsToNextLevel && gameState.level < 20) {
      setGameState(prev => {
        const newLevel = prev.level + 1;
        
        // Create level up text
        setTimeout(() => {
          createFloatingText(
            `LEVEL ${newLevel}!`, 
            dimensions.width / 2, 
            dimensions.height / 3, 
            '#FFD700', 
            'combo'
          );
        }, 100);
        
        return {
          ...prev,
          level: newLevel,
        };
      });
    }
  }, [gameState.score, gameState.level, getLevelConfig, createFloatingText, dimensions]);

  // Shape creation with level-based difficulty
  const createNewShape = useCallback((): GameShape => {
    const config = getLevelConfig(gameState.level);
    const isGlitch = Math.random() < config.glitchChance; // Level-based glitch chance
    const shapeType = isGlitch ? 'glitch' : (Math.random() < 0.5 ? 'circle' : 'square');
    const size = 30 + Math.random() * 20; // 30-50px radius (larger for visibility)
    const spawnX = size + Math.random() * (dimensions.width - size * 2);
    
    const colors = {
      circle: '#00FFFF',    // Cyan
      square: '#FF00FF',    // Magenta  
      glitch: '#FF0000',    // Red
    };

    return {
      id: `shape_${Date.now()}_${Math.random()}`,
      type: shapeType,
      x: spawnX, // Just store the initial value, shared values created in spawner
      y: -size, // Start above screen
      size,
      velocity: {
        x: (Math.random() - 0.5) * 2,
        y: 2 + Math.random() * 3,
      },
      rotation: 0, // Initial rotation
      color: colors[shapeType],
      isSliced: false,
      createdAt: Date.now(),
    };
  }, [dimensions]);

  // Spawn new shapes periodically
  const spawnShape = useCallback(() => {
    if (gameState.status === 'playing') {
      const newShape = createNewShape();
      setGameState(prev => ({
        ...prev,
        shapes: [...prev.shapes, newShape],
      }));
    }
  }, [gameState.status, createNewShape]);

  // Collision detection between trail and shapes
  const checkCollisions = useCallback((trail: Trail): string[] => {
    if (trail.points.length < 2) return [];

    const slicedShapeIds: string[] = [];
    const wholeShapes = gameState.shapes.filter(shape => !shape.isHalf); // Only check whole shapes

    wholeShapes.forEach((shape) => {
      if (shape.isSliced || shape.isHalf) return; // Skip sliced shapes and halves

      // Calculate actual animation progress
      const timeElapsed = Date.now() - shape.createdAt;
      
      // Shapes fall with random durations (3000-5000ms) to reach bottom
      // Estimate fall duration based on average (4000ms)
      const estimatedFallDuration = 4000; // milliseconds
      const fallProgress = Math.min(timeElapsed / estimatedFallDuration, 1);
      
      // Calculate current position based on screen dimensions
      const totalFallDistance = dimensions.height + shape.size;
      const currentY = shape.y + (fallProgress * totalFallDistance);
      
      // Add slight horizontal drift (up to 50px over fall duration)
      const driftProgress = Math.min(fallProgress, 1);
      const maxDrift = 50;
      const currentX = shape.x + (driftProgress * (Math.random() - 0.5) * maxDrift);
      
      const { size } = shape;

      // Check if any trail point is within the shape bounds
      for (const point of trail.points) {
        const distance = Math.sqrt(
          Math.pow(point.x - currentX, 2) + Math.pow(point.y - currentY, 2)
        );

        // More generous collision area for better gameplay
        const collisionRadius = size * 1.5; // 1.5x the shape radius
        
        if (distance <= collisionRadius) {
          slicedShapeIds.push(shape.id);
          break;
        }
      }
    });

    return slicedShapeIds;
  }, [gameState.shapes, dimensions]);

  // Handle shape slicing - creates split pieces and floating text
  const handleSlice = useCallback((trail: Trail) => {
    const slicedShapeIds = checkCollisions(trail);
    
    if (slicedShapeIds.length === 0) return;

    const now = Date.now();
    const timeSinceLastSlice = now - lastSliceTimeRef.current;

    // Reset combo if too much time passed
    if (timeSinceLastSlice > 1000) { // 1 second combo window
      currentComboRef.current = 0;
    }

    // Update last slice time
    lastSliceTimeRef.current = now;

    let pointsGained = 0;
    let comboCount = 0;
    let livesLost = 0;

    // Process sliced shapes and create split pieces
    setGameState(prev => {
      const newShapes: GameShape[] = [];
      
      prev.shapes.forEach(shape => {
        if (slicedShapeIds.includes(shape.id) && !shape.isHalf) {
          // Calculate current position for splitting
          const timeElapsed = Date.now() - shape.createdAt;
          const estimatedFallDuration = 4000;
          const fallProgress = Math.min(timeElapsed / estimatedFallDuration, 1);
          const totalFallDistance = dimensions.height + shape.size;
          const currentY = shape.y + (fallProgress * totalFallDistance);
          const currentX = shape.x;
          
          // Process scoring and create floating text
          if (shape.type === 'glitch') {
            // Glitch shapes decrease lives by 1
            livesLost++;
            setTimeout(() => {
              const remainingLives = prev.lives - livesLost;
              createFloatingText(`-1 LIFE (${remainingLives} LEFT)`, currentX, currentY, '#FF4444', 'warning');
              playSoundFile('Red-Slice.mp3', settings.soundEnabled); // Red slice sound
            }, 50);
            // Don't create half pieces for glitch shapes - just skip them
            return;
          } else {
            // Normal scoring with beautiful animations
            const basePoints = shape.type === 'circle' ? 10 : 15;
            let shapePoints = basePoints;
            // Apply combo multiplier
            if (currentComboRef.current >= 3) {
              shapePoints *= 2;
            }
            pointsGained += shapePoints;
            comboCount++;
            // Create beautiful floating text
            setTimeout(() => {
              const pointText = currentComboRef.current >= 3 ? `+${shapePoints} COMBO!` : `+${shapePoints}`;
              const textColor = shape.type === 'circle' ? '#00FF88' : '#FFD700'; // Green for circles, gold for squares
              createFloatingText(pointText, currentX, currentY, textColor, 'bonus');
              // Play slice sound
              if (shape.type === 'circle' || shape.type === 'square') {
                playSoundFile('Slice.mp3', settings.soundEnabled);
              }
              // Show combo text if applicable
              if (currentComboRef.current >= 3) {
                setTimeout(() => {
                  createFloatingText(`${currentComboRef.current}x COMBO!`, currentX, currentY - 40, '#FF6B35', 'combo');
                  playSoundFile('Success.mp3', settings.soundEnabled); // Combo/bonus sound
                }, 200);
              }
            }, 50);

            // Create two half pieces with proper hollow effect
            const leftHalf: GameShape = {
              ...shape,
              id: `${shape.id}_left`,
              x: currentX - shape.size * 0.25,
              y: currentY,
              isHalf: true,
              halfSide: 'left',
              originalSize: shape.size,
              sliceAngle: Math.PI / 4,
              velocity: {
                x: -120 - Math.random() * 80,
                y: -60 - Math.random() * 40,
              },
              createdAt: now,
            };

            const rightHalf: GameShape = {
              ...shape,
              id: `${shape.id}_right`,
              x: currentX + shape.size * 0.25,
              y: currentY,
              isHalf: true,
              halfSide: 'right',
              originalSize: shape.size,
              sliceAngle: Math.PI / 4,
              velocity: {
                x: 120 + Math.random() * 80,
                y: -60 - Math.random() * 40,
              },
              createdAt: now,
            };

            newShapes.push(leftHalf, rightHalf);

            // Auto-remove half pieces after animation
            setTimeout(() => {
              setGameState(prevState => ({
                ...prevState,
                shapes: prevState.shapes.filter(s => 
                  s.id !== leftHalf.id && s.id !== rightHalf.id
                ),
              }));
            }, 1200);
          }
          
        } else if (!slicedShapeIds.includes(shape.id)) {
          newShapes.push(shape);
        }
      });

      // Update combo and score
      currentComboRef.current += comboCount;
      let finalScore = prev.score;
      let newLives = prev.lives - livesLost;
      
      // Check if any glitch shapes were sliced
      const hadGlitchSlice = prev.shapes.some(shape => 
        slicedShapeIds.includes(shape.id) && shape.type === 'glitch'
      );
      
      if (hadGlitchSlice) {
        finalScore = prev.score; // Glitch shapes no longer reset score to 0
        currentComboRef.current = 0;
      } else {
        finalScore += pointsGained;
      }

      // End game if lives reach 0
      if (newLives <= 0) {
        setTimeout(() => {
          setGameState(prevState => ({
            ...prevState,
            status: 'gameOver',
            lives: 0,
          }));
        }, 300);
        newLives = 0;
      }

      return {
        ...prev,
        shapes: newShapes,
        score: finalScore,
        combo: currentComboRef.current,
        shapesSliced: prev.shapesSliced + comboCount,
        lives: newLives,
      };
    });

    // Reset combo after delay
    if (comboTimeoutRef.current) {
      clearTimeout(comboTimeoutRef.current);
    }
    comboTimeoutRef.current = setTimeout(() => {
      currentComboRef.current = 0;
      setGameState(prev => ({ ...prev, combo: 0 }));
    }, 1000);

    // Check for level progression after scoring
    setTimeout(() => {
      checkLevelProgression();
    }, 100);

  }, [checkCollisions, dimensions, createFloatingText, checkLevelProgression]);

  // Remove shape when it reaches bottom
  const handleShapeReachBottom = useCallback((shapeId: string) => {
    setGameState(prev => ({
      ...prev,
      shapes: prev.shapes.filter(shape => shape.id !== shapeId),
    }));
  }, []);

  // Remove destroyed shape
  const handleShapeDestroy = useCallback((shapeId: string) => {
    setGameState(prev => ({
      ...prev,
      shapes: prev.shapes.filter(shape => shape.id !== shapeId),
    }));
  }, []);

  // Update trail
  const updateTrail = useCallback((newTrail: Trail) => {
    setGameState(prev => ({
      ...prev,
      trail: newTrail,
    }));

    // Check for collisions when trail is active
    if (newTrail.isActive && newTrail.points.length > 1) {
      handleSlice(newTrail);
    }
  }, [handleSlice]);

  return {
    gameState,
    spawnShape,
    handleShapeReachBottom,
    handleShapeDestroy,
    updateTrail,
    checkCollisions,
    startGame,
    pauseGame,
    gameOver,
    resetGame,
    createFloatingText,
    removeFloatingText,
    progression,
    leaderboard,
  };
};
