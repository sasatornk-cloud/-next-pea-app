import { type Ctx, H, W, ramp } from "./draw";
import type { Song } from "./song";

const INK = "#5a3200";
const PANEL = "rgba(90, 50, 0, 0.72)";

export function outlinedText(
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
  ctx.strokeStyle = INK;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

export function drawCaption(ctx: Ctx, font: string, lines: readonly string[], alpha: number) {
  const lineHeight = 44;
  const h = lines.length * lineHeight + 26;
  const y = H - 18 - h;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = PANEL;
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

// Karaoke line: the sung part of the lyric turns yellow as the melody goes.
export function drawLyrics(ctx: Ctx, font: string, t: number, song: Song, alpha: number) {
  let current = song.lines[0];
  for (const l of song.lines) if (t >= l.from - 0.3) current = l;
  const y = H - 70;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = PANEL;
  ctx.beginPath();
  ctx.roundRect(190, y - 46, W - 380, 92, 28);
  ctx.fill();
  ctx.font = `700 44px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const w = ctx.measureText(current.text).width;
  const x0 = W / 2 - w / 2;
  ctx.fillStyle = "#fff8e7";
  ctx.fillText(current.text, W / 2, y);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x0, y - 40, w * ramp(t, current.from, current.to), 80);
  ctx.clip();
  ctx.fillStyle = "#ffd166";
  ctx.fillText(current.text, W / 2, y);
  ctx.restore();
  ctx.fillStyle = "#ffd166";
  ctx.fillText("♪", x0 - 40, y);
  ctx.fillText("♪", x0 + w + 40, y);
  ctx.globalAlpha = 1;
}

export function drawBubble(ctx: Ctx, font: string, text: string, x: number, bottom: number, alpha: number) {
  ctx.globalAlpha = alpha;
  ctx.font = `700 26px ${font}`;
  const w = ctx.measureText(text).width + 40;
  const h = 52;
  // Keep the bubble on screen; the tail still points at the speaker.
  const left = Math.min(Math.max(x - w / 2, 12), W - 12 - w);
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(90, 50, 0, 0.35)";
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.roundRect(left, bottom - h, w, h, 24);
  ctx.moveTo(x - 12, bottom - 2);
  ctx.lineTo(x + 12, bottom - 2);
  ctx.lineTo(x, bottom + 18);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = INK;
  ctx.fillText(text, left + w / 2, bottom - h / 2);
  ctx.globalAlpha = 1;
}

// A name tag, with an optional smaller second line.
export function drawLabel(
  ctx: Ctx,
  font: string,
  text: string,
  sub: string,
  x: number,
  bottom: number,
  alpha: number,
) {
  ctx.globalAlpha = alpha;
  ctx.font = `500 17px ${font}`;
  const subWidth = sub ? ctx.measureText(sub).width : 0;
  ctx.font = `700 22px ${font}`;
  const w = Math.max(ctx.measureText(text).width, subWidth) + 28;
  const h = sub ? 58 : 38;
  ctx.fillStyle = "#e0457b";
  ctx.beginPath();
  ctx.roundRect(x - w / 2, bottom - h, w, h, 19);
  ctx.fill();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(text, x, bottom - h + 19);
  if (sub) {
    ctx.font = `500 17px ${font}`;
    ctx.fillText(sub, x, bottom - 16);
  }
  ctx.globalAlpha = 1;
}

// The opening title card: a big greeting, the name and age, and the date.
export function drawTitle(
  ctx: Ctx,
  font: string,
  alpha: number,
  [greeting, name, date]: [string, string, string],
) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(90, 50, 0, 0.6)";
  ctx.beginPath();
  ctx.roundRect(W / 2 - 380, 160, 760, 280, 36);
  ctx.fill();
  outlinedText(ctx, font, greeting, W / 2, 240, 80, "#ffd166");
  outlinedText(ctx, font, name, W / 2, 322, 52, "#ffffff");
  outlinedText(ctx, font, date, W / 2, 390, 38, "#ffe8a3");
  ctx.globalAlpha = 1;
}

// Fades in from black at the start and out to black at the end.
export function drawFade(ctx: Ctx, t: number, duration: number) {
  const black = Math.max(1 - ramp(t, 0, 0.8), ramp(t, duration - 0.8, duration));
  if (black > 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${black})`;
    ctx.fillRect(0, 0, W, H);
  }
}
