import { useTheme } from '@/contexts/ThemeContext';
import type { Achievement } from '@/types/game';
import React, { useEffect, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

interface NewAchievementNotificationProps {
  achievements: Achievement[];
  onDismiss?: () => void;
}

export const NewAchievementNotification: React.FC<NewAchievementNotificationProps> = ({
  achievements,
  onDismiss,
}) => {
  const { theme } = useTheme();
  const [slideAnim] = useState(new Animated.Value(-100));
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (achievements.length > 0) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();

      const timeout = setTimeout(() => {
        if (currentIndex < achievements.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          slideOut();
        }
      }, 2500);

      return () => clearTimeout(timeout);
    }
  }, [achievements, currentIndex, slideAnim]);

  const slideOut = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      onDismiss?.();
    });
  };

  if (achievements.length === 0) return null;

  const achievement = achievements[currentIndex];

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        transform: [{ translateY: slideAnim }],
        zIndex: 1000,
      }}
    >
      <TouchableOpacity onPress={slideOut} activeOpacity={0.8}>
        <View
          style={{
            backgroundColor: theme.surface,
            borderBottomWidth: 2,
            borderBottomColor: theme.primary,
            paddingHorizontal: 16,
            paddingVertical: 12,
            marginBottom: 0,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: theme.textSecondary,
              fontWeight: '600',
              marginBottom: 4,
            }}
          >
            ACHIEVEMENT UNLOCKED
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 28, marginRight: 12 }}>{achievement.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text }}>
                {achievement.title}
              </Text>
              <Text style={{ fontSize: 12, color: theme.textSecondary }}>
                {achievement.description}
              </Text>
            </View>
          </View>
          {achievements.length > 1 && (
            <Text
              style={{
                marginTop: 8,
                fontSize: 10,
                color: theme.textSecondary,
                textAlign: 'right',
              }}
            >
              {currentIndex + 1} / {achievements.length}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default NewAchievementNotification;
