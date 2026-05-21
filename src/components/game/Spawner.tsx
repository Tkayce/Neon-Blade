import type { GameDimensions, GameShape } from '@/types/game';
import React from 'react';
import { View } from 'react-native';
import { s } from 'react-native-wind';
import Shape from './Shape';

interface SpawnerProps {
  dimensions: GameDimensions;
  shapes: GameShape[];
  onShapeReachBottom: (id: string) => void;
  onShapeDestroy: (id: string) => void;
  isActive: boolean;
  difficulty?: 'easy' | 'normal' | 'hard';
}

const Spawner: React.FC<SpawnerProps> = ({ 
  dimensions, 
  shapes, 
  onShapeReachBottom, 
  onShapeDestroy,
  isActive,
  difficulty = 'normal'
}) => {
  if (!isActive) return null;

  return (
    <View style={s`absolute top-0 left-0 right-0 bottom-0`} pointerEvents="none">
      {shapes.map((shape) => (
        <Shape
          key={shape.id}
          shape={shape}
          dimensions={dimensions}
          onReachBottom={onShapeReachBottom}
          onDestroy={onShapeDestroy}
          difficulty={difficulty}
        />
      ))}
    </View>
  );
};

export default Spawner;