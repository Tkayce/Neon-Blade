import { useTheme } from '@/contexts/ThemeContext';
import type { Achievement } from '@/types/game';
import React, { useEffect, useState } from 'react';
import { Animated, ScrollView, Text, View } from 'react-native';

interface AchievementDisplayProps {
  achievement: Achievement;
  isNew?: boolean;
}

const AchievementCard: React.FC<AchievementDisplayProps> = ({ achievement, isNew = false }) => {
  const { theme } = useTheme();
  const [scaleAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isNew) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  }, [isNew, scaleAnim]);

  const isUnlocked = !!achievement.unlockedAt;
  const opacity = isUnlocked ? 1 : 0.5;

  return (
    <Animated.View
      style={{
        transform: [
          {
            scale: isNew ? scaleAnim : 1,
          },
        ],
      }}
    >
      <View
        style={{
          padding: 12,
          marginHorizontal: 4,
          marginVertical: 8,
          borderRadius: 12,
          backgroundColor: isUnlocked ? theme.surface : theme.background,
          borderWidth: 2,
          borderColor: isUnlocked ? theme.primary : theme.border,
          minWidth: 100,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 32, marginBottom: 4 }}>{achievement.icon}</Text>
        <Text
          style={{
            fontSize: 12,
            fontWeight: 'bold',
            color: theme.text,
            textAlign: 'center',
            marginBottom: 2,
            opacity,
          }}
          numberOfLines={1}
        >
          {achievement.title}
        </Text>
        <Text
          style={{
            fontSize: 10,
            color: theme.textSecondary,
            textAlign: 'center',
            opacity,
          }}
          numberOfLines={2}
        >
          {achievement.description}
        </Text>
        <View
          style={{
            marginTop: 6,
            paddingHorizontal: 6,
            paddingVertical: 2,
            backgroundColor:
              achievement.rarity === 'common'
                ? '#888'
                : achievement.rarity === 'uncommon'
                  ? '#2ecc71'
                  : achievement.rarity === 'rare'
                    ? '#3498db'
                    : '#9b59b6',
            borderRadius: 4,
          }}
        >
          <Text style={{ fontSize: 8, color: '#fff', fontWeight: 'bold', textTransform: 'capitalize' }}>
            {achievement.rarity}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

interface AchievementsViewProps {
  achievements: Record<string, Achievement>;
  newAchievements?: string[];
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({
  achievements,
  newAchievements = [],
}) => {
  const { theme } = useTheme();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} showsVerticalScrollIndicator={false}>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          paddingVertical: 16,
        }}
      >
        {Object.values(achievements).map(achievement => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            isNew={newAchievements.includes(achievement.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
};
