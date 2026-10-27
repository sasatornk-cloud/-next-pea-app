import {
  type Ctx,
  H,
  TAU,
  W,
  blossom,
  circle,
  clamp01,
  ellipse,
  line,
  rand,
  sunflowerHead,
  triangle,
} from "./draw";

const CONFETTI_COLORS = ["#ff4d6d", "#ffd166", "#4cc9f0", "#80ed99", "#c77dff", "#ffffff"];
const BLOOM_COLORS = ["#ff8fab", "#ffffff", "#c77dff", "#ff5d73", "#ffd166", "#f9a8d4"];
// Big flowers in front of the family, framing the picture.
const FRONT_SUNFLOWERS = [
  [55, 640, 62, -0.25],
  [165, 700, 48, 0.15],
  [1135, 705, 50, -0.1],
  [1240, 635, 66, 0.3],
];

// ---------------------------------------------------------------- sky and field

export function drawSky(ctx: Ctx, t: number) {
  const sky = ctx.createLinearGradient(0, 0, 0, 430);
  sky.addColorStop(0, "#7cc8f5");
  sky.addColorStop(0.65, "#c9ecff");
  sky.addColorStop(1, "#fff1c4");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  const sun = { x: 1090, y: 110 };
  const glow = ctx.createRadialGradient(sun.x, sun.y, 40, sun.x, sun.y, 200);
  glow.addColorStop(0, "rgba(255, 244, 170, 0.75)");
  glow.addColorStop(1, "rgba(255, 244, 170, 0)");
  ctx.fillStyle = glow;
  circle(ctx, sun.x, sun.y, 200);
  ctx.save();
  ctx.translate(sun.x, sun.y);
  ctx.rotate(t * 0.15);
  ctx.fillStyle = "rgba(255, 236, 140, 0.35)";
  for (let k = 0; k < 14; k++) {
    ctx.rotate(TAU / 14);
    triangle(ctx, -9, 0, 9, 0, 0, -150);
  }
  ctx.restore();
  ctx.fillStyle = "#fff3a0";
  circle(ctx, sun.x, sun.y, 52);

  ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
  for (let i = 0; i < 4; i++) {
    const x = ((rand(i, 1) * W + t * (8 + i * 4)) % (W + 300)) - 150;
    const y = 60 + rand(i, 2) * 150;
    const s = 0.7 + rand(i, 3) * 0.6;
    for (const [dx, dy, r] of [
      [-45, 8, 26],
      [-12, -10, 36],
      [28, -2, 30],
      [55, 10, 22],
      [0, 14, 30],
    ]) {
      circle(ctx, x + dx * s, y + dy * s, r * s);
    }
  }
}

export function drawSunflowerField(ctx: Ctx, t: number) {
  drawField(ctx, t, (x, y, r, sway, near) => {
    ctx.strokeStyle = "#3d6b1f";
    ctx.lineWidth = Math.max(1.5, r * 0.22);
    line(ctx, x, y + r * 1.8, x + sway, y);
    sunflowerHead(ctx, x + sway, y, r, sway * 0.05, near);
  });
}

export function drawFlowerField(ctx: Ctx, t: number) {
  drawField(ctx, t, (x, y, r, sway, near, i) => {
    const color = BLOOM_COLORS[i % BLOOM_COLORS.length];
    ctx.strokeStyle = "#3d6b1f";
    ctx.lineWidth = Math.max(1.2, r * 0.18);
    line(ctx, x, y + r * 1.8, x + sway, y);
    if (near) {
      blossom(ctx, x + sway, y, r * 0.9, color, i + sway * 0.05);
    } else {
      ctx.fillStyle = color;
      circle(ctx, x + sway, y, r * 0.75);
    }
  });
}

