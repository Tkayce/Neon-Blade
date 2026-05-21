import FloatingText from '@/components/game/FloatingText';
import Spawner from '@/components/game/Spawner';
import NewAchievementNotification from '@/components/NewAchievementNotification';
import TutorialOverlay from '@/components/TutorialOverlay';
import { useTheme } from '@/contexts/ThemeContext';
import { useGameLogic } from '@/hooks/useGameLogic';
import type { GameDimensions, Trail, TrailPoint } from '@/types/game';
import { Ionicons } from '@expo/vector-icons';
import { Canvas, Paint, Path, Skia } from '@shopify/react-native-skia';
import { router } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { AppState, Dimensions, SafeAreaView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { s } from 'react-native-wind';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const GameContainer: React.FC = () => {
  const { theme, themeMode, settings, updateSettings } = useTheme();
  
  // Game dimensions
  const gameDimensions: GameDimensions = {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  };

  // Game logic hook
  const {
    gameState,
    spawnShape,
    handleShapeReachBottom,
    handleShapeDestroy,
    updateTrail,
    startGame,
    pauseGame,
    gameOver,
    resetGame,
    removeFloatingText,
    progression,
    leaderboard,
  } = useGameLogic({ dimensions: gameDimensions });

  // Trail state
  const [trail, setTrail] = React.useState<Trail>({
    points: [],
    isActive: false,
  });

  // Track gesture state with ref for synchronous access
  const isGestureActiveRef = React.useRef(false);

  // Tutorial state
  const [showTutorial, setShowTutorial] = React.useState(settings.showTutorial);

  // Shared values for smooth animation
  const trailOpacity = useSharedValue(1);

  // Spawn shapes periodically when playing
  useEffect(() => {
    if (gameState.status !== 'playing') return;
    
    // Apply difficulty modifier to spawn rate
    const difficultyMultiplier = {
      easy: 1.5,    // 50% slower
      normal: 1.0,  // base speed
      hard: 0.7,    // 30% faster
    }[settings.difficulty] || 1.0;
    
    const spawnInterval = setInterval(() => {
      spawnShape();
    }, Math.max(600, Math.round((1500 - (gameState.level - 1) * 100) * difficultyMultiplier))); // Faster spawning as level increases, adjusted by difficulty

    return () => clearInterval(spawnInterval);
  }, [gameState.status, gameState.level, spawnShape, settings.difficulty]);

  // Reset gesture state when game status changes
  useEffect(() => {
    if (gameState.status !== 'playing') {
      isGestureActiveRef.current = false;
    }
  }, [gameState.status]);

  // Handle app state changes (background/foreground)
  const handleAppStateChange = useCallback((state: string) => {
    if (state === 'background' || state === 'inactive') {
      // Pause game when app goes to background
      if (gameState.status === 'playing') {
        pauseGame();
      }
    }
  }, [gameState.status, pauseGame]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [handleAppStateChange]);

  // Close tutorial and start game
  const handleCloseTutorial = useCallback(() => {
    setShowTutorial(false);
    updateSettings({ showTutorial: false });
    if (gameState.status === 'menu') {
      startGame();
    }
  }, [gameState.status, startGame, updateSettings]);

  // Create Skia path from trail points
  const createTrailPath = () => {
    if (trail.points.length < 2) return null;

    const path = Skia.Path.Make();
    const firstPoint = trail.points[0];
    path.moveTo(firstPoint.x, firstPoint.y);

    for (let i = 1; i < trail.points.length; i++) {
      path.lineTo(trail.points[i].x, trail.points[i].y);
    }

    return path;
  };

  // Handle gesture events only when playing
  const onGestureStart = useCallback((x: number, y: number) => {
    if (gameState.status !== 'playing') return;

    isGestureActiveRef.current = true;
    
    const newPoint: TrailPoint = {
      x,
      y,
      timestamp: Date.now(),
      opacity: 1,
    };

    const newTrail: Trail = {
      points: [newPoint],
      isActive: true,
    };

    setTrail(newTrail);
    updateTrail(newTrail);
    trailOpacity.value = 1;
  }, [gameState.status, trailOpacity, updateTrail]);

  const onGestureUpdate = useCallback((x: number, y: number) => {
    if (gameState.status !== 'playing') return;
    
    // Use ref to check if gesture is active - synchronous check
    if (!isGestureActiveRef.current) {
      return;
    }

    const newPoint: TrailPoint = {
      x,
      y,
      timestamp: Date.now(),
      opacity: 1,
    };

    setTrail((prev) => {
      const newTrail: Trail = {
        ...prev,
        points: [...prev.points, newPoint].slice(-20),
      };
      updateTrail(newTrail);
      return newTrail;
    });
  }, [gameState.status, updateTrail]);

  const onGestureEnd = useCallback(() => {
    if (gameState.status !== 'playing') return;

    isGestureActiveRef.current = false;

    setTrail((prev) => {
      const newTrail: Trail = {
        ...prev,
        isActive: false,
      };
      updateTrail(newTrail);
      return newTrail;
    });

    // Clear trail after a delay
    setTimeout(() => {
      const emptyTrail: Trail = {
        points: [],
        isActive: false,
      };
      setTrail(emptyTrail);
      updateTrail(emptyTrail);
    }, 300);
  }, [gameState.status, updateTrail]);

  // Gesture handlers - separate event vs state handling
  const handleGestureEvent = useCallback(
    (event: PanGestureHandlerGestureEvent) => {
      'worklet';
      const { absoluteX, absoluteY, x, y } = event.nativeEvent;
      
      // Prefer absolute coordinates if available, otherwise use relative
      const gestureX = absoluteX !== undefined ? absoluteX : x;
      const gestureY = absoluteY !== undefined ? absoluteY : y;
      
      if (gestureX !== undefined && gestureY !== undefined) {
        runOnJS(onGestureUpdate)(gestureX, gestureY);
      }
    },
    [onGestureUpdate]
  );

  const handleStateChange = useCallback(
    (event: PanGestureHandlerGestureEvent) => {
      'worklet';
      const { absoluteX, absoluteY, state, x, y } = event.nativeEvent;
      
      // Prefer absolute coordinates if available, otherwise use relative
      const gestureX = absoluteX !== undefined ? absoluteX : x;
      const gestureY = absoluteY !== undefined ? absoluteY : y;
      
      if (state === 4) { // BEGAN
        if (gestureX !== undefined && gestureY !== undefined) {
          runOnJS(onGestureStart)(gestureX, gestureY);
        }
      } else if (state === 3 || state === 5) { // END or CANCELLED
        runOnJS(onGestureEnd)();
      }
    },
    [onGestureStart, onGestureEnd]
  );

  const trailPath = createTrailPath();

  // UI Components
  const MenuScreen = () => (
    <SafeAreaView style={[s`flex-1 justify-center items-center p-5`, { backgroundColor: theme.background }]}> 
      <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <Text style={[s`text-5xl font-bold mb-2 text-center`, { color: theme.primary, textShadowColor: theme.primary, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20 }]}> 
        NEON BLADE
      </Text>
      <Text style={[s`text-base mb-10 text-center`, { color: theme.textSecondary }]}> 
        Slice your way to glory
      </Text>

      {gameState.highScore > 0 && (
        <Text style={[s`text-lg mb-2`, { color: theme.accent }]}>Best Score: {gameState.highScore}</Text>
      )}
      {/* Per-level high scores */}
      {gameState.highScoresByLevel && Object.keys(gameState.highScoresByLevel).length > 0 && (
        <View style={s`mb-2`}>
          <Text style={[s`text-xs text-center mb-1`, { color: theme.textSecondary }]}>High Scores by Level:</Text>
          {Object.entries(gameState.highScoresByLevel).sort((a, b) => Number(a[0]) - Number(b[0])).map(([level, score]) => (
            <Text key={level} style={[s`text-xs text-center`, { color: theme.textSecondary }]}>Level {level}: {score}</Text>
          ))}
        </View>
      )}

      <TouchableOpacity
        onPress={() => setShowTutorial(true)}
        style={[s`py-4 px-8 rounded-full mb-4 min-w-50 shadow-lg`, { backgroundColor: theme.primary, shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 }]}
      >
        <Text style={s`text-lg font-bold text-center text-white`}>Start Game</Text>
      </TouchableOpacity>

      <View style={s`flex-row gap-2 mb-4`}>
        <TouchableOpacity
          onPress={() => router.push('/achievements')}
          style={[s`py-3 px-4 rounded-lg border flex-1`, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <Text style={[s`text-base text-center`, { color: theme.text }]}>🏆 Achievements</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/leaderboard')}
          style={[s`py-3 px-4 rounded-lg border flex-1`, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <Text style={[s`text-base text-center`, { color: theme.text }]}>📊 Scores</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => router.push('/settings')}
        style={[s`py-3 px-6 rounded-2xl border`, { backgroundColor: theme.surface, borderColor: theme.border }]}
      >
        <Text style={[s`text-base text-center`, { color: theme.text }]}>Settings</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  const GameOverScreen = () => (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      flex: 1,
    }}>
      <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <View style={{
        width: '90%',
        maxWidth: 420,
        minWidth: 300,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.surface,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: theme.border,
        shadowColor: theme.primary,
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 12,
        paddingVertical: 40,
        paddingHorizontal: 28,
      }}>
        <Text style={[s`text-4xl font-bold mb-6 text-center`, { color: theme.error, textShadowColor: theme.error, textShadowRadius: 12 }]}>Game Over</Text>
        <Text style={[s`text-3xl font-bold text-center mb-4`, { color: theme.text }]}>
          Score: {gameState.lastScore ?? gameState.score}
        </Text>
        {gameState.lastScore === gameState.highScore && gameState.lastScore > 0 && (
          <Text style={[s`text-lg text-center mb-2`, { color: theme.accent }]}>🎉 New High Score!</Text>
        )}
        {gameState.highScoresByLevel && Object.keys(gameState.highScoresByLevel).length > 0 && (
          <View style={s`mb-4 w-full`}>
            <Text style={[s`text-base text-center mb-1`, { color: theme.textSecondary }]}>High Scores by Level:</Text>
            {Object.entries(gameState.highScoresByLevel).sort((a, b) => Number(a[0]) - Number(b[0])).map(([level, score]) => (
              <Text key={level} style={[s`text-base text-center`, { color: theme.textSecondary }]}>Level {level}: {score}</Text>
            ))}
          </View>
        )}
        <Text style={[s`text-base text-center mb-6`, { color: theme.textSecondary }]}>Shapes Sliced: {gameState.shapesSliced}</Text>
        <View style={s`w-full gap-2 mb-4`}>
          <TouchableOpacity
            onPress={startGame}
            style={[s`py-4 px-10 rounded-2xl`, { backgroundColor: theme.primary, elevation: 4, shadowColor: theme.primary, shadowOpacity: 0.3, shadowRadius: 8 }]}
          >
            <Text style={s`text-xl font-bold text-center text-white`}>Play Again</Text>
          </TouchableOpacity>
          <View style={s`flex-row gap-2`}>
            <TouchableOpacity
              onPress={() => router.push('/achievements')}
              style={[s`flex-1 py-3 rounded-lg border`, { backgroundColor: theme.background, borderColor: theme.border }]}
            >
              <Text style={[s`text-sm text-center`, { color: theme.text }]}>🏆</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/leaderboard')}
              style={[s`flex-1 py-3 rounded-lg border`, { backgroundColor: theme.background, borderColor: theme.border }]}
            >
              <Text style={[s`text-sm text-center`, { color: theme.text }]}>📊</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          onPress={resetGame}
          style={[s`py-4 px-10 rounded-2xl border w-full`, { backgroundColor: theme.surface, borderColor: theme.border, elevation: 2 }]}
        >
          <Text style={[s`text-xl text-center`, { color: theme.text }]}>Main Menu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const GameUI = () => (
    <>
      {/* Top UI */}
      <View style={{
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        {/* Score & Stats */}
        <View style={{
          backgroundColor: theme.surface + '90',
          padding: 16,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.border,
        }}>
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: theme.primary,
            textShadowColor: theme.primary,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 8,
          }}>
            {gameState.score}
          </Text>
          <Text style={{
            fontSize: 12,
            color: theme.textSecondary,
            marginBottom: 4,
          }}>
            SCORE
          </Text>
          {/* Debug: Shape count */}
          <Text style={{
            fontSize: 10,
            color: theme.textSecondary,
          }}>
            Shapes: {gameState.shapes.length}
          </Text>
          <Text style={{
            fontSize: 10,
            color: theme.textSecondary,
          }}>
            Trail: {trail.points.length} points
          </Text>
          {gameState.combo > 0 && (
            <Text style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: theme.accent,
            }}>
              {gameState.combo}x COMBO
            </Text>
          )}
        </View>
        {/* End Game button removed as requested */}

        {/* Lives & Controls */}
        <View style={{
          alignItems: 'flex-end',
        }}>
          {/* Lives */}
          <View style={{
            flexDirection: 'row',
            marginBottom: 8,
          }}>
            {[...Array(3)].map((_, i) => (
              <Ionicons
                key={i}
                name="heart"
                size={20}
                color={i < gameState.lives ? theme.error : theme.border}
                style={{ marginLeft: 4 }}
              />
            ))}
          </View>
          
          {/* Control Buttons */}
          <View style={{
            flexDirection: 'row',
            gap: 8,
          }}>
            <TouchableOpacity
              onPress={pauseGame}
              style={{
                backgroundColor: theme.surface + '90',
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Ionicons
                name={gameState.status === 'paused' ? 'play' : 'pause'}
                size={20}
                color={theme.text}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => router.push('/settings')}
              style={{
                backgroundColor: theme.surface + '90',
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Ionicons name="settings" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Pause Overlay */}
      {gameState.status === 'paused' && (
        <View style={[s`absolute top-0 left-0 right-0 bottom-0 justify-center items-center z-50`, { backgroundColor: 'rgba(0, 0, 0, 0.8)' }]}>
          <View style={[
            s`p-6 rounded-3xl border`,
            { 
              backgroundColor: theme.surface,
              borderColor: theme.border,
              minWidth: 280,
            }
          ]}>
            <Text style={[s`text-2xl font-bold text-center mb-5`, { color: theme.text }]}>
              Paused
            </Text>
            
            <TouchableOpacity
              onPress={pauseGame}
              style={[
                s`py-3 px-6 rounded-xl mb-3`,
                { backgroundColor: theme.primary }
              ]}
            >
              <Text style={s`text-base font-bold text-center text-white`}>
                Resume
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={startGame}
              style={[
                s`py-3 px-6 rounded-xl mb-3 border`,
                { 
                  backgroundColor: theme.surface,
                  borderColor: theme.accent,
                }
              ]}
            >
              <Text style={[s`text-base font-semibold text-center`, { color: theme.accent }]}>
                New Game
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={resetGame}
              style={[
                s`py-3 px-6 rounded-xl border`,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                }
              ]}
            >
              <Text style={[s`text-base text-center`, { color: theme.text }]}>
                Main Menu
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ 
        flex: 1, 
        backgroundColor: theme.background,
      }}>
        {/* Show menu when not playing */}
        {gameState.status === 'menu' ? (
          <MenuScreen />
        ) : (
          <>
            <PanGestureHandler 
              onGestureEvent={handleGestureEvent}
              onHandlerStateChange={handleStateChange}
              minPointers={1}
              maxPointers={1}
              shouldCancelWhenOutside={false}
              minDist={0}
            >
              <View style={{ flex: 1 }}>
                {/* Game Canvas */}
                <Canvas style={{ flex: 1 }}>
                  {trailPath && (
                    <>
                      {/* Transparent trail (no color) */}
                      <Path path={trailPath}>
                        <Paint
                          style="stroke"
                          strokeWidth={12}
                          color="rgba(0,0,0,0)"
                          strokeCap="round"
                          strokeJoin="round"
                        />
                      </Path>
                      <Path path={trailPath}>
                        <Paint
                          style="stroke"
                          strokeWidth={8}
                          color="rgba(0,0,0,0)"
                          strokeCap="round"
                          strokeJoin="round"
                        />
                      </Path>
                    </>
                  )}
                </Canvas>
                
                {/* Game Objects */}
                <Spawner
                  dimensions={gameDimensions}
                  shapes={gameState.shapes}
                  onShapeReachBottom={handleShapeReachBottom}
                  onShapeDestroy={handleShapeDestroy}
                  isActive={gameState.status === 'playing'}
                  difficulty={settings.difficulty}
                />
              </View>
            </PanGestureHandler>
            
            {/* Game UI */}
            <GameUI />
            
            {/* Floating Text Animations */}
            {gameState.floatingTexts.map((floatingText) => (
              <FloatingText
                key={floatingText.id}
                text={floatingText.text}
                x={floatingText.x}
                y={floatingText.y}
                color={floatingText.color}
                type={floatingText.type}
                onComplete={() => removeFloatingText(floatingText.id)}
              />
            ))}

            {/* New Achievement Notifications */}
            {progression.newAchievements.length > 0 && (
              <NewAchievementNotification
                achievements={progression.newAchievements.map(id => progression.progression.achievements[id])}
                onDismiss={progression.clearNewAchievements}
              />
            )}
            
            {/* Game Over Screen */}
            {gameState.status === 'gameOver' && <GameOverScreen />}
          </>
        )}

        {/* Tutorial Overlay */}
        <TutorialOverlay
          visible={showTutorial}
          onClose={handleCloseTutorial}
        />
      </View>
    </GestureHandlerRootView>
  );
};

export default GameContainer;
