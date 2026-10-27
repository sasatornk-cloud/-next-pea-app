"use client";

import { useEffect, useRef, useState } from "react";
import { H, W } from "./draw";
import { type Cues, scheduleSoundtrack } from "./soundtrack";

// Render at 1080p; the video is laid out in 1280x720 design units.
const PIXEL_SCALE = 1.5;
// The first frame shown before playing: the title over the field.
const POSTER_TIME = 2;
// Recording formats in order of preference, with the file extension for each.
const FORMATS = [
  ["video/mp4;codecs=avc1,mp4a.40.2", "mp4"],
  ["video/webm;codecs=vp9,opus", "webm"],
  ["video/webm", "webm"],
] as const;

type Status = "idle" | "playing" | "recording";

// Plays a canvas-drawn birthday video with its synthesized soundtrack, and can
// record both into a downloadable video file.
export function BirthdayVideo({
  drawScene,
  cues,
  label,
  fileName,
  fontFamily,
  className,
}: {
  drawScene: (ctx: CanvasRenderingContext2D, t: number, font: string) => void;
  cues: Cues;
  label: string;
  fileName: string; // without the extension
  fontFamily: string;
  className?: string;
}) {
  const { duration } = cues;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || status !== "idle") return;
    let cancelled = false;
    // Captions are drawn on the canvas, so wait for the Thai font first.
    document.fonts.load(`700 40px ${fontFamily}`).then(() => {
      if (!cancelled) drawScene(ctx, POSTER_TIME, fontFamily);
    });
    return () => {
      cancelled = true;
    };
  }, [drawScene, fontFamily, status]);

  useEffect(() => () => stopRef.current?.(), []);

  async function play(record: boolean) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    stopRef.current?.();
    setError(null);

    const format = record ? FORMATS.find(([type]) => MediaRecorder.isTypeSupported(type)) : undefined;
    if (record && !format) {
      setError("เบราว์เซอร์นี้บันทึกวิดีโอไม่ได้ ลองใช้ Chrome หรือ Edge นะคะ");
      return;
    }

    await document.fonts.load(`700 40px ${fontFamily}`);
    const audio = new AudioContext();
    const out = audio.createGain();
    out.connect(audio.destination);

    let recorder: MediaRecorder | null = null;
    if (format) {
      const [mimeType, extension] = format;
      const sound = audio.createMediaStreamDestination();
      out.connect(sound);
      const stream = new MediaStream([
        ...canvas.captureStream(30).getVideoTracks(),
        ...sound.stream.getAudioTracks(),
      ]);
      const chunks: Blob[] = [];
      recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 });
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const url = URL.createObjectURL(new Blob(chunks, { type: mimeType }));
        const link = document.createElement("a");
        link.href = url;
        link.download = `${fileName}.${extension}`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      };
    }

    // The audio clock drives the picture, so sound and animation stay in sync.
    const start = audio.currentTime + 0.15;
    scheduleSoundtrack(audio, out, start, cues);
    recorder?.start();

    let frame = 0;
    const stop = (finished: boolean) => {
      cancelAnimationFrame(frame);
      if (recorder?.state === "recording") {
        // Stopped early: discard the partial recording instead of downloading it.
        if (!finished) recorder.onstop = null;
        recorder.stop();
      }
      audio.close();
      stopRef.current = null;
      setStatus("idle");
    };
    stopRef.current = () => stop(false);
    const loop = () => {
      const t = Math.max(0, audio.currentTime - start);
      drawScene(ctx, Math.min(t, duration - 0.01), fontFamily);
      if (t >= duration) stop(true);
      else frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    setStatus(record ? "recording" : "playing");
  }

  const button =
    "rounded-full px-6 py-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed";
  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        width={W * PIXEL_SCALE}
        height={H * PIXEL_SCALE}
        role="img"
        aria-label={label}
        className="aspect-video w-full rounded-2xl bg-[#7cc8f5] shadow-2xl"
      />
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        {status === "idle" ? (
          <button
            type="button"
            onClick={() => play(false)}
            className={`${button} bg-amber-300 text-[#5a3200] hover:bg-amber-200`}
          >
            ▶ เล่นวิดีโอ
          </button>
        ) : (
          <button
            type="button"
            onClick={() => stopRef.current?.()}
            className={`${button} bg-amber-300 text-[#5a3200] hover:bg-amber-200`}
          >
            ■ หยุด
          </button>
        )}
        <button
          type="button"
          onClick={() => play(true)}
          disabled={status !== "idle"}
          className={`${button} bg-white text-[#5a3200] hover:bg-amber-50`}
        >
          {status === "recording" ? `กำลังบันทึกวิดีโอ… (${Math.round(duration)} วินาที)` : "⬇ บันทึกเป็นไฟล์วิดีโอ"}
        </button>
      </div>
      {error && <p className="mt-3 text-center text-red-700">{error}</p>}
    </div>
  );
}
