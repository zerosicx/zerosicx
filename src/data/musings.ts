/**
 * Thought-bubble musings for the host character in the bedroom.
 * Grouped by where she is; `any` can show up anywhere. Edit freely.
 */
export const MUSINGS = {
  desk: [
    'Hmm... what should I build next?',
    'Is it a bug or a feature? ...Feature.',
    'Note to self: commit more often.',
    'One more pixel. Okay, two more.',
    'This palette is so soft. I love it.',
  ],
  window: [
    'The sakura should be blooming soon...',
    'Spring in Japan would be perfect.',
    'Petals everywhere. Good.',
  ],
  books: [
    'Shin Kanzen Master N3... later. Probably.',
    'I should rewatch that pixel art guide.',
    'So many books, so little time.',
  ],
  cat: [
    'Yuumi, you are perfect.',
    'Do bengals ever stop zooming?',
    '...she is judging me again.',
  ],
  any: [
    'Konbini onigiri sounds really good right now.',
    'Need more tea.',
    'Ooh, someone is visiting!',
  ],
} as const;

export type MusingSpot = keyof typeof MUSINGS;
