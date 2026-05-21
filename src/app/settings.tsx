import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';

const Settings: React.FC = () => {
  const { theme, themeMode, settings, toggleTheme, updateSettings } = useTheme();

  const SettingRow = ({ 
    title, 
    subtitle, 
    rightElement 
  }: { 
    title: string; 
    subtitle?: string; 
    rightElement: React.ReactNode; 
  }) => (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.surface,
      padding: 16,
      marginVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
    }}>
      <View style={{ flex: 1 }}>
        <Text style={{ 
          fontSize: 16, 
          fontWeight: '600', 
          color: theme.text,
          marginBottom: subtitle ? 4 : 0,
        }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{ 
            fontSize: 14, 
            color: theme.textSecondary,
          }}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement}
    </View>
  );

  const DifficultySelector = () => (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {['easy', 'normal', 'hard'].map((level) => (
        <TouchableOpacity
          key={level}
          onPress={() => updateSettings({ difficulty: level as any })}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            backgroundColor: settings.difficulty === level ? theme.primary : theme.surface,
            borderWidth: 1,
            borderColor: settings.difficulty === level ? theme.primary : theme.border,
          }}
        >
          <Text style={{
            fontSize: 12,
            fontWeight: '600',
            color: settings.difficulty === level ? '#FFFFFF' : theme.text,
            textTransform: 'capitalize',
          }}>
            {level}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: theme.background,
    }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: 60,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        backgroundColor: theme.surface,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            padding: 8,
            borderRadius: 20,
            backgroundColor: theme.background,
          }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: theme.text,
          marginLeft: 16,
        }}>
          Settings
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        {/* Appearance Section */}
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: theme.text,
          marginBottom: 12,
          marginTop: 8,
        }}>
          Appearance
        </Text>

        <SettingRow
          title="Dark Mode"
          subtitle="Switch between light and dark themes"
          rightElement={
            <Switch
              value={themeMode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          }
        />

        {/* Gameplay Section */}
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: theme.text,
          marginBottom: 12,
          marginTop: 24,
        }}>
          Gameplay
        </Text>

        <SettingRow
          title="Difficulty"
          subtitle="Adjust game difficulty level"
          rightElement={<DifficultySelector />}
        />

        <SettingRow
          title="Show Tutorial"
          subtitle="Display tutorial on next game start"
          rightElement={
            <Switch
              value={settings.showTutorial}
              onValueChange={(value) => updateSettings({ showTutorial: value })}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          }
        />

        {/* Audio & Haptics Section */}
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: theme.text,
          marginBottom: 12,
          marginTop: 24,
        }}>
          Audio & Haptics
        </Text>

        <SettingRow
          title="Sound Effects"
          subtitle="Enable game sound effects"
          rightElement={
            <Switch
              value={settings.soundEnabled}
              onValueChange={(value) => updateSettings({ soundEnabled: value })}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          }
        />

        <SettingRow
          title="Vibration"
          subtitle="Enable haptic feedback"
          rightElement={
            <Switch
              value={settings.vibrationEnabled}
              onValueChange={(value) => updateSettings({ vibrationEnabled: value })}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          }
        />

        {/* Game Rules Section */}
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: theme.text,
          marginBottom: 12,
          marginTop: 24,
        }}>
          How to Play
        </Text>

        <View style={{
          backgroundColor: theme.surface,
          padding: 18,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.border,
          paddingBottom: 24,
        }}>
          <Text style={{ fontSize: 14, color: theme.text, lineHeight: 20 }}>
            <Text style={{ fontWeight: 'bold', color: theme.shapes.circle }}>🔵 Cyan Circles</Text> - Slice for 10 points{'\n'}
            <Text style={{ fontWeight: 'bold', color: theme.shapes.square }}>🟪 Magenta Squares</Text> - Slice for 15 points{'\n'}
            <Text style={{ fontWeight: 'bold', color: theme.shapes.glitch }}>🔴 Red Glitch Shapes</Text> - Avoid! Resets your score{'\n\n'}
            <Text style={{ fontWeight: 'bold' }}>Build combos</Text> by slicing multiple shapes quickly for bonus points!
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

export default Settings;