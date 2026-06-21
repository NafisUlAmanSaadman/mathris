import React, { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Canvas, Group, Rect } from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  useFrameCallback,
  useDerivedValue,
  SharedValue,
} from 'react-native-reanimated';
import { Colors } from '../constants/theme';

interface BrickData {
  id: number;
  x: number;
  speed: number;        // pixels per millisecond
  rotationSpeed: number; // degrees per millisecond
  initialY: number;
  initialRotation: number;
  color: string;
  width: number;
  height: number;
}

const BRICK_COLORS = [
  Colors.brickI,
  Colors.brickO,
  Colors.brickT,
  Colors.brickS,
  Colors.brickZ,
  Colors.brickJ,
  Colors.brickL,
];

// Helper to generate random number
const rand = (min: number, max: number) => Math.random() * (max - min) + min;

// Sub-component for a single falling brick to respect Rules of Hooks
function FallingBrick({
  brick,
  time,
  screenHeight,
}: {
  brick: BrickData;
  time: SharedValue<number>;
  screenHeight: number;
}) {
  const y = useDerivedValue(() => {
    const elapsed = time.value;
    const distance = elapsed * brick.speed;
    const currentY = brick.initialY + distance;
    const loopHeight = screenHeight + 200; // include top and bottom pad
    // Loop Y coordinate
    return ((currentY + 100) % loopHeight) - 100;
  });

  const rotation = useDerivedValue(() => {
    const elapsed = time.value;
    const currentRot = brick.initialRotation + elapsed * brick.rotationSpeed;
    return (currentRot * Math.PI) / 180; // convert to radians for Skia rotate transform
  });

  // Combine transformations using derived value
  const transform = useDerivedValue(() => {
    return [
      { translateX: brick.x },
      { translateY: y.value },
      { rotate: rotation.value },
    ];
  });

  return (
    <Group
      transform={transform}
      origin={{ x: brick.width / 2, y: brick.height / 2 }}
    >
      {/* Brick body */}
      <Rect
        x={0}
        y={0}
        width={brick.width}
        height={brick.height}
        color={brick.color}
        opacity={0.12} // subtle background opacity
      />
      {/* Dynamic outline to give blocky neon feel */}
      <Rect
        x={2}
        y={2}
        width={brick.width - 4}
        height={brick.height - 4}
        color={brick.color}
        opacity={0.06}
      />
    </Group>
  );
}

export default function MenuSkiaRain() {
  const { width, height } = useWindowDimensions();

  // Create a single time accumulator shared value
  const time = useSharedValue(0);

  // Tick the time value forward inside a frame callback
  useFrameCallback(frameInfo => {
    time.value = frameInfo.timeSinceFirstFrame;
  });

  // Generate falling bricks config (memoized so they don't rebuild every render)
  const bricks = useMemo(() => {
    const count = 18;
    const list: BrickData[] = [];
    for (let i = 0; i < count; i++) {
      const bWidth = [24, 36, 48][i % 3]; // standard, wide, double-wide representation
      const bHeight = 20;
      list.push({
        id: i,
        x: rand(0, width - bWidth),
        speed: rand(0.06, 0.14), // speed range: px/ms
        rotationSpeed: rand(0.02, 0.08), // rotation speed: deg/ms
        initialY: rand(-height, 0), // scattered above screen
        initialRotation: rand(0, 360),
        color: BRICK_COLORS[i % BRICK_COLORS.length],
        width: bWidth,
        height: bHeight,
      });
    }
    return list;
  }, [width, height]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <Canvas style={styles.canvas}>
        {bricks.map(brick => (
          <FallingBrick
            key={brick.id}
            brick={brick}
            time={time}
            screenHeight={height}
          />
        ))}
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
