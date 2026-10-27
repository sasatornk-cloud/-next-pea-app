// Draws one frame of the birthday video at time `t` (seconds). Everything is a
// pure function of `t`, so the same frame always looks the same.

import { type Ctx, type Pose, H, W, ease, lerp, ramp, visible } from "@/app/_birthday/draw";
import { HEAD_TOP, NOB, YOK, drawMan, drawToddler, drawWoman } from "@/app/_birthday/family";
import {
  type Cake,
  candleFlames,
  drawBreath,
  drawCake,
  drawConfetti,
  drawFrontSunflowers,
  drawMusicNotes,
  drawPetals,
  drawSky,
  drawSunflowerField,
} from "@/app/_birthday/scenery";
import { makeSong, singing } from "@/app/_birthday/song";
import type { Cues } from "@/app/_birthday/soundtrack";
import {
  drawBubble,
  drawCaption,
  drawFade,
  drawLabel,
  drawLyrics,
  drawTitle,
  outlinedText,
} from "@/app/_birthday/text";

const DURATION = 40;
const SONG = makeSong(12.2, 0.55, "พ่อน๊อบ"); // about 109 bpm
const WISH_AT = 26.8; // Dad closes his eyes and makes a wish
const BLOW_AT = 28.9; // ...then blows; the flames are out by BLOW_AT + 0.7
const CHEER_AT = 29.8; // confetti and cheering
export const CUES: Cues = { song: SONG, blowAt: BLOW_AT, cheerAt: CHEER_AT, duration: DURATION };

const CAKE: Cake = {
  x: 640,
  top: 482,
  floor: 600,
  digits: "34",
  name: "พ่อน๊อบ",
  decoration: "sunflower",
  candle: "#4cb5f5",
};
const FLAMES = candleFlames(CAKE);
const DAD = { ...NOB, hat: true };
const HEADS = { dad: HEAD_TOP.manWithHat, mom: HEAD_TOP.woman, nava: HEAD_TOP.toddler };

const GROUND = 600; // where the family stands
const MOM_X = 380;
const NAVA_X = 500;
const DAD_X = 845;
const MOM_SCALE = 0.95;

const CAPTIONS = [
  {
    from: 4.2,
    to: 9.8,
    lines: ["วันที่ 24 ธันวาคม ท่ามกลางทุ่งทานตะวันสีเหลืองอร่าม", "แม่หยกกับน้องนาวาเตรียมเค้กเซอร์ไพรส์วันเกิดพ่อน๊อบ"],
  },
  {
    from: CHEER_AT + 0.4,
    to: 34,
    lines: ["เย้! พ่อน๊อบเป่าเทียนวันเกิดครบ 34 ปีแล้ว", "ขอให้มีความสุขมาก ๆ สุขภาพแข็งแรงนะคะ"],
  },
  { from: 34.4, to: 39.6, lines: ["รักพ่อที่สุดเลย", "— แม่หยก & น้องนาวา —"] },
];
const LABELS = [
  { from: 4.8, to: 9.8, who: "mom", text: "แม่หยก", sub: "" },
  { from: 5.2, to: 9.8, who: "nava", text: "น้องนาวา", sub: "1 ขวบ 5 เดือน" },
  { from: 8, to: 10, who: "dad", text: "พ่อน๊อบ", sub: "" },
] as const;
const BUBBLES = [
  { from: 10.1, to: 12, who: "mom", text: "เซอร์ไพรส์!" },
  { from: 10.4, to: 12, who: "nava", text: "ป๊ะป๊า!" },
  { from: WISH_AT - 0.2, to: BLOW_AT - 0.3, who: "mom", text: "อธิษฐานแล้วเป่าเทียนเลยค่ะ!" },
  { from: CHEER_AT + 0.4, to: 32.6, who: "nava", text: "เย้ เย้!" },
  { from: 31.2, to: 33.8, who: "dad", text: "ขอบคุณครับ รักทั้งสองคนเลย!" },
] as const;

// ---------------------------------------------------------------- choreography

