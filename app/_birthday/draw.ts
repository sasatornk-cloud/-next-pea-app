// Math and canvas helpers shared by the birthday videos.

export type Ctx = CanvasRenderingContext2D;

// Every video is laid out in 1280x720 design units.
export const W = 1280;
export const H = 720;

export const TAU = Math.PI * 2;

// Deterministic pseudo-random in [0, 1).
export function rand(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ramp = (t: number, from: number, to: number) => clamp01((t - from) / (to - from));
export const ease = (x: number) => x * x * (3 - 2 * x);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
// 1 between `from` and `to`, fading in and out over `edge` seconds.
export const visible = (t: number, from: number, to: number, edge = 0.4) =>
  Math.min(ramp(t, from, from + edge), 1 - ramp(t, to - edge, to));

export function circle(ctx: Ctx, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

export function ellipse(ctx: Ctx, x: number, y: number, rx: number, ry: number, rotation = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rotation, 0, TAU);
  ctx.fill();
}

export function triangle(ctx: Ctx, ...p: number[]) {
  ctx.beginPath();
  ctx.moveTo(p[0], p[1]);
  ctx.lineTo(p[2], p[3]);
  ctx.lineTo(p[4], p[5]);
  ctx.fill();
}

export function line(ctx: Ctx, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// `detail` adds the double ring of petals and seeds; far-away flowers skip it.
export function sunflowerHead(ctx: Ctx, x: number, y: number, r: number, rot = 0, detail = true) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  if (detail) {
    for (const [color, offset, petals] of [
      ["#f2a900", 0.12, 13],
      ["#ffcd1f", 0, 13],
    ] as const) {
      ctx.fillStyle = color;
      for (let k = 0; k < petals; k++) {
        const a = (k / petals) * TAU + offset;
        ellipse(ctx, Math.cos(a) * r * 0.68, Math.sin(a) * r * 0.68, r * 0.42, r * 0.15, a);
      }
    }
    ctx.fillStyle = "#6b3e1f";
    circle(ctx, 0, 0, r * 0.45);
    ctx.fillStyle = "#4a2a12";
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * TAU;
      circle(ctx, Math.cos(a) * r * 0.27, Math.sin(a) * r * 0.27, r * 0.05);
    }
  } else {
    ctx.fillStyle = "#ffcd1f";
    circle(ctx, 0, 0, r);
    ctx.fillStyle = "#6b3e1f";
    circle(ctx, 0, 0, r * 0.45);
  }
  ctx.restore();
}

// A five-petal flower with a yellow middle.
export function blossom(ctx: Ctx, x: number, y: number, r: number, color: string, rot = 0) {
  ctx.fillStyle = color;
  for (let k = 0; k < 5; k++) {
    const a = rot + (k / 5) * TAU;
    circle(ctx, x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.5);
  }
  ctx.fillStyle = "#ffd23f";
  circle(ctx, x, y, r * 0.35);
}

export type Pose = {
  x: number;
  y: number;
  scale?: number;
  lean?: number; // radians, pivoting on the feet; negative leans left
  bounce?: number; // pixels above the ground
  armL?: number; // radians raised from hanging straight down; negative swings inward
  armR?: number;
  step?: number; // walking phase; legs swing with sin(step)
  sway?: number; // hair and skirt sway, -1..1
  mouth?: number; // 0 closed smile .. 1 wide open
  pucker?: boolean; // blowing out the candles
  blink?: boolean;
  carried?: boolean; // held in someone's arms, so no ground shadow
};

// Draws the ground shadow, then calls `draw` in the character's local space
// (feet at the origin, up is -y).
export function withPose(ctx: Ctx, p: Pose, draw: () => void) {
  const s = p.scale ?? 1;
  const bounce = p.bounce ?? 0;
  if (!p.carried) {
    ctx.fillStyle = "rgba(60, 70, 10, 0.25)";
    ellipse(ctx, p.x, p.y, 50 * s * (1 - Math.max(bounce, 0) / 150), 10 * s);
  }
  ctx.save();
  ctx.translate(p.x, p.y - bounce);
  ctx.rotate(p.lean ?? 0);
  ctx.scale(s, s);
  draw();
  ctx.restore();
}

// Rotates a limb hanging from (x, y) outward by `raise` radians on the given side.
export function limb(ctx: Ctx, side: number, x: number, y: number, raise: number, draw: () => void) {
  ctx.save();
  ctx.translate(side * x, y);
  ctx.rotate(-side * raise);
  draw();
  ctx.restore();
}

export function mouth(ctx: Ctx, open: number, y: number, color: string) {
  if (open > 0.3) {
    ctx.fillStyle = "#a8323e";
    ctx.beginPath();
    ctx.moveTo(-10, y);
    ctx.lineTo(10, y);
    ctx.quadraticCurveTo(0, y + 22 * open, -10, y);
    ctx.fill();
    ctx.fillStyle = "#ff8fa3";
    ellipse(ctx, 0, y + 7 * open, 5, 3 * open);
  } else {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(0, y - 4, 9, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  }
}

export function eyes(ctx: Ctx, spread: number, y: number, rx: number, ry: number, blink?: boolean) {
  for (const side of [-1, 1]) {
    const x = side * spread;
    if (blink) {
      ctx.strokeStyle = "#2a1a12";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y - 2, rx, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    } else {
      ctx.fillStyle = "#2a1a12";
      ellipse(ctx, x, y, rx, ry);
      ctx.fillStyle = "#ffffff";
      circle(ctx, x - rx * 0.3, y - ry * 0.35, rx * 0.38);
    }
  }
}
