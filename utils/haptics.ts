import * as Haptics from 'expo-haptics';
import { useProgressStore } from '../store/progressStore';

export function triggerSuccessHaptic() {
  if (useProgressStore.getState().hapticsEnabled) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }
}

export function triggerErrorHaptic() {
  if (useProgressStore.getState().hapticsEnabled) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  }
}

export function triggerImpactHaptic() {
  if (useProgressStore.getState().hapticsEnabled) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }
}
