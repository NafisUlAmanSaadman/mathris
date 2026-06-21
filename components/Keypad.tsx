import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Vibration,
  useWindowDimensions,
} from 'react-native';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../constants/theme';
import type { Difficulty } from '../constants/config';

interface Props {
  difficulty: Difficulty;
  onSubmit: (answer: string) => void;
  disabled?: boolean;
}

const KEYS = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['-', '0', '⌫'],
];

export default function Keypad({ difficulty, onSubmit, disabled }: Props) {
  const [xVal, setXVal] = useState('');
  const [yVal, setYVal] = useState('');
  const [activeField, setActiveField] = useState<'x' | 'y'>('x');
  const { width } = useWindowDimensions();

  const isHard = difficulty === 'hard';

  const currentVal = isHard ? (activeField === 'x' ? xVal : yVal) : xVal;
  const setCurrentVal = (v: string) => {
    if (isHard) {
      if (activeField === 'x') setXVal(v);
      else setYVal(v);
    } else {
      setXVal(v);
    }
  };

  const handleKey = (key: string) => {
    if (disabled) return;
    Vibration.vibrate(10);
    if (key === '⌫') {
      setCurrentVal(currentVal.slice(0, -1));
    } else {
      if (currentVal.length >= 6) return;
      setCurrentVal(currentVal + key);
    }
  };

  const handleSubmit = () => {
    if (disabled) return;
    let answer: string;
    if (isHard) {
      answer = `X=${xVal},Y=${yVal}`;
    } else {
      answer = xVal;
    }
    onSubmit(answer);
    setXVal('');
    setYVal('');
    setActiveField('x');
  };

  const keypadW = width * 0.85;

  return (
    <View style={[styles.container, { width: keypadW }]}>
      {/* Display row */}
      {isHard ? (
        <View style={styles.displayRow}>
          <TouchableOpacity
            style={[styles.displayField, activeField === 'x' && styles.displayFieldActive]}
            onPress={() => setActiveField('x')}
          >
            <Text style={styles.displayLabel}>X =</Text>
            <Text style={styles.displayValue}>{xVal || '?'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.displayField, activeField === 'y' && styles.displayFieldActive]}
            onPress={() => setActiveField('y')}
          >
            <Text style={styles.displayLabel}>Y =</Text>
            <Text style={styles.displayValue}>{yVal || '?'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.displayRow}>
          <View style={[styles.displayField, styles.displayFieldActive, { flex: 1 }]}>
            <Text style={styles.displayValue}>{xVal || '?'}</Text>
          </View>
        </View>
      )}

      {/* Key grid */}
      {KEYS.map((row, ri) => (
        <View key={ri} style={styles.keyRow}>
          {row.map(key => (
            <TouchableOpacity
              key={key}
              style={[styles.key, disabled && styles.keyDisabled]}
              onPress={() => handleKey(key)}
              activeOpacity={0.7}
            >
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* Submit button */}
      <TouchableOpacity
        style={[styles.submitButton, disabled && styles.keyDisabled]}
        onPress={handleSubmit}
        activeOpacity={0.8}
      >
        <Text style={styles.submitText}>✓  Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  displayRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  displayField: {
    flex: 1,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.bgBorder,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  displayFieldActive: {
    borderColor: Colors.primary,
  },
  displayLabel: {
    color: Colors.muted,
    fontSize: FontSize.xs,
    fontFamily: FontFamily.mono,
  },
  displayValue: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontFamily: FontFamily.monoBold,
    marginTop: 2,
  },
  keyRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  key: {
    flex: 1,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  keyDisabled: {
    opacity: 0.4,
  },
  keyText: {
    color: Colors.offWhite,
    fontSize: FontSize.lg,
    fontFamily: FontFamily.monoBold,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  submitText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.5,
  },
});
