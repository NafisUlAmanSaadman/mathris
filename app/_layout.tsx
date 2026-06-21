import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { setRepository } from '../data/repositoryProvider';
import { SQLiteRepository } from '../data/sqliteRepository';
import { useProgressStore } from '../store/progressStore';
import { loadSounds } from '../engine/audio';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Outfit-Regular': require('../assets/fonts/Outfit-Regular.ttf'),
    'Outfit-Medium': require('../assets/fonts/Outfit-Regular.ttf'),
    'Outfit-Bold': require('../assets/fonts/Outfit-Regular.ttf'),
    'JetBrainsMono-Regular': require('../assets/fonts/JetBrainsMono-Regular.ttf'),
    'JetBrainsMono-Bold': require('../assets/fonts/JetBrainsMono-Bold.ttf'),
    'OpenDyslexic-Regular': require('../assets/fonts/OpenDyslexic-Regular.otf'),
    'OpenDyslexic-Bold': require('../assets/fonts/OpenDyslexic-Bold.otf'),
  });

  const [dbReady, setDbReady] = useState(false);
  const loadProgress = useProgressStore(s => s.load);

  useEffect(() => {
    async function boot() {
      try {
        // ── 1. Initialise the repository (SQLite migrations run here) ──────
        //    To swap the backend, replace SQLiteRepository with your impl:
        //    e.g.  new SupabaseRepository(client)
        //          new InMemoryRepository()
        await setRepository(new SQLiteRepository());

        // ── 2. Hydrate Zustand store from DB ──────────────────────────────
        await loadProgress();

        // ── 3. Preload audio ──────────────────────────────────────────────
        await loadSounds();
      } catch (err) {
        console.error('[Mathris] Boot error:', err);
      } finally {
        setDbReady(true);
      }
    }

    boot();
  }, []);

  useEffect(() => {
    if (fontsLoaded && dbReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, dbReady]);

  if (!fontsLoaded || !dbReady) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0D0D1A' },
          animation: 'fade',
        }}
      />
    </>
  );
}
