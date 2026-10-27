// Synthesizes the soundtrack with Web Audio, scheduled against the same
// timeline the picture uses, so `start` is the AudioContext time of t = 0.

import type { Song } from "./song";

// When things happen in a video, in seconds from its start.
export type Cues = { song: Song; blowAt: number; cheerAt: number; duration: number };

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

// Oom-pah-pah accompaniment as [beat into the song, bass note, chord notes].
const CHORDS: [number, number, number[]][] = [
  [1, 48, [64, 67, 72]], // C
  [4, 43, [62, 65, 71]], // G7
  [7, 43, [62, 65, 71]], // G7
  [10, 48, [64, 67, 72]], // C
  [13, 48, [64, 70, 72]], // C7
  [16, 41, [65, 69, 72]], // F
  [19, 48, [64, 67, 72]], // C
  [22, 43, [62, 65, 71]], // G7
  [23, 48, [64, 67, 72]], // C
];
// Music-box arpeggio for the opening and the ending.
const ARPEGGIO = [72, 76, 79, 84, 79, 76];

function tone(
  audio: AudioContext,
  out: AudioNode,
  midi: number,
  at: number,
  length: number,
  type: OscillatorType,
  volume: number,
) {
  const osc = audio.createOscillator();
  osc.type = type;
  osc.frequency.value = hz(midi);
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(volume, at + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, at + length);
  osc.connect(gain).connect(out);
  osc.start(at);
  osc.stop(at + length + 0.05);
}

// Filtered white noise, for the breath and the party popper.
function noise(audio: AudioContext, out: AudioNode, at: number, length: number, volume: number, freq: number) {
  const buffer = audio.createBuffer(1, Math.ceil(audio.sampleRate * length), audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const source = audio.createBufferSource();
  source.buffer = buffer;
  const filter = audio.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = freq;
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(volume, at + length * 0.2);
  gain.gain.exponentialRampToValueAtTime(0.001, at + length);
  source.connect(filter).connect(gain).connect(out);
  source.start(at);
}

export function scheduleSoundtrack(audio: AudioContext, out: AudioNode, start: number, cues: Cues) {
  const { song, blowAt, cheerAt, duration } = cues;
  const beatAt = (beat: number) => start + song.start + beat * song.beat;
  const half = song.beat * 0.5;

  for (let i = 0; i * half < song.start - 1.2; i++) {
    tone(audio, out, ARPEGGIO[i % ARPEGGIO.length], start + 0.6 + i * half, 1.2, "sine", 0.07);
  }

  // The tune, voiced as a warm lead with a soft octave above.
  for (const n of song.notes) {
    tone(audio, out, n.midi, start + n.time, n.dur + 0.25, "triangle", 0.3);
    tone(audio, out, n.midi + 12, start + n.time, n.dur + 0.1, "sine", 0.05);
  }
  CHORDS.forEach(([beat, bass, chord], i) => {
    const bar = (CHORDS[i + 1]?.[0] ?? 26) - beat;
    tone(audio, out, bass, beatAt(beat), song.beat * Math.max(bar, 2), "triangle", 0.18);
    for (let k = 1; k < Math.min(bar, 3); k++) {
      for (const note of chord) tone(audio, out, note, beatAt(beat + k), song.beat * 0.8, "sine", 0.045);
    }
  });
  for (const note of [48, 64, 67, 72]) {
    tone(audio, out, note, start + song.end - 2 * song.beat, 2.5, "sine", 0.05);
  }

  noise(audio, out, start + blowAt - 0.05, 0.8, 0.5, 900);
  noise(audio, out, start + cheerAt, 0.25, 0.9, 2500);
  [84, 88, 91, 96].forEach((note, i) => {
    tone(audio, out, note, start + cheerAt + 0.08 + i * 0.09, 0.9, "sine", 0.12);
  });

  for (let i = 0; cheerAt + 1.4 + i * half < duration - 1.5; i++) {
    tone(audio, out, ARPEGGIO[i % ARPEGGIO.length], start + cheerAt + 1.4 + i * half, 1.2, "sine", 0.06);
  }
}