// Hills, rows of flowers drawn by `flower` (smallest and farthest first), and
// the meadow in front where the family stands.
function drawField(
  ctx: Ctx,
  t: number,
  flower: (x: number, y: number, r: number, sway: number, near: boolean, i: number) => void,
) {
  ctx.fillStyle = "#a5d16a";
  ctx.beginPath();
  ctx.moveTo(0, 400);
  ctx.quadraticCurveTo(260, 330, 560, 385);
  ctx.quadraticCurveTo(860, 430, 1280, 360);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.fill();

  const grass = ctx.createLinearGradient(0, 400, 0, H);
  grass.addColorStop(0, "#5f8f2a");
  grass.addColorStop(1, "#3f6b1c");
  ctx.fillStyle = grass;
  ctx.fillRect(0, 405, W, H - 405);

  for (let row = 0; row < 6; row++) {
    const y = 412 + row * 24;
    const r = 5 + row * 3.2;
    const count = 46 - row * 5;
    for (let i = 0; i < count; i++) {
      const x = ((i + rand(i, row + 10) * 0.8) / count) * (W + 40) - 20;
      const sway = Math.sin(t * 1.3 + x * 0.012) * r * 0.25;
      const headY = y - r * 1.8 + rand(i, row + 20) * r * 0.6;
      flower(x, headY, r, sway, row >= 3, i * 7 + row);
    }
  }

  const meadow = ctx.createLinearGradient(0, 540, 0, H);
  meadow.addColorStop(0, "#8cc84b");
  meadow.addColorStop(1, "#6aa83a");
  ctx.fillStyle = meadow;
  ctx.beginPath();
  ctx.moveTo(0, 590);
  ctx.quadraticCurveTo(320, 535, 640, 545);
  ctx.quadraticCurveTo(960, 535, 1280, 590);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.fill();
  ctx.strokeStyle = "#5c9630";
  ctx.lineWidth = 2;
  for (let i = 0; i < 70; i++) {
    const x = rand(i, 30) * W;
    const y = 580 + rand(i, 31) * 130;
    line(ctx, x, y, x + 3 + Math.sin(t * 2 + i) * 2, y - 10);
  }
}

export function drawFrontSunflowers(ctx: Ctx, t: number) {
  for (const [x, y, r, tilt] of FRONT_SUNFLOWERS) {
    const sway = Math.sin(t * 1.1 + x) * 6;
    ctx.strokeStyle = "#3d7a22";
    ctx.lineWidth = r * 0.16;
    ctx.beginPath();
    ctx.moveTo(x - 10, H + 10);
    ctx.quadraticCurveTo(x, y + r * 1.5, x + sway, y);
    ctx.stroke();
    ctx.fillStyle = "#4b8f2a";
    for (const side of [-1, 1]) {
      ellipse(ctx, x + side * r * 0.45, y + r * 1.6, r * 0.5, r * 0.2, side * 0.5);
    }
    sunflowerHead(ctx, x + sway, y, r, tilt + sway * 0.02);
  }
}

// Bushes of blossoms in the front corners.
export function drawFrontBlooms(ctx: Ctx, t: number) {
  for (const [cx, cy, spread] of [
    [70, 680, 1.1],
    [1210, 680, 1.1],
  ]) {
    ctx.fillStyle = "#4b8f2a";
    ellipse(ctx, cx, cy + 30, 120 * spread, 55);
    for (let i = 0; i < 16; i++) {
      const a = Math.PI * (1.05 + rand(i, 60) * 0.9);
      const d = 30 + rand(i, 61) * 80 * spread;
      const x = cx + Math.cos(a) * d + Math.sin(t * 1.2 + i) * 3;
      const y = cy + 20 + Math.sin(a) * d * 0.8;
      blossom(ctx, x, y, 13 + rand(i, 62) * 9, BLOOM_COLORS[i % BLOOM_COLORS.length], i);
    }
  }
}

// Petals carried across the picture by the breeze.
export function drawPetals(ctx: Ctx, t: number, colors: readonly string[]) {
  for (let i = 0; i < 18; i++) {
    const speed = 40 + rand(i, 40) * 40;
    const x = ((rand(i, 41) * W + t * speed) % (W + 60)) - 30;
    const y = ((rand(i, 42) * H + t * speed * 0.35) % (H + 40)) - 20 + Math.sin(t * 2 + i) * 15;
    ctx.fillStyle = colors[i % colors.length];
    ellipse(ctx, x, y, 9, 3.5, t * 2 + i);
  }
}

// ---------------------------------------------------------------- sunset beach

const HORIZON = 400;
// Where the waves reach up the sand at position `x`.
const shore = (t: number, x: number) => 488 + Math.sin(t * 0.9) * 7 + Math.sin(x * 0.018 + t * 1.2) * 4;

