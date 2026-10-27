import {
  type Ctx,
  type Pose,
  TAU,
  blossom,
  circle,
  ellipse,
  eyes,
  limb,
  line,
  mouth,
  sunflowerHead,
  triangle,
  withPose,
} from "./draw";

const SKIN = "#f3cba8";
const LIPS = "#8a3a2a";

export type ManLook = {
  shirt: [string, string]; // left-to-right gradient
  sleeve: string;
  collar: string;
  pants: string;
  hair: string;
  hairStyle: "parted" | "quiff" | "receding";
  greying?: boolean; // a few white strands through the hair
  smileLines?: boolean; // little creases at the corners of the mouth
  glasses?: boolean;
  mustache?: boolean;
  hat?: boolean;
};

export type WomanLook = {
  dress: [string, string, string]; // shade, highlight, shade
  outline: string;
  sash: string;
  hair: string;
  hairStyle: "long" | "ponytail" | "curly";
  clip?: "sunflower" | string; // hair flower: a sunflower or a blossom color
  greying?: boolean; // a few white strands through the hair
  smileLines?: boolean; // little creases at the corners of the mouth
  glasses?: boolean;
  crown?: boolean; // a ring of flowers for the birthday girl
};

export const NOB: ManLook = {
  shirt: ["#5aa2e0", "#3f86c8"],
  sleeve: "#4a93d4",
  collar: "#e8f4ff",
  pants: "#2f3e5c",
  hair: "#21150f",
  hairStyle: "parted",
};
export const MEE: ManLook = {
  shirt: ["#f4ead2", "#e2d4b3"],
  sleeve: "#ece0c4",
  collar: "#fffaf0",
  pants: "#6b4f3a",
  hair: "#1f1510",
  hairStyle: "parted",
  greying: true,
  smileLines: true,
};
export const BOSS: ManLook = {
  shirt: ["#6cc08b", "#4ea56f"],
  sleeve: "#5db37d",
  collar: "#e9f8ee",
  pants: "#c8b48a",
  hair: "#21150f",
  hairStyle: "quiff",
  glasses: true,
};
export const YOK: WomanLook = {
  dress: ["#f1ece3", "#ffffff", "#e9e2d6"],
  outline: "#d4cab8",
  sash: "#f4c430",
  hair: "#2b1a12",
  hairStyle: "long",
  clip: "sunflower",
};
export const KUNG: WomanLook = {
  dress: ["#9c5a98", "#c98bc4", "#8e4f8a"],
  outline: "#7a3f76",
  sash: "#e6b450",
  hair: "#1f1510",
  hairStyle: "curly", // black, shoulder length
  greying: true,
  smileLines: true,
  crown: true,
};
export const NOEY: WomanLook = {
  dress: ["#f07b93", "#ffb3c1", "#e86a85"],
  outline: "#d95a76",
  sash: "#ffffff",
  hair: "#3a2216",
  hairStyle: "ponytail",
  clip: "#ffffff",
};

// How far above someone's feet their head ends, for bubbles, labels and notes.
export const HEAD_TOP = { man: 360, manWithHat: 415, woman: 345, toddler: 190 };

function cheeks(ctx: Ctx, spread: number, y: number, rx: number) {
  ctx.fillStyle = "rgba(255, 120, 130, 0.4)";
  ellipse(ctx, -spread, y, rx, rx * 0.65);
  ellipse(ctx, spread, y, rx, rx * 0.65);
}

function face(ctx: Ctx, p: Pose, y: number, scale: number, smileLines?: boolean) {
  ctx.save();
  ctx.translate(0, y);
  ctx.scale(scale, scale);
  if (smileLines) {
    ctx.strokeStyle = "rgba(150, 90, 60, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * 13.5, -4);
      ctx.quadraticCurveTo(side * 15.5, -2, side * 14.5, 1);
      ctx.stroke();
    }
  }
  if (p.pucker) {
    ctx.fillStyle = "#a8323e";
    ellipse(ctx, 0, 0, 6, 7);
  } else {
    mouth(ctx, p.mouth ?? 0, 0, LIPS);
  }
  ctx.restore();
}

const GREY = "rgba(238, 238, 238, 0.85)";

