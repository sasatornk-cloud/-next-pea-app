// "Happy Birthday to You", timed for a video. Shared by the picture (lyrics,
// singing mouths) and the sound, so both follow the same clock.

// The tune as [midi note, beats], one phrase per lyric line.
const MELODY: [number, number][][] = [
  [[67, 0.75], [67, 0.25], [69, 1], [67, 1], [72, 1], [71, 2]],
  [[67, 0.75], [67, 0.25], [69, 1], [67, 1], [74, 1], [72, 2]],
  [[67, 0.75], [67, 0.25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 2]],
  [[77, 0.75], [77, 0.25], [76, 1], [72, 1], [74, 1], [72, 3]],
];

export type Note = { time: number; dur: number; midi: number; line: number };

export type Song = {
  start: number;
  beat: number; // seconds per beat; the song is in 3/4
  end: number;
  notes: Note[];
  lines: { text: string; from: number; to: number }[];
};

export function makeSong(start: number, beat: number, name: string): Song {
  const lyrics = [
    "Happy birthday to you",
    "Happy birthday to you",
    `Happy birthday dear ${name}`,
    "Happy birthday to you",
  ];
  const notes: Note[] = [];
  let beats = 0;
  MELODY.forEach((phrase, line) => {
    for (const [midi, length] of phrase) {
      notes.push({ time: start + beats * beat, dur: length * beat, midi, line });
      beats += length;
    }
  });
  const lines = lyrics.map((text, i) => {
    const sung = notes.filter((n) => n.line === i);
    const last = sung[sung.length - 1];
    return { text, from: sung[0].time, to: last.time + last.dur * 0.6 };
  });
  return { start, beat, end: start + beats * beat, notes, lines };
}

// How wide a singer's mouth is at time `t`: opens on each note, then closes a little.
export function singing(song: Song, t: number) {
  for (const n of song.notes) {
    if (t >= n.time && t < n.time + n.dur) return 0.45 + 0.45 * (1 - (t - n.time) / n.dur);
  }
  return 0;
}
