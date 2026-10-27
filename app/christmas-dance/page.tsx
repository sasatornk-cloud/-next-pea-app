import type { Metadata } from "next";
import { Mali } from "next/font/google";
import { ChristmasStory } from "./_components/christmas-story";

const mali = Mali({ subsets: ["thai", "latin"], weight: ["500", "700"] });

export const metadata: Metadata = {
  title: "หนูน้อยกับแกะน้อยในคืนวันคริสต์มาส",
  description: "นิทานเด็ก: เด็กผู้หญิงผมยาวเต้นรำกับแกะน้อยหน้าต้นคริสต์มาส",
};

export default function ChristmasDancePage() {
  return (
    <main
      className={`${mali.className} flex flex-1 flex-col items-center gap-6 bg-[#0a1640] px-4 py-8`}
    >
      <h1 className="text-center text-3xl font-bold text-amber-200">
        หนูน้อยกับแกะน้อยในคืนวันคริสต์มาส
      </h1>
      <ChristmasStory fontFamily={mali.style.fontFamily} className="w-full max-w-5xl" />
    </main>
  );
}