export function drawSunsetSky(ctx: Ctx, t: number, sun: { x: number; y: number }) {
  const sky = ctx.createLinearGradient(0, 0, 0, HORIZON);
  sky.addColorStop(0, "#43327a");
  sky.addColorStop(0.45, "#b24c86");
  sky.addColorStop(0.78, "#ff7e5f");
  sky.addColorStop(1, "#ffc876");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, HORIZON);

  const glow = ctx.createRadialGradient(sun.x, sun.y, 40, sun.x, sun.y, 260);
  glow.addColorStop(0, "rgba(255, 214, 130, 0.8)");
  glow.addColorStop(1, "rgba(255, 214, 130, 0)");
  ctx.fillStyle = glow;
  circle(ctx, sun.x, sun.y, 260);
  const disc = ctx.createLinearGradient(0, sun.y - 58, 0, sun.y + 58);
  disc.addColorStop(0, "#fff0a8");
  disc.addColorStop(1, "#ff9f5a");
  ctx.fillStyle = disc;
  circle(ctx, sun.x, sun.y, 58);

  // Long thin clouds lit pink from below.
  for (let i = 0; i < 6; i++) {
    const x = ((rand(i, 80) * W + t * (6 + i * 2)) % (W + 400)) - 200;
    const y = 70 + rand(i, 81) * 220;
    ctx.fillStyle = `rgba(255, 170, 180, ${0.35 + rand(i, 82) * 0.25})`;
    ellipse(ctx, x, y, 90 + rand(i, 83) * 90, 8 + rand(i, 84) * 6);
    ellipse(ctx, x + 40, y - 8, 50 + rand(i, 85) * 40, 7);
  }

  // Seagulls gliding past.
  ctx.strokeStyle = "#3b2a4a";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  for (let i = 0; i < 4; i++) {
    const x = ((rand(i, 86) * W + t * (28 + i * 9)) % (W + 200)) - 100;
    const y = 100 + rand(i, 87) * 120 + Math.sin(t * 1.3 + i) * 8;
    const flap = Math.sin(t * 5 + i * 2) * 5;
    const s = 0.8 + rand(i, 88) * 0.5;
    ctx.beginPath();
    ctx.moveTo(x - 16 * s, y - 4 * s + flap);
    ctx.quadraticCurveTo(x - 7 * s, y - 10 * s, x, y);
    ctx.quadraticCurveTo(x + 7 * s, y - 10 * s, x + 16 * s, y - 4 * s + flap);
    ctx.stroke();
  }
}

// The sea with the sun's reflection, waves washing up white sand, and palms.
export function drawBeach(ctx: Ctx, t: number, sunX: number) {
  const sand = ctx.createLinearGradient(0, 470, 0, H);
  sand.addColorStop(0, "#e3c39d");
  sand.addColorStop(0.15, "#fbefdc");
  sand.addColorStop(1, "#f4dcbd");
  ctx.fillStyle = sand;
  ctx.fillRect(0, 470, W, H - 470);
  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = "rgba(200, 160, 110, 0.45)";
    circle(ctx, rand(i, 89) * W, 515 + rand(i, 90) * 205, 1.2 + rand(i, 91) * 1.5);
  }

  const sea = ctx.createLinearGradient(0, HORIZON, 0, 500);
  sea.addColorStop(0, "#ffb38a");
  sea.addColorStop(0.35, "#a678b0");
  sea.addColorStop(1, "#5577aa");
  ctx.fillStyle = sea;
  ctx.beginPath();
  ctx.moveTo(0, HORIZON);
  ctx.lineTo(W, HORIZON);
  for (let x = W; x >= 0; x -= 20) ctx.lineTo(x, shore(t, x));
  ctx.fill();

  for (let k = 0; k < 11; k++) {
    const width = (70 - k * 5) * (0.75 + 0.25 * Math.sin(t * 3 + k));
    ctx.fillStyle = `rgba(255, 224, 150, ${0.75 - k * 0.05})`;
    ctx.beginPath();
    ctx.roundRect(sunX - width / 2 + Math.sin(t * 2 + k) * 5, HORIZON + 4 + k * 7.5, width, 3, 2);
    ctx.fill();
  }
  ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 12; i++) {
    const x = ((rand(i, 92) * W + t * 12) % W);
    const y = HORIZON + 20 + rand(i, 93) * 55;
    line(ctx, x, y, x + 30 + rand(i, 94) * 30, y);
  }

  // Foam along the water's edge.
  for (const [dy, alpha, width] of [
    [0, 0.95, 6],
    [-9, 0.45, 3],
  ]) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = width;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 20) {
      if (x === 0) ctx.moveTo(x, shore(t, x) + dy);
      else ctx.lineTo(x, shore(t, x) + dy);
    }
    ctx.stroke();
  }

  palm(ctx, t, 70, 640, 120, 150);
  palm(ctx, t, 1215, 640, 1160, 135);
}

