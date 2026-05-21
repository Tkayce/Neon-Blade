import React from 'react';
import { Text } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { s } from 'react-native-wind';

interface FloatingTextProps {
  text: string;
  x: number;
  y: number;
  color: string;
  type: 'bonus' | 'warning' | 'combo';
  onComplete?: () => void;
}

const FloatingText: React.FC<FloatingTextProps> = ({ 
  text, 
  x, 
  y, 
  color, 
  type,
  onComplete 
}) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    // Initial pop-in animation
    scale.value = withSequence(
      withTiming(1.2, { duration: 150 }),
      withTiming(1, { duration: 100 })
    );

    // Float animation based on type
    if (type === 'bonus') {
      // Float up and slightly to the side
      translateY.value = withTiming(-100, { duration: 1500 });
      translateX.value = withTiming((Math.random() - 0.5) * 60, { duration: 1500 });
      
      // Fade out after delay
      setTimeout(() => {
        opacity.value = withTiming(0, { duration: 500 }, (finished) => {
          if (finished && onComplete) {
            runOnJS(onComplete)();
          }
        });
      }, 1000);
      
    } else if (type === 'warning') {
      // Shake warning animation
      translateX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      
      // Stay longer for warnings
      setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 }, (finished) => {
          if (finished && onComplete) {
            runOnJS(onComplete)();
          }
        });
      }, 1500);
      
    } else if (type === 'combo') {
      // Pulse and float for combos
      scale.value = withSequence(
        withTiming(1.5, { duration: 200 }),
        withTiming(1, { duration: 200 })
      );
      
      translateY.value = withTiming(-80, { duration: 1200 });
      
      setTimeout(() => {
        opacity.value = withTiming(0, { duration: 400 }, (finished) => {
          if (finished && onComplete) {
            runOnJS(onComplete)();
          }
        });
      }, 800);
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  const getTextStyle = () => {
    switch (type) {
      case 'bonus':
        return s`text-2xl font-bold text-center`;
      case 'warning':
        return s`text-xl font-extrabold text-center`;
      case 'combo':
        return s`text-3xl font-extrabold text-center`;
      default:
        return s`text-xl font-bold text-center`;
    }
  };

  return (
    <Animated.View 
      style={[
        {
          position: 'absolute',
          left: x - 50, // Center the text
          top: y - 20,
          width: 100,
          pointerEvents: 'none',
          zIndex: 1000,
        },
        animatedStyle
      ]}
    >
      <Text 
        style={[
          getTextStyle(),
          { 
            color: color,
            textShadowColor: 'rgba(0,0,0,0.8)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 2,
          }
        ]}
      >
        {text}
      </Text>
    </Animated.View>
  );
};

export default FloatingText;