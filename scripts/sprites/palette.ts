/**
 * Sakura palette — every generated sprite is restricted to these colours.
 *
 * Ramps are hue-shifted: shadows lean cool/purple, highlights lean warm,
 * which keeps everything feeling soft rather than muddy. Swap a hex value
 * here and re-run `npm run sprites` to recolour every asset at once.
 */
export const PALETTE = {
  // Outline / deepest shadow
  ink: '#2a1b2d',

  // Bark — warm plum-browns
  bark0: '#3e2633',
  bark1: '#5f3a43',
  bark2: '#86574f',
  bark3: '#a87a62',

  // Blossom — deep plum shadow → near-white highlight
  pink0: '#7a3459',
  pink1: '#b2527a',
  pink2: '#de7c9f',
  pink3: '#f3a9c1',
  pink4: '#fdd5e1',
  pink5: '#fff2f5',

  // Grass — teal shadows → buttery highlights
  grass0: '#2f5150',
  grass1: '#41735f',
  grass2: '#6fa77a',
  grass3: '#98c98a',
  grass4: '#c6e3a4',

  // Stone — mauve greys
  stone0: '#4a4256',
  stone1: '#6b6178',
  stone2: '#958aa0',
  stone3: '#bdb3c1',
  stone4: '#e3dbe0',

  // Lantern light
  glow0: '#e9875c',
  glow1: '#ffc76e',
  glow2: '#fff0b8',
} as const;

export type Colour = keyof typeof PALETTE;