function palm(ctx: Ctx, t: number, x: number, y: number, topX: number, topY: number) {
  ctx.lineCap = "round";
  for (let k = 0; k < 12; k++) {
    const a = k / 12;
    const b = (k + 1) / 12;
    const px = (u: number) => x + (topX - x) * u * u;
    const py = (u: number) => y + (topY - y) * u;
    ctx.strokeStyle = k % 2 ? "#7a5236" : "#8c6242";
    ctx.lineWidth = 20 - a * 9;
    line(ctx, px(a), py(a), px(b), py(b));
  }
  for (let k = 0; k < 8; k++) {
    const a = Math.PI * (1.05 + (k * 0.9) / 7) + Math.sin(t * 1.2 + k) * 0.05;
    const len = 110 + (k % 3) * 18;
    const ex = topX + Math.cos(a) * len;
    const ey = topY + Math.sin(a) * len * 0.5 + 55;
    ctx.fillStyle = k % 2 ? "#2f6b3a" : "#3f8a48";
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(topX + Math.cos(a) * len * 0.6, topY + Math.sin(a) * len * 0.6 - 18, ex, ey);
    ctx.quadraticCurveTo(topX + Math.cos(a) * len * 0.5, topY + Math.sin(a) * len * 0.5 + 4, topX, topY);
    ctx.fill();
  }
  ctx.fillStyle = "#6b4423";
  for (const dx of [-10, 6, -2]) circle(ctx, topX + dx, topY + 12 + Math.abs(dx) * 0.4, 9);
}

// A sandcastle and shells in the front corners.
export function drawBeachFront(ctx: Ctx, t: number) {
  const x = 120;
  const y = 700;
  ctx.fillStyle = "#e9c99a";
  ctx.fillRect(x - 60, y - 40, 120, 40);
  for (const dx of [-50, -10, 30]) {
    ctx.fillRect(x + dx, y - 70, 20, 32);
    for (let k = 0; k < 3; k++) ctx.fillRect(x + dx + k * 8, y - 78, 5, 8);
  }
  ctx.fillRect(x - 14, y - 100, 28, 62);
  ctx.fillStyle = "#c9a473";
  ctx.fillRect(x - 6, y - 22, 12, 22);
  ctx.strokeStyle = "#6b4423";
  ctx.lineWidth = 2;
  line(ctx, x, y - 100, x, y - 132);
  ctx.fillStyle = "#ff4d6d";
  triangle(ctx, x, y - 132, x + 22 + Math.sin(t * 6) * 3, y - 125, x, y - 118);

  ctx.save();
  ctx.translate(1170, 690);
  ctx.rotate(0.3);
  ctx.fillStyle = "#ff8c5a";
  for (let k = 0; k < 5; k++) {
    ctx.rotate(TAU / 5);
    ellipse(ctx, 0, -16, 9, 18);
  }
  circle(ctx, 0, 0, 11);
  ctx.restore();
  for (const [sx, sy, r] of [
    [1085, 702, 12],
    [1240, 708, 10],
    [230, 708, 9],
  ]) {
    ctx.fillStyle = "#fff1f4";
    ellipse(ctx, sx, sy, r, r * 0.8);
    ctx.strokeStyle = "#e7a9b6";
    ctx.lineWidth = 1.5;
    for (const k of [-0.5, 0, 0.5]) line(ctx, sx, sy + r * 0.7, sx + k * r * 1.4, sy - r * 0.6);
  }
}

// ---------------------------------------------------------------- cake

export type Cake = {
  x: number;
  top: number; // the table top
  floor: number; // where the table legs stand
  digits: string; // one number candle per digit; "" for plain candles
  sticks?: number; // how many plain candles when there are no digits
  name: string; // written on the cake
  decoration: "sunflower" | "blossom";
  candle: string;
};

// The wick of each candle, where its flame sits.
export function candleFlames(cake: Cake) {
  const n = cake.digits.length || (cake.sticks ?? 1);
  const gap = cake.digits ? 34 : 18;
  return Array.from({ length: n }, (_, i) => ({ x: cake.x + (i - (n - 1) / 2) * gap, y: cake.top - 144 }));
}

