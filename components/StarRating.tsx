import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing } from '../constants/theme';

interface Props {
  count: number; // 1, 2, or 3
}

export default function StarRating({ count }: Props) {
  return (
    <View style={styles.row}>
      {[1, 2, 3].map(i => (
        <Text key={i} style={[styles.star, i <= count ? styles.starOn : styles.starOff]}>
          ★
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  star: {
    fontSize: 36,
  },
  starOn: {
    color: Colors.streak,
  },
  starOff: {
    color: Colors.bgBorder,
  },
});
