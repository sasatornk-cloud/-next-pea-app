import type { Metadata } from "next";
import { Mali } from "next/font/google";
import { KaewBirthdayVideo } from "./_components/video";

const mali = Mali({ subsets: ["thai", "latin"], weight: ["500", "700"] });

export const metadata: Metadata = {
  title: "สุขสันต์วันเกิดคุณยายแก้ว",
  description: "ลูกหลานร่วมกันร้องเพลงวันเกิดให้คุณยายแก้วเป่าเค้กและกอดกันบนหาดทรายขาวยามเย็น",
};

export default function GrandmaKaewBirthdayPage() {
  return (
    <main
      className={`${mali.className} flex flex-1 flex-col items-center gap-6 bg-[#ffe3d3] px-4 py-8`}
    >
      <h1 className="text-center text-3xl font-bold text-[#5a3200]">สุขสันต์วันเกิดคุณยายแก้ว 🌅🎂</h1>
      <p className="-mt-4 text-center text-lg text-[#8a5a1c]">ณ ชายหาดยามเย็น</p>
      <KaewBirthdayVideo fontFamily={mali.style.fontFamily} className="w-full max-w-5xl" />
    </main>
  );
}