function choreograph(t: number) {
  const beat = (t - SONG.start) / SONG.beat;
  // 0 on each beat, 1 halfway between: claps land on the beat.
  const pulse = Math.abs(Math.sin(Math.PI * beat));
  const dad: Pose = {
    x: DAD_X,
    y: GROUND,
    blink: t % 3.6 < 0.13,
    lean: Math.sin(t * 1.6) * 0.02,
  };
  const mom: Pose = {
    x: MOM_X,
    y: GROUND,
    scale: MOM_SCALE,
    blink: (t + 1.1) % 3.9 < 0.13,
    sway: Math.sin(t * 1.4) * 0.4,
    lean: Math.sin(t * 1.4 + 1) * 0.02,
  };
  const nava: Pose = { x: NAVA_X, y: GROUND + 6, blink: (t + 2) % 3.2 < 0.13 };

  // Nava bounces on his toes while they wait.
  if (t < 10) {
    nava.bounce = Math.abs(Math.sin(t * 4)) * 4;
    nava.armL = 0.5 + Math.sin(t * 4) * 0.3;
  }

  // Dad walks in from the right...
  if (t < 10) {
    const k = ramp(t, 5.5, 10);
    dad.x = lerp(1420, DAD_X, k);
    if (k > 0 && k < 1) {
      const walk = Math.sin(t * 8);
      dad.step = t * 8;
      dad.bounce = Math.abs(walk) * 5;
      dad.armL = 0.15 + walk * 0.25;
      dad.armR = 0.15 - walk * 0.25;
    }
  }

  // ...and gets a surprise.
  if (t >= 10 && t < 12) {
    const k = visible(t, 10, 12, 0.25);
    dad.armL = dad.armR = lerp(0.12, 2.5, k);
    dad.mouth = 0.9 * k;
    dad.bounce = Math.abs(Math.sin(t * 9)) * 8 * k;
    mom.armL = mom.armR = lerp(0.15, 2.4 + Math.sin(t * 12) * 0.2, k);
    mom.mouth = 0.8 * k;
    nava.armL = nava.armR = lerp(0.3, 2.6, k);
    nava.bounce = Math.abs(Math.sin(t * 8)) * 10 * k;
    nava.mouth = 0.7 * k;
  }

  // Mom and Nava sing; Mom sways once a bar, Dad and Nava clap on the beat.
  if (t >= SONG.start && t < SONG.end + 0.3) {
    const sway = Math.sin((Math.PI * beat) / 3);
    mom.mouth = nava.mouth = singing(SONG, t);
    mom.sway = sway;
    mom.lean = sway * 0.05;
    mom.armL = 0.35 + sway * 0.15;
    mom.armR = 0.35 - sway * 0.15;
    nava.armL = nava.armR = -0.7 + pulse * 0.7;
    nava.bounce = pulse * 6;
    dad.armL = dad.armR = -0.4 + pulse * 0.45;
    dad.lean = sway * 0.03;
  }

  // A wish with eyes closed and hands together.
  if (t >= WISH_AT && t < BLOW_AT - 0.4) {
    dad.blink = true;
    dad.armL = dad.armR = -0.4;
  }

  // Lean over the cake and blow.
  const leanIn = ramp(t, BLOW_AT - 0.5, BLOW_AT - 0.1) * (1 - ramp(t, CHEER_AT - 0.1, CHEER_AT + 0.3));
  if (leanIn > 0) {
    dad.lean = -0.22 * ease(leanIn);
    dad.pucker = t >= BLOW_AT - 0.1 && t < CHEER_AT;
    dad.armL = dad.armR = 0.12;
  }

  // Cheer, then calm down to waving goodbye.
  if (t >= CHEER_AT) {
    const party = 1 - ramp(t, 34, 35);
    [dad, mom, nava].forEach((c, i) => {
      const wave = 2.3 + Math.sin(t * 5 + i) * 0.35;
      c.armL = lerp(0.2, 2.5 + Math.sin(t * 7) * 0.25, party);
      c.armR = lerp(wave, 2.5 - Math.sin(t * 7) * 0.25, party);
      c.bounce = Math.abs(Math.sin(t * 7 + i)) * 12 * party;
      c.mouth = 0.8 * party;
    });
  }

  const flame = 1 - ramp(t, BLOW_AT, BLOW_AT + 0.7);
  const smoke = ramp(t, BLOW_AT + 0.5, BLOW_AT + 3.5);
  return { dad, mom, nava, flame, smoke };
}