// `flame` 0..1 shrinks the candle flames; `smoke` 0..1 animates the wisps after.
export function drawCake(ctx: Ctx, t: number, font: string, cake: Cake, flame: number, smoke: number) {
  const { x: cx, top } = cake;
  // Table with a lace cloth.
  ctx.fillStyle = "#8a5a35";
  for (const side of [-1, 1]) ctx.fillRect(cx + side * 70 - 6, top + 40, 12, cake.floor - top - 40);
  ctx.fillStyle = "#fffdf7";
  ctx.beginPath();
  ctx.moveTo(cx - 100, top);
  ctx.lineTo(cx + 100, top);
  ctx.lineTo(cx + 104, top + 52);
  for (let k = 8; k > 0; k--) {
    const x = cx - 104 + ((k - 1) * 208) / 8;
    ctx.quadraticCurveTo(x + 13, top + 66, x, top + 52);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#f1e6d2";
  ctx.fillRect(cx - 100, top, 200, 6);

  // Two tiers with pink icing drips.
  for (const [w, y, h] of [
    [130, top - 64, 64],
    [88, top - 108, 44],
  ]) {
    ctx.fillStyle = "#fff4f7";
    ctx.beginPath();
    ctx.roundRect(cx - w / 2, y, w, h, 10);
    ctx.fill();
    ctx.fillStyle = "#ff8fab";
    ctx.beginPath();
    ctx.roundRect(cx - w / 2, y, w, 12, [10, 10, 0, 0]);
    ctx.fill();
    for (let k = 0; k < 7; k++) {
      const x = cx - w / 2 + 8 + (k * (w - 16)) / 6;
      ellipse(ctx, x, y + 13, 5, 6 + (k % 3) * 4);
    }
  }
  for (const dx of [-48, 48]) {
    if (cake.decoration === "sunflower") sunflowerHead(ctx, cx + dx, top - 26, 11);
    else blossom(ctx, cx + dx, top - 26, 12, "#c77dff");
  }
  ctx.font = `700 19px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#b5476b";
  ctx.fillText(cake.name, cx, top - 26);

  const flames = candleFlames(cake);
  ctx.font = `700 48px ${font}`;
  ctx.lineJoin = "round";
  ctx.fillStyle = cake.candle;
  Array.from(cake.digits).forEach((digit, i) => {
    const { x, y } = flames[i];
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#ffffff";
    ctx.strokeText(digit, x, y + 22);
    ctx.fillText(digit, x, y + 22);
    ctx.strokeStyle = "#3a2a20";
    ctx.lineWidth = 2;
    line(ctx, x, y, x, y - 6);
  });
  if (!cake.digits) {
    for (const { x, y } of flames) {
      ctx.fillStyle = cake.candle;
      ctx.fillRect(x - 4, y, 8, 38);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 2;
      for (const dy of [8, 20, 32]) line(ctx, x - 4, y + dy + 3, x + 4, y + dy - 3);
      ctx.strokeStyle = "#3a2a20";
      line(ctx, x, y, x, y - 6);
    }
  }

  for (const [i, { x, y }] of flames.entries()) {
    if (flame > 0) {
      const flicker = 1 + Math.sin(t * 17 + i * 2) * 0.08;
      const s = flame * flicker;
      const halo = ctx.createRadialGradient(x, y - 14, 0, x, y - 14, 34 * s);
      halo.addColorStop(0, "rgba(255, 210, 90, 0.55)");
      halo.addColorStop(1, "rgba(255, 210, 90, 0)");
      ctx.fillStyle = halo;
      circle(ctx, x, y - 14, 34 * s);
      for (const [color, k] of [
        ["#ff9f1c", 1],
        ["#ffe66d", 0.6],
      ] as const) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y - 6 - 26 * s * k);
        ctx.quadraticCurveTo(x + 9 * s * k, y - 10, x, y - 4);
        ctx.quadraticCurveTo(x - 9 * s * k, y - 10, x, y - 6 - 26 * s * k);
        ctx.fill();
      }
    }
    if (smoke > 0 && smoke < 1) {
      ctx.strokeStyle = `rgba(150, 150, 150, ${0.6 * (1 - smoke)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let k = 0; k <= 12; k++) {
        const rise = (k / 12) * 70 * (0.4 + smoke);
        const px = x + Math.sin(k * 0.8 + t * 3 + i) * 6 * (k / 12);
        if (k === 0) ctx.moveTo(px, y - 6 - rise);
        else ctx.lineTo(px, y - 6 - rise);
      }
      ctx.stroke();
    }
  }
}

