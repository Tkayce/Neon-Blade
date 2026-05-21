import { useTheme } from '@/contexts/ThemeContext';
import type { DailyChallenge, LeaderboardEntry } from '@/types/game';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  rank: number;
  isPlayerEntry?: boolean;
}

const LeaderboardRow: React.FC<LeaderboardRowProps> = ({ entry, rank, isPlayerEntry }) => {
  const { theme } = useTheme();

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        backgroundColor: isPlayerEntry ? theme.primary + '20' : 'transparent',
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: theme.primary,
          width: 40,
        }}
      >
        {getMedalEmoji(rank)}
      </Text>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: theme.text,
            marginBottom: 2,
          }}
          numberOfLines={1}
        >
          {entry.playerName}
        </Text>
        <Text style={{ fontSize: 12, color: theme.textSecondary }}>
          Level {entry.level} • {entry.shapesSliced} shapes • {entry.combo}x combo
        </Text>
      </View>
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.primary }}>
        {entry.score}
      </Text>
    </View>
  );
};

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
  playerName: string;
  dailyChallenge?: DailyChallenge;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  entries,
  playerName,
  dailyChallenge,
}) => {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Leaderboard List */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: theme.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text }}>
          Top Scores
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {entries.length > 0 ? (
          entries.map((entry, index) => (
            <LeaderboardRow
              key={entry.id}
              entry={entry}
              rank={index + 1}
              isPlayerEntry={entry.playerName === playerName}
            />
          ))
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 40,
            }}
          >
            <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
              No scores yet. Play a game to get on the leaderboard!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
