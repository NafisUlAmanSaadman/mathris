// Mathris Design System — Theme Tokens

export const Colors = {
  // Background layers
  bg: '#0D0D1A',
  bgCard: '#13132B',
  bgSurface: '#1A1A35',
  bgBorder: '#2A2A50',

  // Primary purple
  primary: '#6C63FF',
  primaryLight: '#8B85FF',
  primaryDark: '#4A42CC',

  // Difficulty neons
  easy: '#4ECDC4',
  easyDim: '#2A7A75',
  medium: '#FFE66D',
  mediumDim: '#9A8B30',
  hard: '#FF6B6B',
  hardDim: '#9A3030',

  // Semantic
  success: '#4ECDC4',
  danger: '#FF6B6B',
  warning: '#FFE66D',
  white: '#FFFFFF',
  offWhite: '#E8E8FF',
  muted: '#6B6B99',
  dimmed: '#3A3A60',

  // Brick colours (per tetromino)
  brickI: '#4ECDC4',
  brickO: '#FFE66D',
  brickT: '#C77DFF',
  brickS: '#4ADE80',
  brickZ: '#FF6B6B',
  brickJ: '#60A5FA',
  brickL: '#FB923C',

  // Streak / combo
  streak: '#FF9F43',
  streakGlow: '#FF6B35',
};

export const FontFamily = {
  heading: 'Outfit-Bold',
  headingMedium: 'Outfit-Medium',
  body: 'Outfit-Regular',
  mono: 'JetBrainsMono-Regular',
  monoBold: 'JetBrainsMono-Bold',
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  display: 36,
  hero: 48,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Shadow = {
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  }),
};
