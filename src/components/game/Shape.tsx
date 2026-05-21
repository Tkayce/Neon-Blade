import { useTheme } from '@/contexts/ThemeContext';
import type { GameDimensions, GameShape } from '@/types/game';
import { Canvas, Circle, Paint, Rect } from '@shopify/react-native-skia';
import React from 'react';
import { View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { s } from 'react-native-wind';

interface ShapeProps {
  shape: GameShape;
  dimensions: GameDimensions;
  onReachBottom?: (id: string) => void;
  onDestroy?: (id: string) => void;
  difficulty?: 'easy' | 'normal' | 'hard';
}

const Shape: React.FC<ShapeProps> = ({ shape, dimensions, onReachBottom, onDestroy, difficulty = 'normal' }) => {
  const { theme } = useTheme();
  const { id, type, size, color } = shape;

  // Create SharedValues for animation
  const x = useSharedValue(shape.x);
  const y = useSharedValue(shape.y);
  const rotation = useSharedValue(shape.rotation);
  
  // Animation for slicing effect
  const scaleValue = useSharedValue(1);
  const opacityValue = useSharedValue(1);

  // Start falling animation when component mounts
  React.useEffect(() => {
    if (!shape.isSliced) {
      if (shape.isHalf) {
        // Half pieces fly apart with split velocities
        const splitDuration = 1000; // 1 second split animation
        
        // Animate to split position
        x.value = withTiming(
          x.value + (shape.velocity.x * 0.5), // Move in split direction
          { duration: splitDuration }
        );
        
        y.value = withTiming(
          y.value + (shape.velocity.y * 0.5), // Apply split velocity
          { duration: splitDuration }
        );
        
        // Add spinning rotation for dramatic effect
        rotation.value = withTiming(
          rotation.value + (shape.halfSide === 'left' ? -Math.PI * 2 : Math.PI * 2),
          { duration: splitDuration }
        );
        
        // Fade out during split
        opacityValue.value = withTiming(0, { 
          duration: splitDuration,
        }, (finished) => {
          if (finished && onDestroy) {
            runOnJS(onDestroy)(id);
          }
        });
        
      } else {
        // Normal falling animation for whole shapes
        // Apply difficulty modifier to fall duration
        const difficultyMultiplier = {
          easy: 1.4,    // 40% slower (4.2-7 seconds)
          normal: 1.0,  // base speed (3-5 seconds)
          hard: 0.65,   // 35% faster (1.95-3.25 seconds)
        }[difficulty] || 1.0;
        const fallDuration = (3000 + Math.random() * 2000) * difficultyMultiplier; // Adjusted by difficulty
        
        y.value = withTiming(
          dimensions.height + size,
          { duration: fallDuration },
          (finished) => {
            if (finished && onReachBottom) {
              runOnJS(onReachBottom)(id);
            }
          }
        );

        // Add slight horizontal drift
        const driftAmount = (Math.random() - 0.5) * 50;
        x.value = withTiming(x.value + driftAmount, { 
          duration: fallDuration 
        });

        // Add rotation
        rotation.value = withTiming(
          Math.random() * Math.PI * 2,
          { duration: fallDuration }
        );
      }
    }
  }, [shape.isSliced, shape.isHalf, y, x, rotation, dimensions.height, size, id, onReachBottom, onDestroy, shape.velocity, shape.halfSide, opacityValue, difficulty]);

  // Trigger slice animation
  React.useEffect(() => {
    if (shape.isSliced) {
      // Scale down and fade out when sliced
      scaleValue.value = withSequence(
        withTiming(1.2, { duration: 100 }),
        withTiming(0, { duration: 200 })
      );
      opacityValue.value = withTiming(0, { duration: 300 });

      // Clean up after animation
      setTimeout(() => {
        onDestroy?.(id);
      }, 300);
    }
  }, [shape.isSliced, scaleValue, opacityValue, id, onDestroy]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotate: `${rotation.value}rad` },
      { scale: scaleValue.value },
    ],
    opacity: opacityValue.value,
  }));

  // Position values are available via the shared values
  // x.value and y.value can be accessed for collision detection
  // without mutating the original shape object

  return (
    <Animated.View 
      style={[
        s`absolute`,
        {
          width: size * 2,
          height: size * 2,
          left: -size,
          top: -size,
        },
        animatedStyle
      ]}
    >
      {shape.isHalf ? (
        // Render half piece with proper cut effect
        <View style={s`w-full h-full overflow-hidden`}>
          {/* Half shape with transparent/hollow effect */}
          <View 
            style={[ 
              s`absolute border-4 rounded-lg shadow-lg`,
              {
                width: size * 2,
                height: size * 2,
                borderColor: color,
                backgroundColor: theme.background, // Match background color
                borderRadius: type === 'circle' ? size : size * 0.2,
                shadowColor: color,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 15,
                elevation: 12,
                // Clip to show only half
                transform: [
                  { translateX: shape.halfSide === 'left' ? 0 : -size }
                ],
              }
            ]}
          >
            {/* Inner glow effect */}
            <View 
              style={[ 
                s`absolute inset-2 rounded-lg`,
                {
                  backgroundColor: theme.background, // Match background color
                  borderRadius: type === 'circle' ? size * 0.8 : size * 0.1,
                }
              ]}
            />
          </View>
          {/* Cut line effect with glow */}
          <View 
            style={[ 
              s`absolute top-0 bottom-0 shadow-lg`,
              {
                width: 3,
                backgroundColor: '#FFFFFF',
                shadowColor: '#FFFFFF',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.9,
                shadowRadius: 8,
                left: shape.halfSide === 'left' ? size : size - 3,
              }
            ]}
          />
        </View>
      ) : (
        // Render whole shape with hollow/transparent effect
        <View style={s`w-full h-full`}>
          {/* Outer border */}
          <View 
            style={[ 
              s`border-4 shadow-lg`,
              {
                width: size * 2,
                height: size * 2,
                borderColor: color,
                backgroundColor: theme.background, // Match background color
                borderRadius: type === 'circle' ? size : size * 0.2,
                shadowColor: color,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.7,
                shadowRadius: 12,
                elevation: 10,
              }
            ]}
          >
            {/* Inner glow */}
            <View 
              style={[ 
                s`absolute inset-2 rounded-lg`,
                {
                  backgroundColor: theme.background, // Match background color
                  borderRadius: type === 'circle' ? size * 0.8 : size * 0.1,
                }
              ]}
            />
            {/* Center highlight */}
            <View 
              style={[ 
                s`absolute`,
                {
                  width: size * 0.6,
                  height: size * 0.6,
                  left: size * 0.7,
                  top: size * 0.7,
                  backgroundColor: theme.background, // Match background color
                  borderRadius: type === 'circle' ? size * 0.3 : size * 0.1,
                }
              ]}
            />
          </View>
        </View>
      )}
      
      {/* Enhanced Canvas rendering for additional effects */}
      <Canvas style={{ 
        width: size * 2, 
        height: size * 2,
        position: 'absolute',
        top: 0,
        left: 0,
      }}>
        {type === 'circle' ? (
          <Circle cx={size} cy={size} r={size * 0.9}>
            <Paint
              color={theme.background}
              style="fill"
            />
          </Circle>
        ) : (
          <Rect x={size * 0.1} y={size * 0.1} width={size * 1.8} height={size * 1.8}>
            <Paint
              color={theme.background}
              style="fill"
            />
          </Rect>
        )}
      </Canvas>
    </Animated.View>
  );
};

export default Shape;

