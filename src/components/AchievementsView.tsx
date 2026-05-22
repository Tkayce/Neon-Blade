import { useTheme } from '@/contexts/ThemeContext';
import type { Achievement } from '@/types/game';
import React, { useEffect, useState } from 'react';
import { Animated, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface AchievementDisplayProps {
  achievement: Achievement;
  isNew?: boolean;
}

const AchievementCard: React.FC<AchievementDisplayProps> = ({ achievement, isNew = false }) => {
  const { theme } = useTheme();
  const [scaleAnim] = useState(new Animated.Value(0));
  const [pressAnim] = useState(new Animated.Value(1));
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    if (isNew) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 12,
        bounciness: 8,
      }).start();
    }
  }, [isNew, scaleAnim]);

  const isUnlocked = !!achievement.unlockedAt;
  const opacity = isUnlocked ? 1 : 0.5;

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(pressAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(pressAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const unlockedDate = achievement.unlockedAt 
    ? new Date(achievement.unlockedAt).toLocaleDateString()
    : null;

  return (
    <Animated.View
      style={{
        transform: [
          {
            scale: isNew ? scaleAnim : 1,
          },
          {
            scale: pressAnim,
          },
        ],
      }}
    >
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        disabled={!isUnlocked}
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
            shadowColor: isPressed && isUnlocked ? theme.primary : 'transparent',
            shadowOpacity: isPressed && isUnlocked ? 0.3 : 0,
            shadowRadius: 8,
            elevation: isPressed && isUnlocked ? 8 : 0,
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
          {isUnlocked && unlockedDate && (
            <Text
              style={{
                fontSize: 8,
                color: theme.textSecondary,
                marginTop: 4,
                fontStyle: 'italic',
              }}
            >
              Unlocked: {unlockedDate}
            </Text>
          )}
          {!isUnlocked && (
            <Text
              style={{
                fontSize: 8,
                color: theme.textSecondary,
                marginTop: 4,
              }}
            >
              Locked
            </Text>
          )}
        </View>
      </TouchableOpacity>
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
  const sortedAchievements = Object.values(achievements).sort((a, b) => {
    // Unlocked achievements first, then by rarity
    const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3 };
    if ((!!a.unlockedAt) !== (!!b.unlockedAt)) {
      return (!!b.unlockedAt) ? 1 : -1;
    }
    return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
  });

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
        {sortedAchievements.map(achievement => (
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
