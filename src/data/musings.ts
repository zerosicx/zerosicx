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

/**
 * Mitchy's thought-bubble musings. `bun` is his name for Hannah.
 * Pokémon facts are from the official Pokédex entries and type chart.
 */
export const MITCHY_MUSINGS = {
  gym: [
    'Should I do chest day today?',
    'Leg day... tomorrow. Probably.',
    'Gym, then a protein shake, then Pokémon.',
  ],
  bun: [
    "I should ask bun on a cafe date. Maybe Nana's Green Tea!",
    "Bun's been coding for ages... snack delivery?",
    'Matcha parfait with bun. That\'s the plan.',
  ],
  pokemon: [
    'Dragonite can fly around the whole world in just 16 hours.',
    'Dragonite guides ships lost in storms back to land. What a legend.',
    'Dratini keeps shedding its skin as it grows.',
    'Ice is 4× effective against Dragonite. ...Don\'t tell anyone.',
    'Dragon moves are super effective on Dragon types. Dragons vs dragons.',
    'Fairy types arrived in Gen 6 and are immune to Dragon moves. Rude.',
    'Rhydon was the very first Pokémon ever designed.',
    'Dragonite is #149. Right before Mewtwo.',
    'Shuckle stores berries in its shell until they turn into juice.',
    'Dragon type is the best type. Not up for debate.',
  ],
  play: [
    'One more battle. Just one.',
    'Come on... evolve already.',
  ],
} as const;

export type MitchySpot = keyof typeof MITCHY_MUSINGS;

/** What each character says when the visitor talks to them: first meeting, then after. */
export const GREETINGS = {
  hannah: {
    first: [
      'Oh! Hi there, welcome in!',
      'Make yourself at home. My projects are on the computer, and my notes are growing out in the garden.',
      'Yuumi might stare at you a little. It means she likes you.',
    ],
    again: [
      "Back again? I'm really glad you're here.",
      'Take your time, there\'s no rush. ♡',
    ],
  },
  mitchy: {
    first: [
      'Oh, hi... You must be visiting.',
      "Don't mind me, I'm always around.",
      '...Um. Do you like Pokémon? ...Never mind.',
    ],
    again: [
      'Oh. Hi again.',
      'Did you know Dragonite can fly around the world in 16 hours? ...Sorry. Random.',
    ],
  },
} as const;
