import type { Metadata } from "next";
import { RoseBall } from "./_components/rose-ball";

export const metadata: Metadata = {
  title: "Rose Ball for NOP",
  description: "A round bouquet of white roses with sunflowers spelling NOP.",
};

export default function RoseBallPage() {
  return (
    <main className="flex flex-1 flex-col items-center gap-2 bg-linear-to-b from-amber-50 to-stone-200 px-4 py-8 font-sans dark:from-zinc-900 dark:to-zinc-950">
      <h1 className="text-center text-3xl font-semibold tracking-tight text-stone-800 dark:text-stone-100">
        Rose Ball for NOP
      </h1>
      <RoseBall className="h-[80vh] min-h-96 w-full max-w-4xl cursor-grab active:cursor-grabbing" />
      <p className="text-sm text-stone-500 dark:text-stone-400">
        Drag to rotate · Scroll to zoom
      </p>
    </main>
  );
}