// ---------------------------------------------------------------- party effects

// Gusts of breath blowing from someone's lips to the candles.
export function drawBreath(ctx: Ctx, t: number, from: { x: number; y: number }, to: { x: number; y: number }) {
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4.5;
  ctx.lineCap = "round";
  const dir = Math.sign(to.x - from.x) || 1;
  for (let k = 0; k < 4; k++) {
    const phase = (t * 3 + k / 4) % 1;
    const x = from.x + (to.x - from.x) * phase;
    const y = from.y + (to.y - from.y) * phase + (k - 1.5) * 9 * Math.abs(dir);
    ctx.globalAlpha = Math.sin(phase * Math.PI);
    ctx.beginPath();
    ctx.moveTo(x - dir * 22, y);
    ctx.quadraticCurveTo(x - dir * 8, y - 6, x + dir * 8, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// A burst of confetti from (x0, y0) at time `at`.
export function drawConfetti(ctx: Ctx, t: number, at: number, x0: number, y0: number) {
  const age = t - at;
  if (age < 0) return;
  ctx.globalAlpha = 1 - clamp01((age - 8) / 2);
  for (let i = 0; i < 140; i++) {
    const a = -Math.PI / 2 + (rand(i, 50) - 0.5) * 2.4;
    const speed = 350 + rand(i, 51) * 650;
    // Thrown out fast, then slowed by the air until it flutters down.
    const drag = (1 - Math.exp(-2.2 * age)) / 2.2;
    const x = x0 + Math.cos(a) * speed * drag + Math.sin(age * 3 + i) * 12;
    const y = y0 + Math.sin(a) * speed * drag + age * (45 + rand(i, 52) * 40);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(age * (3 + rand(i, 53) * 5) + i);
    ctx.scale(1, Math.cos(age * 6 + i));
    ctx.fillStyle = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    ctx.fillRect(-6, -3.5, 12, 7);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

function heart(ctx: Ctx, x: number, y: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.35);
  ctx.bezierCurveTo(x - s * 0.9, y - s * 0.25, x - s * 0.35, y - s * 0.95, x, y - s * 0.4);
  ctx.bezierCurveTo(x + s * 0.35, y - s * 0.95, x + s * 0.9, y - s * 0.25, x, y + s * 0.35);
  ctx.fill();
}

// Hearts floating up from above a group while `amount` is above 0.
export function drawHearts(ctx: Ctx, t: number, x: number, y: number, amount: number) {
  if (amount <= 0) return;
  for (let i = 0; i < 8; i++) {
    const phase = (t * 0.35 + i / 8) % 1;
    const hx = x + (i - 3.5) * 46 + Math.sin(phase * 4 + i) * 18;
    ctx.globalAlpha = Math.sin(phase * Math.PI) * amount;
    ctx.fillStyle = i % 2 ? "#ff8fab" : "#ff4d6d";
    heart(ctx, hx, y - phase * 170, 18 + rand(i, 70) * 12);
  }
  ctx.globalAlpha = 1;
}

// Music notes drifting up from a singer's head while `amount` is above 0.
export function drawMusicNotes(ctx: Ctx, t: number, x: number, y: number, amount: number, salt: number) {
  if (amount <= 0) return;
  for (let i = 0; i < 4; i++) {
    const phase = (t * 0.45 + i / 4 + salt * 0.13) % 1;
    const nx = x + Math.sin(phase * 5 + i + salt) * 22 + (i % 2 ? 26 : -26);
    const ny = y - phase * 120;
    ctx.globalAlpha = Math.sin(phase * Math.PI) * amount;
    ctx.fillStyle = ctx.strokeStyle = i % 2 ? "#e0457b" : "#5a3200";
    ellipse(ctx, nx, ny, 7, 5.5, -0.4);
    ctx.lineWidth = 2.5;
    line(ctx, nx + 6, ny - 2, nx + 6, ny - 28);
    line(ctx, nx + 6, ny - 28, nx + 15, ny - 20);
  }
  ctx.globalAlpha = 1;
}
