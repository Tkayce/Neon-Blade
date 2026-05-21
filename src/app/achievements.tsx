import { AchievementsView } from '@/components/AchievementsView';
import { useTheme } from '@/contexts/ThemeContext';
import { useProgression } from '@/hooks/useProgression';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { s } from 'react-native-wind';

export default function AchievementsPage() {
  const { theme } = useTheme();
  const { progression } = useProgression();
  const unlockedCount = Object.values(progression.achievements).filter(a => !!a.unlockedAt).length;
  const totalCount = Object.values(progression.achievements).length;

  return (
    <SafeAreaView style={[s`flex-1`, { backgroundColor: theme.background }]}>
      {/* Header with Back Button and Title */}
      <View style={[s`flex-row items-center justify-between p-4`, { backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={s`flex-row items-center`}>
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
        </TouchableOpacity>
        <View style={s`items-end`}>
          <Text style={[s`text-lg font-bold`, { color: theme.text }]}>Achievements</Text>
          <Text style={[s`text-xs`, { color: theme.textSecondary }]}>
            {unlockedCount} / {totalCount} Unlocked
          </Text>
        </View>
      </View>
      <AchievementsView achievements={progression.achievements} />
    </SafeAreaView>
  );
}