// White strands as curves, each [x1, y1, control x, control y, x2, y2].
function greyStrands(ctx: Ctx, strands: number[][]) {
  ctx.strokeStyle = GREY;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  for (const [x1, y1, cx, cy, x2, y2] of strands) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(cx, cy, x2, y2);
    ctx.stroke();
  }
}

function glasses(ctx: Ctx, spread: number, y: number, r: number) {
  ctx.strokeStyle = "#4a3428";
  ctx.lineWidth = 2.5;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(side * spread, y, r, 0, TAU);
    ctx.stroke();
  }
  line(ctx, -spread + r, y, spread - r, y);
}

// ---------------------------------------------------------------- men

export function drawMan(ctx: Ctx, p: Pose, look: ManLook) {
  withPose(ctx, p, () => {
    const step = p.step ?? 0;
    ctx.lineCap = "round";

    for (const side of [-1, 1]) {
      limb(ctx, side, 15, -140, Math.sin(step) * 0.3, () => {
        ctx.fillStyle = look.pants;
        ctx.beginPath();
        ctx.roundRect(-11, 0, 22, 130, 10);
        ctx.fill();
        ctx.fillStyle = "#3b2a20";
        ellipse(ctx, side * 5, 132, 16, 8);
      });
    }

    const shirt = ctx.createLinearGradient(-42, 0, 42, 0);
    shirt.addColorStop(0, look.shirt[0]);
    shirt.addColorStop(1, look.shirt[1]);
    ctx.fillStyle = shirt;
    ctx.beginPath();
    ctx.roundRect(-42, -255, 84, 125, [22, 22, 10, 10]);
    ctx.fill();
    ctx.fillStyle = look.collar;
    triangle(ctx, -20, -257, 0, -236, 0, -257);
    triangle(ctx, 20, -257, 0, -236, 0, -257);
    ctx.fillStyle = "#ffffff";
    for (const y of [-222, -198, -174]) circle(ctx, 0, y, 3);
    ctx.fillStyle = "#3b2a20";
    ctx.fillRect(-41, -142, 82, 10);

    for (const [side, raise] of [
      [-1, p.armL ?? 0.12],
      [1, p.armR ?? 0.12],
    ]) {
      limb(ctx, side, 40, -245, Math.min(raise, 2.9), () => {
        ctx.strokeStyle = SKIN;
        ctx.lineWidth = 13;
        line(ctx, 0, 0, 0, 96);
        ctx.strokeStyle = look.sleeve;
        ctx.lineWidth = 21;
        line(ctx, 0, 0, 0, 42);
        ctx.fillStyle = SKIN;
        circle(ctx, 0, 100, 10);
      });
    }

    ctx.fillStyle = SKIN;
    ctx.fillRect(-9, -275, 18, 22);
    for (const side of [-1, 1]) ellipse(ctx, side * 40, -302, 7, 10);
    circle(ctx, 0, -305, 40);

    ctx.fillStyle = look.hair;
    ctx.beginPath();
    if (look.hairStyle === "receding") {
      // A thin band on top and tufts over the ears.
      ctx.arc(0, -305, 43, Math.PI * 1.05, Math.PI * 1.95);
      ctx.lineTo(38, -320);
      ctx.quadraticCurveTo(0, -340, -38, -320);
      ctx.closePath();
      ctx.fill();
      for (const side of [-1, 1]) ellipse(ctx, side * 39, -310, 8, 15);
      if (look.greying) {
        greyStrands(ctx, [
          [-37, -322, -42, -312, -38, -298],
          [37, -322, 42, -312, 38, -298],
          [-22, -331, -12, -337, -2, -334],
          [10, -334, 20, -335, 28, -328],
        ]);
      }
    } else {
      ctx.arc(0, -305, 43, Math.PI * 1.02, Math.PI * 1.98);
      ctx.lineTo(40, -312);
      if (look.hairStyle === "quiff") {
        ctx.quadraticCurveTo(22, -356, -12, -340);
        ctx.quadraticCurveTo(-34, -330, -41, -296);
      } else {
        ctx.quadraticCurveTo(12, -334, -18, -320);
        ctx.quadraticCurveTo(-34, -314, -41, -296);
      }
      ctx.closePath();
      ctx.fill();
      if (look.greying) {
        greyStrands(ctx, [
          [-30, -330, -18, -341, -4, -340],
          [8, -338, 20, -337, 32, -326],
          [-40, -316, -43, -306, -41, -298],
        ]);
      }
    }

    eyes(ctx, 15, -300, 5, 6.5, p.blink);
    ctx.strokeStyle = look.hair;
    ctx.lineWidth = 4;
    line(ctx, -23, -315, -9, -317);
    line(ctx, 9, -317, 23, -315);
    if (look.glasses) glasses(ctx, 15, -300, 11);
    cheeks(ctx, 25, -286, 7);
    if (look.mustache && !p.pucker) {
      ctx.fillStyle = look.hair;
      ellipse(ctx, -8, -289, 9, 4, -0.2);
      ellipse(ctx, 8, -289, 9, 4, 0.2);
    }
    face(ctx, p, -281, 1, look.smileLines);

    if (look.hat) {
      ctx.save();
      ctx.translate(10, -343);
      ctx.rotate(0.2);
      ctx.fillStyle = "#ff6b6b";
      triangle(ctx, -23, 0, 23, 0, 0, -58);
      ctx.fillStyle = "#ffd166";
      triangle(ctx, -15, -20, 15, -20, 0, -58);
      ctx.fillStyle = "#ff6b6b";
      triangle(ctx, -8, -38, 8, -38, 0, -58);
      ctx.fillStyle = "#ffffff";
      circle(ctx, 0, -60, 8);
      ctx.restore();
    }
  });
}