// ---------------------------------------------------------------- frame

export function drawScene(ctx: Ctx, t: number, font: string) {
  ctx.save();
  // The canvas may be bigger than the 1280x720 design size.
  ctx.setTransform(ctx.canvas.width / W, 0, 0, ctx.canvas.height / H, 0, 0);

  const { dad, mom, nava, flame, smoke } = choreograph(t);
  const cast = { dad, mom, nava };
  // Bottom of a bubble or label floating above someone's head.
  const above = (who: keyof typeof cast) =>
    cast[who].y - (cast[who].bounce ?? 0) - HEADS[who] * (cast[who].scale ?? 1) - 12;

  drawSky(ctx, t);
  drawSunflowerField(ctx, t);
  drawCake(ctx, t, font, CAKE, flame, smoke);
  const order = [
    { pose: mom, draw: (p: Pose) => drawWoman(ctx, p, YOK) },
    { pose: dad, draw: (p: Pose) => drawMan(ctx, p, DAD) },
    { pose: nava, draw: (p: Pose) => drawToddler(ctx, p) },
  ].sort((a, b) => a.pose.y - b.pose.y);
  for (const { pose, draw } of order) draw(pose);
  if (dad.pucker) {
    const lean = dad.lean ?? 0;
    const lips = { x: dad.x + Math.sin(lean) * 281 - 12, y: dad.y - Math.cos(lean) * 281 };
    drawBreath(ctx, t, lips, { x: CAKE.x + 20, y: FLAMES[0].y - 14 });
  }

  drawFrontSunflowers(ctx, t);
  drawConfetti(ctx, t, CHEER_AT, CAKE.x, FLAMES[0].y - 8);
  const song = visible(t, SONG.start - 0.2, SONG.end + 0.6, 0.4);
  drawMusicNotes(ctx, t, mom.x, above("mom"), song, 0);
  drawMusicNotes(ctx, t, nava.x, above("nava"), song, 1);
  drawPetals(ctx, t, ["#ffcd1f"]);

  for (const label of LABELS) {
    const alpha = visible(t, label.from, label.to, 0.3);
    if (alpha > 0) {
      drawLabel(ctx, font, label.text, label.sub, cast[label.who].x, above(label.who), alpha);
    }
  }
  for (const bubble of BUBBLES) {
    const alpha = visible(t, bubble.from, bubble.to, 0.2);
    if (alpha > 0) drawBubble(ctx, font, bubble.text, cast[bubble.who].x, above(bubble.who) - 8, alpha);
  }

  const titleAlpha = visible(t, 0.3, 4, 0.6);
  if (titleAlpha > 0) {
    drawTitle(ctx, font, titleAlpha, ["Happy Birthday", "พ่อน๊อบ ครบ 34 ปี", "24 ธันวาคม"]);
  }
  for (const caption of CAPTIONS) {
    const alpha = visible(t, caption.from, caption.to);
    if (alpha > 0) drawCaption(ctx, font, caption.lines, alpha);
  }
  const lyrics = visible(t, SONG.start - 0.5, SONG.end + 0.4, 0.4);
  if (lyrics > 0) drawLyrics(ctx, font, t, SONG, lyrics);
  const finale = visible(t, 34.4, DURATION, 0.6);
  if (finale > 0) {
    ctx.globalAlpha = finale;
    outlinedText(ctx, font, "สุขสันต์วันเกิด พ่อน๊อบ", W / 2, 70, 66, "#ffd166");
    outlinedText(ctx, font, "ครบ 34 ปี • 24 ธันวาคม", W / 2, 140, 44, "#ffffff");
    ctx.globalAlpha = 1;
  }

  drawFade(ctx, t, DURATION);
  ctx.restore();
}
