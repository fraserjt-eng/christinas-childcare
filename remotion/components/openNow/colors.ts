// Color palette for the "Open Now" ad. Values pulled from the printed flyer
// at /Users/jfraser/Desktop/Christinas_Flyer_Open_Now.png so the on-screen
// creative matches the print piece a parent already saw at pickup.

export const OPEN_NOW_COLORS = {
  cream: '#F5EFE6',
  teal: '#1B6A78',
  tealDeep: '#155561',
  red: '#C44536',
  redDeep: '#A8392B',
  gold: '#E5B83D',
  goldDeep: '#C99E27',
  dark: '#1A1A1A',
  midGrey: '#4A4A4A',
  white: '#FFFFFF',
  // Specific to the avatar talking-head clip background tint when we need
  // a subtle wash behind on-screen face video.
  warmKitchenWash: 'rgba(229, 184, 61, 0.08)',
} as const;

export const OPEN_NOW_FONTS = {
  display: '"Fredoka One", "Nunito Black", system-ui, sans-serif',
  script: '"Caveat", "Kalam", cursive',
  body: '"Nunito", "Open Sans", system-ui, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, monospace',
} as const;