// ---------------------------------------------------------------- women

// A ring of curls around the head, with a soft shine so dark hair still reads
// as curls; with `greying`, every third curl gets a white strand instead.
function curls(ctx: Ctx, color: string, from: number, to: number, greying?: boolean) {
  for (let k = 0; k <= 9; k++) {
    const a = Math.PI * (from + ((to - from) * k) / 9);
    const x = Math.cos(a) * 36;
    const y = -296 + Math.sin(a) * 36;
    ctx.fillStyle = color;
    circle(ctx, x, y, 13);
    const grey = greying && k % 3 === 1;
    ctx.strokeStyle = grey ? GREY : "rgba(255, 255, 255, 0.18)";
    ctx.lineWidth = grey ? 2.5 : 2;
    ctx.beginPath();
    ctx.arc(x, y, 8, Math.PI * (grey ? 1.0 : 1.1), Math.PI * (grey ? 1.75 : 1.6));
    ctx.stroke();
  }
}

// `carry` draws someone held in her arms, between her body and her arms.
export function drawWoman(ctx: Ctx, p: Pose, look: WomanLook, carry?: () => void) {
  withPose(ctx, p, () => {
    const step = p.step ?? 0;
    const sway = (p.sway ?? 0) * 10;
    ctx.lineCap = "round";

    for (const side of [-1, 1]) {
      limb(ctx, side, 13, -130, Math.sin(step) * 0.3, () => {
        ctx.fillStyle = SKIN;
        ctx.beginPath();
        ctx.roundRect(-7, 0, 14, 124, 7);
        ctx.fill();
        ctx.fillStyle = "#e9c46a";
        ellipse(ctx, side * 3, 127, 12, 6);
      });
    }

    ctx.fillStyle = look.hair;
    if (look.hairStyle === "long") {
      ctx.beginPath();
      ctx.moveTo(-40, -298);
      ctx.quadraticCurveTo(-58, -235, -46 + sway * 0.4, -175);
      ctx.quadraticCurveTo(0, -165, 46 + sway * 0.4, -175);
      ctx.quadraticCurveTo(58, -235, 40, -298);
      ctx.arc(0, -296, 40, 0, Math.PI, true);
      ctx.fill();
    } else if (look.hairStyle === "ponytail") {
      ellipse(ctx, 44 + sway * 0.5, -280, 16, 42, 0.25 + sway * 0.02);
    } else {
      // Shoulder-length curls behind the head.
      ellipse(ctx, 0, -282, 50, 46);
      for (let k = 0; k <= 8; k++) {
        const a = Math.PI * (k / 8);
        circle(ctx, Math.cos(a) * 48 + sway * 0.3, -276 + Math.sin(a) * 36, 13);
      }
      if (look.greying) {
        greyStrands(ctx, [
          [-56, -262, -50, -250, -40, -246],
          [56, -262, 50, -250, 40, -246],
        ]);
        ctx.fillStyle = look.hair;
      }
    }

    // Dress: fitted bodice and a full skirt with a scalloped hem.
    const fabric = ctx.createLinearGradient(-70, 0, 70, 0);
    fabric.addColorStop(0, look.dress[0]);
    fabric.addColorStop(0.45, look.dress[1]);
    fabric.addColorStop(1, look.dress[2]);
    ctx.fillStyle = fabric;
    ctx.strokeStyle = look.outline;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-31, -255, 62, 92, [18, 18, 6, 6]);
    ctx.fill();
    ctx.stroke();
    const hem = -50;
    ctx.beginPath();
    ctx.moveTo(-30, -172);
    ctx.lineTo(30, -172);
    ctx.quadraticCurveTo(52, -112, 80 + sway, hem);
    for (let k = 6; k > 0; k--) {
      const x = -80 + sway + ((k - 1) * 160) / 6;
      ctx.quadraticCurveTo(x + 160 / 12, hem + 14, x, hem);
    }
    ctx.quadraticCurveTo(-52, -112, -30, -172);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(120, 100, 80, 0.25)";
    for (const k of [-0.55, -0.2, 0.2, 0.55]) {
      line(ctx, k * 40, -165, k * 115 + sway, hem + 4);
    }
    ctx.fillStyle = "rgba(120, 100, 80, 0.18)";
    for (let k = 0; k < 6; k++) circle(ctx, -67 + sway + k * 26.7, hem + 1, 2.5);
    ctx.fillStyle = look.sash;
    ctx.beginPath();
    ctx.roundRect(-32, -178, 64, 11, 5);
    ctx.fill();
    ellipse(ctx, 22, -172, 9, 6, 0.5);
    ellipse(ctx, 34, -168, 9, 6, -0.4);

    const arms = () => {
      for (const [side, raise] of [
        [-1, p.armL ?? 0.15],
        [1, p.armR ?? 0.15],
      ]) {
        limb(ctx, side, 32, -245, Math.min(raise, 2.9), () => {
          ctx.strokeStyle = SKIN;
          ctx.lineWidth = 11;
          line(ctx, 0, 0, 0, 90);
          ctx.fillStyle = SKIN;
          circle(ctx, 0, 94, 8);
        });
      }
      // Puffed sleeves
      ctx.fillStyle = look.dress[1];
      ctx.strokeStyle = look.outline;
      ctx.lineWidth = 2;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(side * 33, -244, 15, 12, 0, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
    };
    // A carried child goes in front of her hair, with her arms around them.
    if (!carry) arms();

    ctx.fillStyle = SKIN;
    ctx.fillRect(-8, -266, 16, 16);
    circle(ctx, 0, -293, 36);

    if (look.hairStyle === "curly") {
      curls(ctx, look.hair, 0.9, 2.1, look.greying);
      // Curls framing the face down to the shoulders.
      for (const side of [-1, 1]) {
        circle(ctx, side * 42, -270, 12);
        circle(ctx, side * 44 + sway * 0.3, -252, 11);
      }
      ctx.fillStyle = look.hair;
      ctx.beginPath();
      ctx.arc(0, -296, 38, Math.PI * 1.1, Math.PI * 1.9);
      ctx.quadraticCurveTo(0, -310, -30, -318);
      ctx.fill();
      if (look.greying) {
        greyStrands(ctx, [
          [-22, -323, -10, -331, 4, -327],
          [10, -328, 22, -327, 28, -318],
          [-44, -262, -47, -254, -42, -246],
        ]);
      }
    } else {
      // Side-swept bangs.
      ctx.fillStyle = look.hair;
      ctx.beginPath();
      ctx.moveTo(-39, -288);
      ctx.arc(0, -296, 40, Math.PI + 0.2, -0.13);
      ctx.lineTo(37, -282);
      ctx.quadraticCurveTo(24, -320, -10, -314);
      ctx.quadraticCurveTo(-30, -308, -39, -288);
      ctx.closePath();
      ctx.fill();
    }
    if (look.hairStyle === "long") {
      ctx.strokeStyle = look.hair;
      ctx.lineWidth = 12;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(side * 35, -292);
        ctx.quadraticCurveTo(side * 44, -255, side * 40 + sway * 0.3, -212);
        ctx.stroke();
      }
    }
    if (look.clip === "sunflower") sunflowerHead(ctx, 28, -324, 13, 0.3);
    else if (look.clip) blossom(ctx, 30, -322, 14, look.clip);
    if (look.crown) {
      ["#ff8fab", "#ffffff", "#ffd166", "#c77dff", "#ff8fab", "#ffffff", "#ffd166"].forEach((color, k) => {
        const a = Math.PI * (1.12 + k * 0.127);
        blossom(ctx, Math.cos(a) * 41, -298 + Math.sin(a) * 41, 11, color, k);
      });
    }

    eyes(ctx, 14, -289, 5, 6.5, p.blink);
    if (!p.blink) {
      ctx.strokeStyle = "#2a1a12";
      ctx.lineWidth = 2;
      for (const side of [-1, 1]) line(ctx, side * 19, -295, side * 24, -299);
    }
    if (look.glasses) glasses(ctx, 14, -289, 10);
    cheeks(ctx, 22, -276, 7);
    face(ctx, p, -270, 0.85, look.smileLines);

    if (carry) {
      carry();
      arms();
    }
  });
}

