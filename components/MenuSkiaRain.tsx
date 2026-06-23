import React, { useMemo } from 'react';
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
  speed: number;
  rotationSpeed: number;
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

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

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
    const loopHeight = screenHeight + 200;
    return ((currentY + 100) % loopHeight) - 100;
  });

  const rotation = useDerivedValue(() => {
    const elapsed = time.value;
    const currentRot = brick.initialRotation + elapsed * brick.rotationSpeed;
    return (currentRot * Math.PI) / 180;
  });

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
      <Rect
        x={0}
        y={0}
        width={brick.width}
        height={brick.height}
        color={brick.color}
        opacity={0.06}
      />
    </Group>
  );
}

export default function MenuSkiaRain() {
  const { width, height } = useWindowDimensions();

  const time = useSharedValue(0);

  useFrameCallback(frameInfo => {
    time.value = frameInfo.timeSinceFirstFrame;
  });

  const bricks = useMemo(() => {
    const count = 14;
    const list: BrickData[] = [];
    for (let i = 0; i < count; i++) {
      const bWidth = [20, 30, 44][i % 3];
      const bHeight = 16;
      list.push({
        id: i,
        x: rand(0, width - bWidth),
        speed: rand(0.04, 0.10),
        rotationSpeed: rand(0.01, 0.05),
        initialY: rand(-height, 0),
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
