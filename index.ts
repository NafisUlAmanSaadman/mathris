import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  const { LoadSkiaWeb } = require('@shopify/react-native-skia/lib/module/web');
  LoadSkiaWeb({
    locateFile: (file) => {
      if (file === 'canvaskit.wasm') {
        return '/canvaskit.wasm';
      }
      return file;
    },
  })
    .then(() => {
      require('expo-router/entry');
    })
    .catch((err) => {
      console.error('Failed to load Skia Web:', err);
    });
} else {
  require('expo-router/entry');
}
