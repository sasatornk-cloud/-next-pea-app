// Draws one frame of the story at time `t` (seconds). Everything is a pure
// function of `t`, so the same frame always looks the same.

export const W = 1280;
export const H = 720;
export const DURATION = 36;
// The dance follows a 120 bpm soundtrack that starts two seconds in.
export const BEAT = 0.5;
export const MUSIC_START = 2;

const TAU = Math.PI * 2;
const GROUND = 570; // where the characters stand
const GIRL_X = 555;
const SHEEP_X = 725;
const TREE_X = 640;
const TREE_BASE = 520;
const TIERS = [
  { y: 500, half: 165, h: 150 },
  { y: 410, half: 135, h: 140 },
  { y: 325, half: 105, h: 130 },
  { y: 245, half: 72, h: 125 },
];
const STAR = { x: TREE_X, y: 118 };
const LIGHT_COLORS = ["#ff4d6d", "#ffd166", "#4cc9f0", "#80ed99", "#f72585"];
const ORNAMENT_COLORS = ["#e63946", "#ffb703", "#4361ee", "#e0e1dd", "#c77dff"];
const ORNAMENTS = [
  [-0.55, 0.2],
  [0.05, 0.3],
  [0.6, 0.22],
  [-0.25, 0.62],
  [0.35, 0.58],
];
const PINES = [
  [60, 462, 0.8],
  [330, 447, 0.7],
  [960, 440, 0.75],
  [1040, 428, 0.9],
  [1200, 444, 0.7],
];

const CAPTIONS = [
  {
    from: 4.2,
    to: 9,
    lines: ["คืนวันคริสต์มาส หิมะโปรยปรายขาวโพลน", "หนูน้อยผมยาวออกมาชมต้นคริสต์มาสต้นใหญ่"],
  },
  {
    from: 9.2,
    to: 14.8,
    lines: ["ทันใดนั้น... เจ้าแกะน้อยขนปุยปุย", "ก็กระโดดดึ๋ง ๆ ออกมาทักทาย"],
  },
  {
    from: 15,
    to: 22,
    lines: ["หนูน้อยกับแกะน้อยจับมือกัน", "แล้วเต้นรำหน้าต้นคริสต์มาสอย่างสนุกสนาน"],
  },
  {
    from: 22.2,
    to: 29.8,
    lines: ["หมุนตัวไปทางซ้าย กระโดดไปทางขวา", "ไฟบนต้นคริสต์มาสก็กะพริบตามจังหวะ วิบวับ ๆ"],
  },
  { from: 30.5, to: 33.6, lines: ["ขอให้ทุกคนมีความสุขมาก ๆ นะจ๊ะ"] },
];
const BUBBLES = [
  { from: 11.7, to: 13.3, who: "girl", text: "สวัสดีจ้ะ แกะน้อย!" },
  { from: 13.4, to: 15, who: "sheep", text: "แบ๊ะ แบ๊ะ! มาเต้นรำกันไหม?" },
] as const;
const FIREWORKS = [
  { at: 30.2, x: 640, y: 118 },
  { at: 31.2, x: 330, y: 170 },
  { at: 31.9, x: 950, y: 160 },
  { at: 33, x: 470, y: 110 },
  { at: 33.6, x: 820, y: 100 },
];

type Ctx = CanvasRenderingContext2D;

type Pose = {
  x: number;
  y: number;
  scale?: number;
  turn?: number; // spin angle; 0 faces the viewer
  bounce?: number; // pixels above the ground
  lean?: number;
  armL?: number; // radians raised from hanging straight down
  armR?: number;
  step?: number; // walking phase; legs swing with sin(step)
  swing?: number; // hair sway, -1..1
  mouth?: number; // 0 closed smile .. 1 wide open
  blink?: boolean;
};

