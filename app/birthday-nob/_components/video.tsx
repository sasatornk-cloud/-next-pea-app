"use client";

import { BirthdayVideo } from "@/app/_birthday/birthday-video";
import { CUES, drawScene } from "./scene";

export function NobBirthdayVideo({ fontFamily, className }: { fontFamily: string; className?: string }) {
  return (
    <BirthdayVideo
      drawScene={drawScene}
      cues={CUES}
      label="วิดีโอ: แม่หยกในชุดกระโปรงสีขาวกับน้องนาวาร้องเพลงสุขสันต์วันเกิดให้พ่อน๊อบ แล้วพ่อน๊อบเป่าเค้กกลางทุ่งทานตะวัน"
      fileName="happy-birthday-por-nob"
      fontFamily={fontFamily}
      className={className}
    />
  );
}