// ---------------------------------------------------------------- Nava

export function drawToddler(ctx: Ctx, p: Pose) {
  withPose(ctx, p, () => {
    const step = p.step ?? 0;
    ctx.lineCap = "round";

    for (const side of [-1, 1]) {
      limb(ctx, side, 11, -42, Math.sin(step) * 0.3, () => {
        ctx.fillStyle = SKIN;
        ctx.beginPath();
        ctx.roundRect(-8, 0, 16, 36, 8);
        ctx.fill();
        ctx.fillStyle = "#ff7b54";
        ellipse(ctx, side * 3, 38, 12, 7);
      });
    }

    // Tee with denim shortalls.
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(-26, -102, 52, 56, 20);
    ctx.fill();
    ctx.fillStyle = "#4d7cc7";
    ctx.beginPath();
    ctx.roundRect(-27, -80, 54, 42, [8, 8, 20, 20]);
    ctx.fill();
    ctx.strokeStyle = "#4d7cc7";
    ctx.lineWidth = 6;
    line(ctx, -15, -80, -12, -100);
    line(ctx, 15, -80, 12, -100);
    ctx.fillStyle = "#ffd166";
    circle(ctx, -14, -78, 3.5);
    circle(ctx, 14, -78, 3.5);
    sunflowerHead(ctx, 0, -60, 9);

    for (const [side, raise] of [
      [-1, p.armL ?? 0.3],
      [1, p.armR ?? 0.3],
    ]) {
      limb(ctx, side, 24, -95, Math.min(raise, 2.9), () => {
        ctx.strokeStyle = SKIN;
        ctx.lineWidth = 10;
        line(ctx, 0, 0, 0, 34);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 14;
        line(ctx, 0, 0, 0, 10);
        ctx.fillStyle = SKIN;
        circle(ctx, 0, 37, 7);
      });
    }

    // A big toddler head with a wisp of hair.
    ctx.fillStyle = SKIN;
    for (const side of [-1, 1]) ellipse(ctx, side * 37, -133, 6, 9);
    circle(ctx, 0, -135, 38);
    ctx.fillStyle = "#21150f";
    ctx.beginPath();
    ctx.moveTo(-32, -152);
    ctx.quadraticCurveTo(0, -186, 32, -152);
    ctx.quadraticCurveTo(14, -162, 0, -158);
    ctx.quadraticCurveTo(-14, -162, -32, -152);
    ctx.fill();
    ctx.strokeStyle = "#21150f";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(3, -176, 6, Math.PI * 0.6, Math.PI * 2.1);
    ctx.stroke();

    eyes(ctx, 14, -132, 6, 7.5, p.blink);
    cheeks(ctx, 24, -117, 8);
    face(ctx, p, -112, 0.7);
  });
}
