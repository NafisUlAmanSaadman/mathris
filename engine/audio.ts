import { Audio } from 'expo-av';

type SoundName = 'lock' | 'clear' | 'wrong' | 'streak' | 'freeze' | 'hint' | 'gameover';

const SOUND_FILES: Record<SoundName, any> = {
  lock: require('../assets/sounds/lock.mp3'),
  clear: require('../assets/sounds/clear.mp3'),
  wrong: require('../assets/sounds/wrong.mp3'),
  streak: require('../assets/sounds/streak.mp3'),
  freeze: require('../assets/sounds/freeze.mp3'),
  hint: require('../assets/sounds/hint.mp3'),
  gameover: require('../assets/sounds/gameover.mp3'),
};

const soundObjects: Partial<Record<SoundName, Audio.Sound>> = {};
let muted = false;

export async function loadSounds(): Promise<void> {
  await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  await Promise.all(
    (Object.keys(SOUND_FILES) as SoundName[]).map(async name => {
      try {
        const { sound } = await Audio.Sound.createAsync(SOUND_FILES[name]);
        soundObjects[name] = sound;
      } catch {
        // Sound file missing — silently skip
      }
    }),
  );
}

export async function playSound(name: SoundName): Promise<void> {
  if (muted) return;
  try {
    const sound = soundObjects[name];
    if (sound) {
      await sound.replayAsync();
    }
  } catch {
    // ignore playback errors
  }
}

export function setMuted(value: boolean): void {
  muted = value;
}

export function isMuted(): boolean {
  return muted;
}

export async function unloadSounds(): Promise<void> {
  await Promise.all(Object.values(soundObjects).map(s => s?.unloadAsync()));
}
