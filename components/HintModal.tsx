import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Colors, FontSize, Spacing, Radius } from '../constants/theme';
import { useFontFamily } from '../store/progressStore';

interface Props {
  visible: boolean;
  hints: string[];
  scoreDeduction: number;
  onClose: () => void;
}

export default function HintModal({ visible, hints, scoreDeduction, onClose }: Props) {
  const [step, setStep] = useState(0);

  const headingMedium = useFontFamily('headingMedium');
  const bodyFont = useFontFamily('body');
  const monoFont = useFontFamily('mono');
  const monoBoldFont = useFontFamily('monoBold');

  const handleNext = () => {
    if (step < hints.length - 1) setStep(s => s + 1);
  };

  const handleClose = () => {
    setStep(0);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={[styles.title, { fontFamily: headingMedium }]}>Step-by-step hint</Text>
            <Text style={[styles.cost, { fontFamily: monoBoldFont }]}>−{scoreDeduction} pts</Text>
          </View>

          <ScrollView style={styles.stepsContainer} showsVerticalScrollIndicator={false}>
            {hints.slice(0, step + 1).map((h, i) => (
              <View key={i} style={[styles.stepRow, i === step && styles.stepRowActive]}>
                <View style={[styles.stepDot, i === step && styles.stepDotActive]}>
                  <Text style={[styles.stepDotText, { fontFamily: monoBoldFont }]}>{i + 1}</Text>
                </View>
                <Text style={[styles.stepText, i === step && styles.stepTextActive, { fontFamily: monoFont }]}>
                  {h}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            {step < hints.length - 1 ? (
              <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                <Text style={[styles.nextBtnText, { fontFamily: headingMedium }]}>Next step</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.doneBtn} onPress={handleClose}>
                <Text style={[styles.doneBtnText, { fontFamily: headingMedium }]}>Got it</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    maxHeight: '70%',
    borderTopWidth: 1,
    borderColor: Colors.bgBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    color: Colors.white,
    fontSize: FontSize.xl,
  },
  cost: {
    color: Colors.danger,
    fontSize: FontSize.md,
  },
  stepsContainer: {
    marginBottom: Spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    opacity: 0.4,
  },
  stepRowActive: {
    opacity: 1,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
  },
  stepDotText: {
    color: Colors.white,
    fontSize: FontSize.xs,
  },
  stepText: {
    flex: 1,
    color: Colors.muted,
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  stepTextActive: {
    color: Colors.offWhite,
  },
  footer: {},
  nextBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  nextBtnText: {
    color: Colors.white,
    fontSize: FontSize.lg,
  },
  doneBtn: {
    backgroundColor: Colors.success,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  doneBtnText: {
    color: Colors.bg,
    fontSize: FontSize.lg,
  },
});