// Deterministic pseudo-random in [0, 1).
function rand(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ramp = (t: number, from: number, to: number) => clamp01((t - from) / (to - from));
const ease = (x: number) => x * x * (3 - 2 * x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
// 1 between `from` and `to`, fading in and out over `edge` seconds.
const visible = (t: number, from: number, to: number, edge = 0.4) =>
  Math.min(ramp(t, from, from + edge), 1 - ramp(t, to - edge, to));

function circle(ctx: Ctx, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

function ellipse(ctx: Ctx, x: number, y: number, rx: number, ry: number, rotation = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rotation, 0, TAU);
  ctx.fill();
}

function triangle(ctx: Ctx, ...p: number[]) {
  ctx.beginPath();
  ctx.moveTo(p[0], p[1]);
  ctx.lineTo(p[2], p[3]);
  ctx.lineTo(p[4], p[5]);
  ctx.fill();
}

function line(ctx: Ctx, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// ---------------------------------------------------------------- scenery

function drawSky(ctx: Ctx, t: number) {
  const sky = ctx.createLinearGradient(0, 0, 0, 520);
  sky.addColorStop(0, "#0a1640");
  sky.addColorStop(1, "#3d5fa8");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#fffbe6";
  for (let i = 0; i < 90; i++) {
    ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t * (0.8 + rand(i, 4)) + i));
    circle(ctx, rand(i, 1) * W, rand(i, 2) * 400, 0.8 + rand(i, 3) * 1.5);
  }
  ctx.globalAlpha = 1;

  const glow = ctx.createRadialGradient(1100, 110, 30, 1100, 110, 130);
  glow.addColorStop(0, "rgba(255, 248, 214, 0.5)");
  glow.addColorStop(1, "rgba(255, 248, 214, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(960, 0, 280, 250);
  ctx.fillStyle = "#fff6d5";
  circle(ctx, 1100, 110, 42);
}

function drawPine(ctx: Ctx, x: number, y: number, s: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = "#5b3a29";
  ctx.fillRect(-5, -12, 10, 14);
  for (let k = 0; k < 3; k++) {
    const top = -40 - k * 22;
    const half = 30 - k * 7;
    ctx.fillStyle = "#2f5d6b";
    triangle(ctx, -half, top + 34, half, top + 34, 0, top - 6);
    ctx.fillStyle = "#f3f7fd";
    triangle(ctx, -half * 0.35, top + 6, half * 0.35, top + 6, 0, top - 6);
  }
  ctx.restore();
}

function drawCabin(ctx: Ctx, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#7a4128";
  ctx.fillRect(28, -100, 14, 30);
  ctx.fillStyle = "#8c4f32";
  ctx.fillRect(-55, -60, 110, 60);
  const glow = ctx.createRadialGradient(-20, -33, 5, -20, -33, 45);
  glow.addColorStop(0, "rgba(255, 213, 107, 0.6)");
  glow.addColorStop(1, "rgba(255, 213, 107, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(-65, -78, 90, 90);
  ctx.fillStyle = "#ffd56b";
  ctx.fillRect(-32, -44, 24, 22);
  ctx.strokeStyle = "#8c4f32";
  ctx.lineWidth = 3;
  line(ctx, -20, -44, -20, -22);
  line(ctx, -32, -33, -8, -33);
  ctx.fillStyle = "#5a2f1c";
  ctx.beginPath();
  ctx.roundRect(14, -40, 22, 40, [10, 10, 0, 0]);
  ctx.fill();
  ctx.fillStyle = "#f4f8fd";
  triangle(ctx, -70, -58, 0, -105, 70, -58);
  ctx.restore();
}

function drawLand(ctx: Ctx) {
  ctx.fillStyle = "#b9cbe8";
  ctx.beginPath();
  ctx.moveTo(0, 470);
  ctx.quadraticCurveTo(200, 400, 420, 455);
  ctx.quadraticCurveTo(640, 500, 880, 440);
  ctx.quadraticCurveTo(1080, 395, 1280, 450);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.fill();
  for (const [x, y, s] of PINES) drawPine(ctx, x, y, s);
  drawCabin(ctx, 190, 448);

  const snow = ctx.createLinearGradient(0, 480, 0, H);
  snow.addColorStop(0, "#e6eef9");
  snow.addColorStop(1, "#c4d3ea");
  ctx.fillStyle = snow;
  ctx.beginPath();
  ctx.moveTo(0, 520);
  ctx.quadraticCurveTo(320, 480, 640, 505);
  ctx.quadraticCurveTo(960, 530, 1280, 495);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.fill();
}

function drawPresent(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  box: string,
  ribbon: string,
) {
  ctx.fillStyle = box;
  ctx.fillRect(x - w / 2, y - h, w, h);
  ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
  ctx.fillRect(x - w / 2, y - h, w, 8);
  ctx.fillStyle = ribbon;
  ctx.fillRect(x - 5, y - h, 10, h);
  ctx.fillRect(x - w / 2, y - h / 2 - 5, w, 10);
  ellipse(ctx, x - 11, y - h - 6, 12, 7, -0.4);
  ellipse(ctx, x + 11, y - h - 6, 12, 7, 0.4);
}

// Point along a tier's garland, `u` from 0 (left) to 1 (right).
function garlandPoint(tier: (typeof TIERS)[number], u: number) {
  const x0 = TREE_X - tier.half * 0.55;
  const y0 = tier.y - tier.h * 0.42;
  const x2 = TREE_X + tier.half * 0.82;
  const y2 = tier.y - tier.h * 0.12;
  const cx = TREE_X;
  const cy = tier.y - tier.h * 0.05;
  const a = (1 - u) * (1 - u);
  const b = 2 * (1 - u) * u;
  const c = u * u;
  return { x: a * x0 + b * cx + c * x2, y: a * y0 + b * cy + c * y2 };
}

// `energy` (0..1) switches the lights from slow twinkling to flashing on the beat.
function drawTree(ctx: Ctx, t: number, energy: number, starGlow: number) {
  ctx.fillStyle = "#6b3e1f";
  ctx.fillRect(TREE_X - 20, TREE_BASE - 30, 40, 45);

  const beat = Math.floor((t - MUSIC_START) / BEAT);
  let light = 0;
  TIERS.forEach((tier, index) => {
    const { y, half, h } = tier;
    const green = ctx.createLinearGradient(TREE_X - half, 0, TREE_X + half, 0);
    green.addColorStop(0, "#17552e");
    green.addColorStop(0.5, "#2e8f4e");
    green.addColorStop(1, "#1a5f33");
    ctx.fillStyle = green;
    const bumps = 5;
    ctx.beginPath();
    ctx.moveTo(TREE_X, y - h);
    ctx.lineTo(TREE_X + half, y);
    for (let k = bumps; k > 0; k--) {
      const x1 = TREE_X - half + ((k - 1) * 2 * half) / bumps;
      ctx.quadraticCurveTo(x1 + half / bumps, y + 16, x1, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    for (let k = 0; k < bumps; k++) {
      const xm = TREE_X - half + ((k * 2 + 1) * half) / bumps;
      ellipse(ctx, xm, y + 4, (half / bumps) * 0.6, 5);
    }

    ORNAMENTS.forEach(([u, v], k) => {
      const x = TREE_X + u * half * (1 - v) * 0.85;
      const oy = y - v * h;
      const r = 11 - index;
      const shine = ctx.createRadialGradient(x - r / 3, oy - r / 3, 1, x, oy, r);
      shine.addColorStop(0, "#ffffff");
      shine.addColorStop(0.35, ORNAMENT_COLORS[(k + index) % ORNAMENT_COLORS.length]);
      shine.addColorStop(1, "#1d2b53");
      ctx.fillStyle = shine;
      circle(ctx, x, oy, r);
    });

    ctx.strokeStyle = "#f2c84b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let s = 0; s <= 20; s++) {
      const p = garlandPoint(tier, s / 20);
      if (s === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();

    for (let j = 0; j < 7; j++, light++) {
      const p = garlandPoint(tier, (j + 0.5) / 7);
      const twinkle = 0.55 + 0.45 * Math.sin(t * 3 + light * 1.7);
      const flash = (light + beat) % 2 === 0 ? 1 : 0.2;
      const bright = lerp(twinkle, flash, energy);
      const color = LIGHT_COLORS[(light + (energy > 0.5 ? beat : 0)) % LIGHT_COLORS.length];
      ctx.globalAlpha = bright * 0.7;
      const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 15);
      halo.addColorStop(0, color);
      halo.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = halo;
      circle(ctx, p.x, p.y, 15);
      ctx.globalAlpha = 0.4 + bright * 0.6;
      ctx.fillStyle = color;
      circle(ctx, p.x, p.y, 4.5);
      ctx.globalAlpha = 1;
    }
  });

  drawPresent(ctx, TREE_X - 120, 532, 70, 50, "#e63946", "#ffd166");
  drawPresent(ctx, TREE_X + 108, 534, 60, 44, "#4361ee", "#f1faee");
  drawPresent(ctx, TREE_X - 20, 542, 50, 36, "#2a9d8f", "#ffb4a2");

  // Star with a glow that grows into rotating rays for the finale.
  const { x, y } = STAR;
  const radius = 50 + starGlow * 100;
  const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
  glow.addColorStop(0, "rgba(255, 230, 120, 0.7)");
  glow.addColorStop(1, "rgba(255, 230, 120, 0)");
  ctx.fillStyle = glow;
  circle(ctx, x, y, radius);
  if (starGlow > 0.4) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 0.6);
    ctx.fillStyle = `rgba(255, 236, 150, ${0.3 * starGlow})`;
    for (let k = 0; k < 12; k++) {
      ctx.rotate(TAU / 12);
      triangle(ctx, -6, 0, 6, 0, 0, -160 * starGlow);
    }
    ctx.restore();
  }
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(t) * 0.08);
  const gold = ctx.createLinearGradient(0, -32, 0, 32);
  gold.addColorStop(0, "#fff3b0");
  gold.addColorStop(1, "#f5b700");
  ctx.fillStyle = gold;
  ctx.strokeStyle = "#d48c00";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 14 : 32;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawFireworks(ctx: Ctx, t: number) {
  FIREWORKS.forEach((burst, j) => {
    const age = t - burst.at;
    if (age < 0 || age > 1.6) return;
    const spread = ease(Math.min(age / 1.1, 1)) * 150;
    ctx.globalAlpha = 1 - age / 1.6;
    for (const ring of [1, 0.6]) {
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * TAU + ring;
        ctx.fillStyle = LIGHT_COLORS[(i + j) % LIGHT_COLORS.length];
        circle(
          ctx,
          burst.x + Math.cos(a) * spread * ring,
          burst.y + Math.sin(a) * spread * ring + age * age * 30,
          3.5 * ring,
        );
      }
    }
  });
  ctx.globalAlpha = 1;
}

function drawSnow(ctx: Ctx, t: number) {
  ctx.fillStyle = "#ffffff";
  ctx.globalAlpha = 0.85;
  for (let i = 0; i < 140; i++) {
    const size = 1.5 + rand(i, 7) * 3.5;
    const y = ((rand(i, 6) * (H + 40) + t * (25 + size * 12)) % (H + 40)) - 20;
    const x = (rand(i, 5) * W + Math.sin(t * 0.8 + i) * 18 + W) % W;
    circle(ctx, x, y, size);
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- characters

// Draws the ground shadow, then calls `draw` in the character's local space
// (feet at the origin, up is -y). `front` is false while spun to face away.
function withPose(ctx: Ctx, p: Pose, draw: (front: boolean) => void) {
  const s = p.scale ?? 1;
  const bounce = p.bounce ?? 0;
  ctx.fillStyle = "rgba(30, 50, 100, 0.22)";
  ellipse(ctx, p.x, p.y, 50 * s * (1 - bounce / 150), 11 * s);
  const facing = Math.cos(p.turn ?? 0);
  ctx.save();
  ctx.translate(p.x, p.y - bounce);
  ctx.rotate(p.lean ?? 0);
  ctx.scale(s * Math.sign(facing || 1) * Math.max(Math.abs(facing), 0.12), s);
  draw(facing >= 0);
  ctx.restore();
}

// Rotates a limb hanging from (x, y) outward by `raise` radians on the given side.
function limb(ctx: Ctx, side: number, x: number, y: number, raise: number, draw: () => void) {
  ctx.save();
  ctx.translate(side * x, y);
  ctx.rotate(-side * raise);
  draw();
  ctx.restore();
}

const HAIR = "#4a2a17";
const SKIN = "#ffe0c8";
const DRESS = "#d62839";

function longHair(ctx: Ctx, sway: number) {
  ctx.fillStyle = HAIR;
  ctx.beginPath();
  ctx.moveTo(-56, -218);
  ctx.quadraticCurveTo(-74, -150, -58 + sway, -92);
  ctx.quadraticCurveTo(sway, -78, 58 + sway, -92);
  ctx.quadraticCurveTo(74, -150, 56, -218);
  ctx.arc(0, -212, 57, -0.1, Math.PI + 0.1, true);
  ctx.fill();
}

function mouth(ctx: Ctx, open: number, y: number, color: string) {
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

function eyes(ctx: Ctx, spread: number, y: number, rx: number, ry: number, blink?: boolean) {
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

function drawGirl(ctx: Ctx, p: Pose) {
  withPose(ctx, p, (front) => {
    const sway = (p.swing ?? 0) * 22;
    const step = p.step ?? 0;
    ctx.lineCap = "round";

    for (const side of [-1, 1]) {
      limb(ctx, side, 13, -68, Math.sin(step) * 0.35, () => {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(-6, 0, 12, 58, 6);
        ctx.fill();
        ctx.fillStyle = "#2b2b3a";
        ellipse(ctx, side * 3, 60, 11, 7);
      });
    }

    if (front) longHair(ctx, sway);

    const dress = ctx.createLinearGradient(0, -150, 0, -60);
    dress.addColorStop(0, "#e8364a");
    dress.addColorStop(1, "#b81d2e");
    ctx.fillStyle = dress;
    ctx.beginPath();
    ctx.moveTo(-24, -152);
    ctx.lineTo(24, -152);
    ctx.quadraticCurveTo(34, -110, 50, -66);
    ctx.quadraticCurveTo(0, -56, -50, -66);
    ctx.quadraticCurveTo(-34, -110, -24, -152);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(-52, -74, 104, 14, 7);
    ctx.fill();
    if (front) {
      ellipse(ctx, 0, -152, 20, 7);
      ctx.fillStyle = "#ffd166";
      circle(ctx, 0, -132, 3.5);
      circle(ctx, 0, -116, 3.5);
    }

    for (const [side, raise] of [
      [-1, p.armL ?? 0.15],
      [1, p.armR ?? 0.15],
    ]) {
      // Any higher and her hands would cover her face.
      limb(ctx, side, 24, -146, Math.min(raise, 2.05), () => {
        ctx.strokeStyle = SKIN;
        ctx.lineWidth = 11;
        line(ctx, 0, 0, 0, 56);
        ctx.strokeStyle = DRESS;
        ctx.lineWidth = 17;
        line(ctx, 0, 0, 0, 18);
        ctx.fillStyle = SKIN;
        circle(ctx, 0, 60, 8);
      });
    }

    ctx.fillStyle = SKIN;
    ctx.fillRect(-7, -168, 14, 18);

    if (front) {
      circle(ctx, 0, -212, 52);
      eyes(ctx, 19, -206, 6.5, 8.5, p.blink);
      ctx.fillStyle = "rgba(255, 120, 140, 0.45)";
      ellipse(ctx, -32, -190, 9, 6);
      ellipse(ctx, 32, -190, 9, 6);
      mouth(ctx, p.mouth ?? 0, -186, "#a8323e");

      // Bangs
      ctx.fillStyle = HAIR;
      ctx.beginPath();
      ctx.moveTo(-56, -208);
      ctx.arc(0, -212, 57, Math.PI + 0.07, -0.07);
      ctx.lineTo(52, -196);
      ctx.quadraticCurveTo(42, -236, 24, -226);
      ctx.quadraticCurveTo(12, -242, -2, -228);
      ctx.quadraticCurveTo(-18, -242, -30, -226);
      ctx.quadraticCurveTo(-46, -234, -52, -196);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, -212, 46, 1.2 * Math.PI, 1.45 * Math.PI);
      ctx.stroke();

      // Locks falling over the shoulders
      ctx.strokeStyle = HAIR;
      ctx.lineWidth = 16;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(side * 50, -205);
        ctx.quadraticCurveTo(side * 58 + sway * 0.2, -170, side * 48 + sway * 0.5, -128);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = HAIR;
      circle(ctx, 0, -212, 57);
      longHair(ctx, sway);
    }

    ctx.fillStyle = "#e63946";
    triangle(ctx, 36, -255, 14, -270, 16, -240);
    triangle(ctx, 36, -255, 58, -270, 56, -240);
    ctx.fillStyle = "#c1121f";
    circle(ctx, 36, -255, 6);
  });
}

const WOOL = "#fbfaf4";
const WOOL_EDGE = "#d9d6c8";
const SHEEP_DARK = "#4a4848";

// A cloud of overlapping puffs with a soft outline.
function wool(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, puffs: number, r: number) {
  const points = Array.from({ length: puffs }, (_, k) => {
    const a = (k / puffs) * TAU;
    return [cx + Math.cos(a) * rx * 0.8, cy + Math.sin(a) * ry * 0.8];
  });
  for (const [color, grow] of [
    [WOOL_EDGE, 3],
    [WOOL, 0],
  ] as const) {
    ctx.fillStyle = color;
    for (const [x, y] of points) circle(ctx, x, y, r + grow);
    ellipse(ctx, cx, cy, rx * 0.85 + grow, ry * 0.85 + grow);
  }
}

function drawSheep(ctx: Ctx, p: Pose) {
  withPose(ctx, p, () => {
    const step = p.step ?? 0;
    ctx.lineCap = "round";

    for (const side of [-1, 1]) {
      limb(ctx, side, 18, -58, Math.sin(step) * 0.4, () => {
        ctx.fillStyle = SHEEP_DARK;
        ctx.beginPath();
        ctx.roundRect(-7, 0, 14, 50, 7);
        ctx.fill();
        ctx.fillStyle = "#222222";
        ctx.beginPath();
        ctx.roundRect(-9, 42, 18, 12, 5);
        ctx.fill();
      });
    }

    wool(ctx, 0, -100, 56, 50, 9, 22);
    ctx.strokeStyle = WOOL_EDGE;
    ctx.lineWidth = 2;
    for (const [x, y] of [
      [-22, -92],
      [14, -78],
      [24, -108],
      [-8, -66],
    ]) {
      ctx.beginPath();
      ctx.arc(x, y, 7, 0.2 * Math.PI, 1.3 * Math.PI);
      ctx.stroke();
    }

    ctx.fillStyle = "#d62839";
    ctx.beginPath();
    ctx.roundRect(-30, -138, 60, 10, 5);
    ctx.fill();
    ctx.fillStyle = "#f5b700";
    circle(ctx, 0, -124, 9);
    ctx.strokeStyle = "#8a5a00";
    ctx.lineWidth = 2;
    line(ctx, -4, -121, 4, -121);

    for (const [side, raise] of [
      [-1, p.armL ?? 0.3],
      [1, p.armR ?? 0.3],
    ]) {
      limb(ctx, side, 40, -120, raise, () => {
        ctx.strokeStyle = SHEEP_DARK;
        ctx.lineWidth = 12;
        line(ctx, 0, 0, 0, 36);
        ctx.fillStyle = "#222222";
        circle(ctx, 0, 40, 7.5);
      });
    }

    for (const side of [-1, 1]) {
      ctx.fillStyle = SHEEP_DARK;
      ellipse(ctx, side * 38, -176, 18, 8, side * (0.4 + (p.swing ?? 0) * 0.2));
      ctx.fillStyle = "#f4a6b8";
      ellipse(ctx, side * 38, -176, 11, 4, side * (0.4 + (p.swing ?? 0) * 0.2));
    }
    ctx.fillStyle = SHEEP_DARK;
    ellipse(ctx, 0, -168, 30, 35);
    wool(ctx, 0, -200, 22, 10, 4, 11);

    for (const side of [-1, 1]) {
      if (p.blink) continue;
      ctx.fillStyle = "#ffffff";
      circle(ctx, side * 12, -172, 8);
    }
    eyes(ctx, 12, -171, 4.5, 4.5, p.blink);
    if (p.blink) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.5;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(side * 12, -173, 6, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
      }
    }
    ctx.fillStyle = "rgba(244, 166, 184, 0.6)";
    ellipse(ctx, -20, -153, 6, 4);
    ellipse(ctx, 20, -153, 6, 4);
    ctx.save();
    ctx.scale(0.7, 0.7);
    mouth(ctx, p.mouth ?? 0, -208, "#c9c5b8");
    ctx.restore();
  });
}

// ---------------------------------------------------------------- choreography

function choreograph(t: number) {
  const beat = (t - MUSIC_START) / BEAT;
  // 0 on each beat, 1 halfway between: jumps land on the beat.
  const pulse = Math.abs(Math.sin(Math.PI * beat));
  const girl: Pose = {
    x: GIRL_X,
    y: GROUND,
    blink: t % 3.3 < 0.13,
    lean: Math.sin(t * 2) * 0.03,
  };
  const sheep: Pose = {
    x: SHEEP_X,
    y: GROUND,
    blink: (t + 1.4) % 3.7 < 0.13,
    lean: Math.sin(t * 2 + 1) * 0.03,
  };

  // Girl walks in from the left.
  if (t < 8.5) {
    girl.x = lerp(-90, GIRL_X, ramp(t, 3.8, 8.5));
    if (t > 3.8) {
      const walk = Math.sin(t * 9);
      girl.step = t * 9;
      girl.bounce = Math.abs(walk) * 5;
      girl.armL = 0.2 + walk * 0.3;
      girl.armR = 0.2 - walk * 0.3;
      girl.swing = -0.4;
    }
  }

  // Sheep hops in from the right.
  if (t < 12.5) {
    const k = ramp(t, 9, 12.5);
    sheep.x = lerp(1380, SHEEP_X, k);
    if (k > 0 && k < 1) {
      sheep.bounce = Math.abs(Math.sin(Math.PI * k * 6)) * 45;
      sheep.armL = sheep.armR = 0.6 + sheep.bounce / 45;
    }
  }

  if (t > 11.7 && t < 13.3) {
    girl.armR = 2.5 + Math.sin(t * 12) * 0.35;
    girl.mouth = 0.6;
  }
  if (t > 13.4 && t < 15) {
    sheep.mouth = 0.4 + 0.5 * Math.abs(Math.sin(t * 10));
    sheep.armR = 2.4 + Math.sin(t * 12) * 0.35;
  }

  if (t >= 15 && t < 30) {
    girl.mouth = 0.7;
    sheep.mouth = 0.6;
  }

  if (t >= 15 && t < 19) {
    // Hold hands and sway two beats each way.
    const sway = Math.sin((Math.PI * beat) / 2);
    for (const c of [girl, sheep]) {
      c.x += sway * 22;
      c.lean = sway * 0.1;
      c.bounce = pulse * 10;
    }
    girl.armR = 1.15;
    sheep.armL = 1.2;
    girl.armL = 2.3 + sway * 0.3;
    sheep.armR = 2.3 - sway * 0.3;
    girl.swing = -sway * 0.8;
  } else if (t >= 19 && t < 23) {
    // Girl twirls twice; sheep hops on every beat.
    girl.turn = TAU * 2 * ease(ramp(t, 19, 23));
    girl.armL = girl.armR = 2.7;
    girl.swing = Math.sin(girl.turn);
    girl.bounce = pulse * 6;
    sheep.bounce = pulse * 35;
    sheep.armL = 2.4 + Math.sin(Math.PI * beat) * 0.4;
    sheep.armR = 2.4 - Math.sin(Math.PI * beat) * 0.4;
    sheep.lean = Math.sin((Math.PI * beat) / 2) * 0.12;
  } else if (t >= 23 && t < 27) {
    // Dance a full circle around each other.
    const angle = TAU * ease(ramp(t, 23, 27));
    const rx = (SHEEP_X - GIRL_X) / 2;
    const depth = Math.sin(angle) * 14;
    girl.x = TREE_X - rx * Math.cos(angle);
    girl.y = GROUND + depth;
    girl.scale = 1 + (depth / 14) * 0.06;
    sheep.x = TREE_X + rx * Math.cos(angle);
    sheep.y = GROUND - depth;
    sheep.scale = 1 - (depth / 14) * 0.06;
    for (const c of [girl, sheep]) {
      c.step = t * 10;
      c.bounce = pulse * 8;
      c.armL = c.armR = 1.1;
    }
    girl.swing = Math.cos(angle) * 0.6;
  } else if (t >= 27 && t < 30) {
    // Jump together on every beat.
    for (const c of [girl, sheep]) {
      c.bounce = pulse * 45;
      c.armL = c.armR = 0.4 + pulse * 2.3;
      c.lean = 0;
      c.mouth = 0.4 + pulse * 0.6;
    }
    girl.swing = Math.sin(Math.PI * beat) * 0.3;
  } else if (t >= 30) {
    for (const c of [girl, sheep]) {
      c.armL = c.armR = 2.5 + Math.sin(t * 6) * 0.25;
      c.bounce = pulse * 8;
      c.mouth = 0.8;
    }
  }

  const energy = t >= 15 ? 1 : 0;
  const starGlow = 0.25 + 0.1 * Math.sin(t * 2) + ramp(t, 30, 31) * 0.75;
  return { girl, sheep, energy, starGlow };
}

// ---------------------------------------------------------------- text

function outlinedText(
  ctx: Ctx,
  font: string,
  text: string,
  x: number,
  y: number,
  size: number,
  fill: string,
) {
  ctx.font = `700 ${size}px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.lineWidth = size * 0.16;
  ctx.strokeStyle = "#1d2b53";
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

function drawCaption(ctx: Ctx, font: string, lines: readonly string[], alpha: number) {
  const lineHeight = 44;
  const h = lines.length * lineHeight + 26;
  const y = H - 18 - h;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(10, 22, 64, 0.72)";
  ctx.beginPath();
  ctx.roundRect(140, y, W - 280, h, 22);
  ctx.fill();
  ctx.font = `500 32px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff8e7";
  lines.forEach((text, i) => ctx.fillText(text, W / 2, y + 13 + lineHeight * (i + 0.5)));
  ctx.globalAlpha = 1;
}

function drawBubble(ctx: Ctx, font: string, text: string, x: number, bottom: number, alpha: number) {
  ctx.globalAlpha = alpha;
  ctx.font = `700 26px ${font}`;
  const w = ctx.measureText(text).width + 40;
  const h = 52;
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(10, 22, 64, 0.35)";
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.roundRect(x - w / 2, bottom - h, w, h, 24);
  ctx.moveTo(x - 12, bottom - 2);
  ctx.lineTo(x + 12, bottom - 2);
  ctx.lineTo(x, bottom + 18);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#1d2b53";
  ctx.fillText(text, x, bottom - h / 2);
  ctx.globalAlpha = 1;
}

function drawTitle(ctx: Ctx, font: string, alpha: number) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(10, 22, 64, 0.65)";
  ctx.beginPath();
  ctx.roundRect(W / 2 - 380, 190, 760, 220, 36);
  ctx.fill();
  outlinedText(ctx, font, "หนูน้อยกับแกะน้อย", W / 2, 268, 76, "#ffd166");
  outlinedText(ctx, font, "ในคืนวันคริสต์มาส", W / 2, 348, 46, "#ffffff");
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- frame

export function drawStory(ctx: Ctx, t: number, font: string) {
  ctx.save();
  // The canvas may be bigger than the 1280x720 design size.
  ctx.setTransform(ctx.canvas.width / W, 0, 0, ctx.canvas.height / H, 0, 0);

  const { girl, sheep, energy, starGlow } = choreograph(t);
  drawSky(ctx, t);
  drawLand(ctx);
  drawFireworks(ctx, t);
  drawTree(ctx, t, energy, starGlow);

  const cast = [
    { pose: girl, draw: drawGirl },
    { pose: sheep, draw: drawSheep },
  ].sort((a, b) => a.pose.y - b.pose.y);
  for (const { pose, draw } of cast) draw(ctx, pose);

  for (const bubble of BUBBLES) {
    const alpha = visible(t, bubble.from, bubble.to, 0.2);
    if (alpha <= 0) continue;
    const speaker = bubble.who === "girl" ? girl : sheep;
    const top = bubble.who === "girl" ? 285 : 230;
    drawBubble(ctx, font, bubble.text, speaker.x, speaker.y - top, alpha);
  }

  drawSnow(ctx, t);

  const titleAlpha = visible(t, 0.3, 4, 0.6);
  if (titleAlpha > 0) drawTitle(ctx, font, titleAlpha);
  for (const caption of CAPTIONS) {
    const alpha = visible(t, caption.from, caption.to);
    if (alpha > 0) drawCaption(ctx, font, caption.lines, alpha);
  }
  const greeting = visible(t, 30.2, 36, 0.5);
  if (greeting > 0) {
    ctx.globalAlpha = greeting;
    outlinedText(ctx, font, "สุขสันต์วันคริสต์มาส!", W / 2, 58, 64, "#ffd166");
    ctx.globalAlpha = 1;
  }
  const theEnd = visible(t, 33.8, 36, 0.5);
  if (theEnd > 0) {
    ctx.globalAlpha = theEnd;
    outlinedText(ctx, font, "~ จบ ~", W / 2, H - 70, 52, "#ffffff");
    ctx.globalAlpha = 1;
  }

  const black = Math.max(1 - ramp(t, 0, 0.8), ramp(t, 35.2, 36));
  if (black > 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${black})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}
