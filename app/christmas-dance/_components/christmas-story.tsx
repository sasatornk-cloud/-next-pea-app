"use client";

import { useEffect, useRef } from "react";
import { DURATION, H, W, drawStory } from "./scene";

// Render at 1080p; the story is laid out in 1280x720 design units.
const PIXEL_SCALE = 1.5;

export function ChristmasStory({
  fontFamily,
  className,
}: {
  fontFamily: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const restartRef = useRef(false);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    let frame = 0;
    let start: number | null = null;
    let cancelled = false;
    const loop = (time: number) => {
      if (start === null || restartRef.current) {
        start = time;
        restartRef.current = false;
      }
      drawStory(ctx, ((time - start) / 1000) % DURATION, fontFamily);
      frame = requestAnimationFrame(loop);
    };
    // Captions are drawn on the canvas, so wait for the Thai font first.
    document.fonts.load(`700 40px ${fontFamily}`).then(() => {
      if (!cancelled) frame = requestAnimationFrame(loop);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [fontFamily]);

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        width={W * PIXEL_SCALE}
        height={H * PIXEL_SCALE}
        role="img"
        aria-label="นิทาน: เด็กผู้หญิงผมยาวเต้นรำกับแกะน้อยหน้าต้นคริสต์มาส"
        className="aspect-video w-full rounded-2xl bg-[#0a1640] shadow-2xl"
      />
      <button
        type="button"
        onClick={() => (restartRef.current = true)}
        className="mx-auto mt-4 block rounded-full bg-amber-300 px-6 py-2 font-bold text-[#1d2b53] hover:bg-amber-200"
      >
        เล่นใหม่
      </button>
    </div>
  );
}
