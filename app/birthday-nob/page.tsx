import type { Metadata } from "next";
import { Mali } from "next/font/google";
import { NobBirthdayVideo } from "./_components/video";

const mali = Mali({ subsets: ["thai", "latin"], weight: ["500", "700"] });

export const metadata: Metadata = {
  title: "สุขสันต์วันเกิดพ่อน๊อบ 34 ปี",
  description: "แม่หยกกับน้องนาวาร้องเพลงสุขสันต์วันเกิดให้พ่อน๊อบเป่าเค้กกลางทุ่งทานตะวัน",
};

export default function BirthdayNobPage() {
  return (
    <main
      className={`${mali.className} flex flex-1 flex-col items-center gap-6 bg-[#fff4cc] px-4 py-8`}
    >
      <h1 className="text-center text-3xl font-bold text-[#5a3200]">
        สุขสันต์วันเกิดพ่อน๊อบ 34 ปี 🌻🎂
      </h1>
      <p className="-mt-4 text-center text-lg text-[#8a5a1c]">24 ธันวาคม</p>
      <NobBirthdayVideo fontFamily={mali.style.fontFamily} className="w-full max-w-5xl" />
    </main>
  );
}
