import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { s } from 'react-native-wind';

interface TutorialOverlayProps {
  visible: boolean;
  onClose: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ visible, onClose }) => {
  const { theme } = useTheme();

  const ShapeExample = ({ 
    color, 
    shape, 
    points, 
    description 
  }: { 
    color: string; 
    shape: 'circle' | 'square'; 
    points: number; 
    description: string; 
  }) => (
    <View style={[
      s`flex-row items-center my-2 p-3 rounded-lg border`,
      { borderColor: color + '40', backgroundColor: color + '10' }
    ]}>
      <View style={[
        s`mr-3`,
        {
          width: 40,
          height: 40,
          backgroundColor: color,
          borderRadius: shape === 'circle' ? 20 : 6,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 8,
          elevation: 5,
        }
      ]} />
      <View style={s`flex-1`}>
        <Text style={s`text-sm font-semibold text-gray-200`}>
          {description}
        </Text>
        <Text style={s`text-xs text-gray-400 mt-0.5`}>
          +{points} pts
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[s`flex-1 justify-center items-center px-5`, { backgroundColor: 'rgba(0, 0, 0, 0.85)' }]}>
        <View style={[
          s`rounded-2xl p-6 w-full border`,
          { 
            maxWidth: 400,
            backgroundColor: theme.background,
            borderColor: theme.border,
          }
        ]}>
          {/* Header */}
          <View style={s`flex-row justify-between items-start mb-4`}>
            <View style={s`flex-1`}>
              <Text style={[s`text-2xl font-bold mb-1`, { color: theme.primary }]}>
                Neon Blade
              </Text>
              <Text style={s`text-xs text-gray-400`}>
                quick guide
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[s`p-2 rounded-full`, { backgroundColor: theme.surface }]}
            >
              <Ionicons name="close" size={18} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Main Description */}
          <Text style={s`text-sm leading-5 text-gray-200 mb-5`}>
            Swipe across shapes as they fall. Quick reflexes = big points. Don't touch the red ones.
          </Text>

          {/* Shape Types */}
          <Text style={s`text-xs font-bold text-gray-400 uppercase tracking-wider mb-3`}>
            what to slice
          </Text>

          <ShapeExample
            color={theme.shapes.circle}
            shape="circle"
            points={10}
            description="Circles"
          />

          <ShapeExample
            color={theme.shapes.square}
            shape="square"
            points={15}
            description="Squares (better reward)"
          />

          {/* Red Shape Warning */}
          <View style={[
            s`flex-row items-start my-3 p-3 rounded-lg border-l-4`,
            { 
              backgroundColor: theme.error + '15',
              borderLeftColor: theme.error,
            }
          ]}>
            <Text style={s`text-lg mr-3`}>🚫</Text>
            <View style={s`flex-1`}>
              <Text style={[s`text-sm font-semibold`, { color: theme.error }]}>
                Red shapes = instant reset
              </Text>
              <Text style={s`text-xs text-gray-400 mt-1`}>
                Avoid these. Seriously.
              </Text>
            </View>
          </View>

          {/* Tips Section */}
          <View style={s`mt-4 mb-3`}>
            <Text style={s`text-xs font-bold text-gray-400 uppercase tracking-wider mb-2`}>
              pro tips
            </Text>
            <Text style={s`text-xs leading-4 text-gray-200`}>
              Fast combos get you multipliers{'\n'}
              More points = faster spawn rates{'\n'}
              Higher difficulty = higher stakes
            </Text>
          </View>

          {/* Start Button */}
          <TouchableOpacity
            onPress={onClose}
            style={[
              s`py-3.5 rounded-xl mt-5 items-center`,
              {
                backgroundColor: theme.primary,
                shadowColor: theme.primary,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 6,
              }
            ]}
          >
            <Text style={s`text-base font-bold text-white`}>
              Got it
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default TutorialOverlay;