// Mathris Design System — "Chalkboard Arcade" Theme Tokens

export const Colors = {
  // Background layers — deep slate-blue, cooler than generic near-black
  bg: '#171B26',
  bgCard: '#1E2433',
  bgSurface: '#252B3A',
  bgBorder: '#2A3040',

  // Primary accent — warm coral, NOT purple
  primary: '#E8735A',
  primaryLight: '#EF8E7A',
  primaryDark: '#C45A42',

  // Difficulty colors — desaturated, intentional
  easy: '#6BBF8A',
  easyDim: '#3A6B4D',
  medium: '#E8A94B',
  mediumDim: '#8A6A2E',
  hard: '#E8735A',
  hardDim: '#8A4536',

  // Semantic
  success: '#6BBF8A',
  danger: '#D95B5B',
  warning: '#E8A94B',
  white: '#E8E4DC',     // chalk-white, warm
  offWhite: '#CFC9BE',
  muted: '#8B8798',     // chalky gray-purple
  dimmed: '#4A4862',

  // Brick colours — slightly muted, arcade-feel
  brickI: '#5CB8B2',
  brickO: '#E8A94B',
  brickT: '#B07CD8',
  brickS: '#6BBF8A',
  brickZ: '#D95B5B',
  brickJ: '#5B8FD9',
  brickL: '#E8935A',

  // Streak / combo — amber
  streak: '#E8A94B',
  streakGlow: '#D4882A',

  // Board
  board: '#151C28',
};

export const FontFamily = {
  heading: 'Outfit-Bold',
  headingMedium: 'Outfit-Medium',
  body: 'Outfit-Regular',
  mono: 'JetBrainsMono-Regular',
  monoBold: 'JetBrainsMono-Bold',
};

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 17,
  xl: 21,
  xxl: 26,
  display: 32,
  hero: 42,
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
  lg: 14,
  xl: 20,
  full: 999,
};

export const Shadow = {
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  }),
};
