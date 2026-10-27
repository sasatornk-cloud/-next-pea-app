// Draws one frame of Grandma Kaew's birthday video at time `t` (seconds).
// Everything is a pure function of `t`, so the same frame always looks the same.

import { type Ctx, type Pose, H, W, ease, lerp, ramp, visible } from "@/app/_birthday/draw";
import {
  HEAD_TOP,
  JEM,
  KAEW,
  NOB,
  SAK,
  YOK,
  drawMan,
  drawToddler,
  drawWoman,
} from "@/app/_birthday/family";
import {
  type Cake,
  candleFlames,
  drawBeach,
  drawBeachFront,
  drawBreath,
  drawCake,
  drawConfetti,
  drawHearts,
  drawMusicNotes,
  drawSunsetSky,
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

const DURATION = 48;
const SONG = makeSong(12.9, 0.55, "คุณยาย");
const WISH_AT = 27.5; // Grandma closes her eyes and makes a wish
const BLOW_AT = 29.6; // ...then blows; the flames are out by BLOW_AT + 0.7
const CHEER_AT = 30.5; // confetti and cheering
const HUG_AT = 33.6; // everyone steps back level with Grandma and gathers round
const HUGGED = HUG_AT + 2.6; // arms around each other
export const CUES: Cues = { song: SONG, blowAt: BLOW_AT, cheerAt: CHEER_AT, duration: DURATION };

const GROUND = 600; // where the family stands
// Grandma stands behind a low table, so the cake sits just below her chin.
const CAKE: Cake = {
  x: 640,
  top: 528,
  floor: GROUND,
  digits: "",
  sticks: 5,
  name: "คุณยายแก้ว",
  decoration: "blossom",
  candle: "#ff8fab",
};
const FLAMES = candleFlames(CAKE);
const SPOTS = {
  dad: { x: 250, scale: 0.95 },
  mom: { x: 390, scale: 0.92 },
  kaew: { x: CAKE.x, scale: 0.96 },
  sak: { x: 850, scale: 0.95 },
  jem: { x: 1010, scale: 0.94 },
};
// Side by side for the hug, each with an arm across the next one's shoulders.
const HUG_X: Record<keyof typeof SPOTS, number> = { dad: 400, mom: 505, kaew: CAKE.x, sak: 735, jem: 835 };
const KAEW_Y = GROUND - 40;
const HUG_Y = KAEW_Y + 5;
const HEADS = {
  jem: HEAD_TOP.man,
  mom: HEAD_TOP.woman,
  kaew: HEAD_TOP.woman,
  sak: HEAD_TOP.man,
  dad: HEAD_TOP.man,
};
// Nava rides on Mom's hip, in her local space.
const NAVA_IN_ARMS = { x: 58, y: -160, scale: 0.8 };
// The sun sinks toward the sea as the video goes on.
const sunAt = (t: number) => ({ x: 930, y: lerp(250, 372, t / DURATION) });

type Who = keyof typeof SPOTS | "nava";

const CAPTIONS = [
  {
    from: 4.5,
    to: 10.8,
    lines: ["ยามเย็นริมหาดทรายขาว พระอาทิตย์กำลังจะลับขอบฟ้า", "ลูกหลานพร้อมหน้ากันมาฉลองวันเกิดคุณยายแก้ว"],
  },
  {
    from: CHEER_AT + 0.4,
    to: HUG_AT + 0.4,
    lines: ["เย้! คุณยายแก้วเป่าเทียนวันเกิดแล้ว", "ขอให้คุณยายสุขภาพแข็งแรง อายุยืน มีความสุขมาก ๆ นะคะ"],
  },
  {
    from: HUGGED + 0.2,
    to: 41.8,
    lines: ["แล้วคุณยายก็กอดลูกหลานทุกคนแน่น ๆ", "อบอุ่นท่ามกลางแสงอาทิตย์ยามเย็นริมทะเล"],
  },
  {
    from: 42.2,
    to: DURATION - 0.4,
    lines: ["รักคุณยายที่สุดเลย", "— คุณตาศัก พ่อน๊อบ แม่หยก น้องนาวา น้าเจ็ม —"],
  },
];
// Shown in three waves so neighbouring tags don't overlap.
const LABELS: { from: number; to: number; who: Who; text: string; sub: string }[] = [
  { from: 4.8, to: 6.9, who: "kaew", text: "คุณยายแก้ว", sub: "" },
  { from: 4.8, to: 6.9, who: "jem", text: "น้าเจ็ม", sub: "น้องชายแม่หยก" },
  { from: 6.9, to: 8.9, who: "mom", text: "แม่หยก & น้องนาวา", sub: "" },
  { from: 6.9, to: 8.9, who: "sak", text: "คุณตาศัก", sub: "" },
  { from: 8.9, to: 10.8, who: "dad", text: "พ่อน๊อบ", sub: "" },
];
const BUBBLES: { from: number; to: number; who: Who; text: string }[] = [
  { from: 11, to: 12.8, who: "jem", text: "สุขสันต์วันเกิดครับแม่!" },
  { from: 11.3, to: 12.8, who: "kaew", text: "ว้าย! ขอบใจจ้ะ" },
  { from: WISH_AT - 0.2, to: BLOW_AT - 0.3, who: "mom", text: "อธิษฐานก่อนนะคะแม่!" },
  { from: CHEER_AT + 0.5, to: 33, who: "nava", text: "ยาย! ยาย!" },
  { from: HUG_AT + 0.6, to: HUGGED + 0.2, who: "sak", text: "มากอดกันหน่อย!" },
  { from: 37, to: 40.2, who: "kaew", text: "ขอบใจลูกหลานทุกคนนะจ๊ะ รักทุกคนเลย" },
  { from: 40.4, to: 42, who: "nava", text: "รักยายนะ!" },
];

// ---------------------------------------------------------------- choreography

function choreograph(t: number) {
  const beat = (t - SONG.start) / SONG.beat;
  // 0 on each beat, 1 halfway between: claps land on the beat.
  const pulse = Math.abs(Math.sin(Math.PI * beat));
  // Step back level with Grandma first, then walk in beside her, so nobody
  // passes through the table.
  const back = ease(ramp(t, HUG_AT, HUG_AT + 0.6));
  const slide = ramp(t, HUG_AT + 0.4, HUGGED - 0.4);
  const walking = slide > 0 && slide < 1;
  const cast = Object.fromEntries(
    Object.entries(SPOTS).map(([who, { x, scale }], i) => {
      const pose: Pose = {
        x: lerp(x, HUG_X[who as keyof typeof SPOTS], ease(slide)),
        y: who === "kaew" ? KAEW_Y : lerp(GROUND, HUG_Y, back),
        scale,
        blink: (t + i * 0.9) % (3.4 + i * 0.2) < 0.13,
        lean: Math.sin(t * 1.4 + i) * 0.02,
        sway: Math.sin(t * 1.4 + i) * 0.4,
      };
      if (walking && who !== "kaew") {
        pose.step = t * 8;
        pose.bounce = Math.abs(Math.sin(t * 8)) * 4;
      }
      return [who, pose];
    }),
  ) as Record<keyof typeof SPOTS, Pose>;
  const { jem, mom, kaew, sak, dad } = cast;
  const nava: Pose = { ...NAVA_IN_ARMS, carried: true, blink: (t + 2) % 3.2 < 0.13 };
  const voice = singing(SONG, t);

  // Mom holds Nava: one arm under him, the other across his back.
  mom.armL = -1.07;
  mom.armR = 0.3;
  nava.armL = 0.5 + Math.sin(t * 4) * 0.3;
  nava.armR = 0.3;

  // Surprise!
  if (t >= 11 && t < 12.8) {
    const k = visible(t, 11, 12.8, 0.25);
    for (const c of [jem, sak, dad, kaew]) {
      c.armL = c.armR = lerp(0.12, 2.4 + Math.sin(t * 12) * 0.15, k);
      c.mouth = 0.8 * k;
    }
    nava.armL = nava.armR = lerp(0.3, 2.5, k);
    nava.mouth = 0.7 * k;
  }

  // Everyone sings to Grandma; she listens with her hands together.
  if (t >= SONG.start && t < SONG.end + 0.3) {
    const sway = Math.sin((Math.PI * beat) / 3);
    for (const c of [jem, mom, sak, dad]) {
      c.mouth = voice;
      c.sway = sway;
      c.lean = sway * 0.04;
    }
    nava.mouth = voice;
    for (const c of [jem, sak, dad]) c.armL = c.armR = -0.4 + pulse * 0.45;
    nava.armL = nava.armR = -0.7 + pulse * 0.7;
    kaew.armL = kaew.armR = -0.35;
    kaew.sway = sway;
    kaew.lean = sway * 0.03;
  }

  // A wish with eyes closed.
  if (t >= WISH_AT && t < BLOW_AT - 0.4) {
    kaew.blink = true;
    kaew.armL = kaew.armR = -0.35;
  }

  // Bend down over the cake and blow.
  const bend = ease(visible(t, BLOW_AT - 0.5, CHEER_AT + 0.3, 0.4));
  if (bend > 0) {
    kaew.bounce = -30 * bend;
    kaew.pucker = t >= BLOW_AT - 0.1 && t < CHEER_AT;
    kaew.armL = kaew.armR = 0.12;
  }

  // Cheer, then settle down before the hug.
  if (t >= CHEER_AT && t < HUG_AT) {
    const party = 1 - ramp(t, HUG_AT - 0.8, HUG_AT);
    [jem, sak, dad, kaew].forEach((c, i) => {
      c.armL = lerp(0.15, 2.5 + Math.sin(t * 7) * 0.25, party);
      c.armR = lerp(0.15, 2.5 - Math.sin(t * 7) * 0.25, party);
      c.bounce = Math.abs(Math.sin(t * 7 + i)) * 12 * party;
      c.mouth = 0.8 * party;
    });
    mom.bounce = Math.abs(Math.sin(t * 7)) * 8 * party;
    mom.mouth = 0.8 * party;
    nava.armL = nava.armR = lerp(0.3, 2.6 + Math.sin(t * 8) * 0.3, party);
    nava.mouth = 0.8 * party;
  }

  // Arms across each other's shoulders, rocking gently together. Grandma's
  // left arm goes round Nava, under his head.
  if (t >= HUG_AT) {
    const k = ease(ramp(t, HUGGED - 0.8, HUGGED));
    const rock = Math.sin(t * 1.6) * 0.03 * k;
    for (const [c, toward] of [
      [dad, 1],
      [mom, 1],
      [kaew, 0],
      [sak, -1],
      [jem, -1],
    ] as const) {
      c.lean = rock + toward * 0.03 * k;
      c.sway = rock * 10;
    }
    dad.armL = 0.12;
    dad.armR = lerp(0.12, 1.45, k);
    jem.armL = lerp(0.12, 1.45, k);
    jem.armR = 0.12;
    sak.armL = lerp(0.12, 1.45, k);
    sak.armR = lerp(0.12, 1.5, k);
    kaew.armL = lerp(0.12, 0.75, k);
    kaew.armR = lerp(0.12, 1.5, k);
    nava.armR = lerp(0.3, 1.6, k);
    if (k > 0.5) kaew.blink = true;
  }

  const flame = 1 - visible(t, BLOW_AT, DURATION + 1, 0.7);
  const smoke = visible(t, BLOW_AT + 0.5, DURATION + 1, 3);
  return { cast, nava, flame, smoke };
}

// ---------------------------------------------------------------- frame

export function drawScene(ctx: Ctx, t: number, font: string) {
  ctx.save();
  // The canvas may be bigger than the 1280x720 design size.
  ctx.setTransform(ctx.canvas.width / W, 0, 0, ctx.canvas.height / H, 0, 0);

  const { cast, nava, flame, smoke } = choreograph(t);
  const { jem, mom, kaew, sak, dad } = cast;
  // Bottom of a bubble or label floating above someone's head.
  const above = (who: Who) => {
    if (who === "nava") {
      const s = mom.scale ?? 1;
      const head = NAVA_IN_ARMS.y - HEAD_TOP.toddler * NAVA_IN_ARMS.scale;
      return { x: mom.x + NAVA_IN_ARMS.x * s, y: mom.y - (mom.bounce ?? 0) + head * s - 12 };
    }
    const c = cast[who];
    return { x: c.x, y: c.y - (c.bounce ?? 0) - HEADS[who] * (c.scale ?? 1) - 12 };
  };

  const sun = sunAt(t);
  drawSunsetSky(ctx, t, sun);
  drawBeach(ctx, t, sun.x);

  // Outermost first: each arm across a neighbour's shoulders is drawn after
  // that neighbour, and each arm behind someone before them.
  const others = [
    { pose: jem, draw: () => drawMan(ctx, jem, JEM) },
    { pose: dad, draw: () => drawMan(ctx, dad, NOB) },
    { pose: mom, draw: () => drawWoman(ctx, mom, YOK, () => drawToddler(ctx, nava)) },
    { pose: sak, draw: () => drawMan(ctx, sak, SAK) },
  ];
  // Once they step back level with Grandma, the table is in front of them too.
  const behindTable = (p: Pose) => p.y < GROUND - 15;
  for (const { pose, draw } of others) if (behindTable(pose)) draw();
  drawWoman(ctx, kaew, KAEW);
  drawCake(ctx, t, font, CAKE, flame, smoke);
  if (kaew.pucker) {
    const lips = { x: kaew.x, y: kaew.y - (kaew.bounce ?? 0) - 270 * (kaew.scale ?? 1) };
    const middle = FLAMES[Math.floor(FLAMES.length / 2)];
    drawBreath(ctx, t, { x: lips.x - 6, y: lips.y + 6 }, { x: middle.x - 10, y: middle.y - 16 });
  }
  for (const { pose, draw } of others) if (!behindTable(pose)) draw();

  drawBeachFront(ctx, t);
  drawConfetti(ctx, t, CHEER_AT, CAKE.x, FLAMES[0].y - 8);
  const song = visible(t, SONG.start - 0.2, SONG.end + 0.6, 0.4);
  (["jem", "mom", "sak"] as const).forEach((who, i) => {
    const { x, y } = above(who);
    drawMusicNotes(ctx, t, x, y, song, i);
  });
  drawHearts(ctx, t, CAKE.x, above("kaew").y - 20, visible(t, HUGGED - 0.3, DURATION + 1, 0.6));

  for (const label of LABELS) {
    const alpha = visible(t, label.from, label.to, 0.3);
    if (alpha <= 0) continue;
    const { x, y } = above(label.who);
    drawLabel(ctx, font, label.text, label.sub, x, y, alpha);
  }
  for (const bubble of BUBBLES) {
    const alpha = visible(t, bubble.from, bubble.to, 0.2);
    if (alpha <= 0) continue;
    const { x, y } = above(bubble.who);
    drawBubble(ctx, font, bubble.text, x, y - 8, alpha);
  }

  const titleAlpha = visible(t, 0.3, 4.2, 0.6);
  if (titleAlpha > 0) {
    drawTitle(ctx, font, titleAlpha, ["Happy Birthday", "คุณยายแก้ว", "ณ ชายหาดยามเย็น"]);
  }
  for (const caption of CAPTIONS) {
    const alpha = visible(t, caption.from, caption.to);
    if (alpha > 0) drawCaption(ctx, font, caption.lines, alpha);
  }
  const lyrics = visible(t, SONG.start - 0.5, SONG.end + 0.4, 0.4);
  if (lyrics > 0) drawLyrics(ctx, font, t, SONG, lyrics);
  const finale = visible(t, 42.2, DURATION, 0.6);
  if (finale > 0) {
    ctx.globalAlpha = finale;
    outlinedText(ctx, font, "สุขสันต์วันเกิด คุณยายแก้ว", W / 2, 70, 66, "#ffd166");
    outlinedText(ctx, font, "รักคุณยายที่สุดในโลก", W / 2, 140, 44, "#ffffff");
    ctx.globalAlpha = 1;
  }

  drawFade(ctx, t, DURATION);
  ctx.restore();
}
