import { LeaderboardView } from '@/components/LeaderboardView';
import { useTheme } from '@/contexts/ThemeContext';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Modal, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { s } from 'react-native-wind';

export default function LeaderboardPage() {
  const { theme } = useTheme();
  const { leaderboard, todayChallenge, getTopScores, setPlayerName } = useLeaderboard();
  const [showPlayerNameModal, setShowPlayerNameModal] = useState(false);
  const [playerNameInput, setPlayerNameInput] = useState(leaderboard.playerName);

  const handleSetPlayerName = useCallback(async () => {
    if (playerNameInput.trim()) {
      await setPlayerName(playerNameInput);
      setShowPlayerNameModal(false);
    }
  }, [playerNameInput, setPlayerName]);

  const topScores = getTopScores(100);

  return (
    <SafeAreaView style={[s`flex-1`, { backgroundColor: theme.background }]}>
      {/* Header with Back Button and Player Name */}
      <View style={[s`flex-row items-center justify-between p-4`, { backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={s`flex-row items-center`}>
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowPlayerNameModal(true)}>
          <Text style={[s`text-sm font-bold`, { color: theme.primary }]}>
            Player: {leaderboard.playerName}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Today's Challenge Section - Right under header */}
      {todayChallenge && (
        <View
          style={{
            padding: 16,
            backgroundColor: theme.background,
            marginTop: 8,
            marginHorizontal: 16,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text, marginBottom: 8 }}>
            Today's Challenge
          </Text>
          <View
            style={{
              backgroundColor: theme.surface,
              padding: 12,
              borderRadius: 8,
              borderWidth: 2,
              borderColor: todayChallenge.completed ? '#2ecc71' : theme.primary,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: theme.textSecondary }}>Target Score:</Text>
              <Text style={{ color: theme.text, fontWeight: 'bold' }}>
                {todayChallenge.targetScore}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: theme.textSecondary }}>Your Best:</Text>
              <Text style={{ color: theme.primary, fontWeight: 'bold' }}>
                {todayChallenge.bestScore}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: theme.textSecondary }}>Bonus Reward:</Text>
              <Text style={{ color: '#f39c12', fontWeight: 'bold' }}>
                +{todayChallenge.reward} pts
              </Text>
            </View>
            {todayChallenge.completed && (
              <Text
                style={{
                  marginTop: 8,
                  color: '#2ecc71',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                ✓ Completed
              </Text>
            )}
          </View>
        </View>
      )}

      <LeaderboardView
        entries={topScores}
        playerName={leaderboard.playerName}
        dailyChallenge={undefined}
      />

      <Modal
        visible={showPlayerNameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPlayerNameModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: theme.surface,
              borderRadius: 12,
              padding: 20,
              width: '100%',
              maxWidth: 300,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <Text style={[s`text-lg font-bold mb-4`, { color: theme.text }]}>
              Set Player Name
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 8,
                padding: 10,
                marginBottom: 16,
                color: theme.text,
                backgroundColor: theme.background,
              }}
              placeholder="Enter your name"
              placeholderTextColor={theme.textSecondary}
              value={playerNameInput}
              onChangeText={setPlayerNameInput}
              maxLength={20}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => setShowPlayerNameModal(false)}
                style={[s`flex-1 py-3 rounded-lg border`, { backgroundColor: theme.background, borderColor: theme.border }]}
              >
                <Text style={[s`text-center font-bold`, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSetPlayerName}
                style={[s`flex-1 py-3 rounded-lg`, { backgroundColor: theme.primary }]}
              >
                <Text style={s`text-center font-bold text-white`}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
