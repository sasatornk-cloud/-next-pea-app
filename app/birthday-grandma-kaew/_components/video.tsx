"use client";

import { BirthdayVideo } from "@/app/_birthday/birthday-video";
import { CUES, drawScene } from "./scene";

export function KaewBirthdayVideo({ fontFamily, className }: { fontFamily: string; className?: string }) {
  return (
    <BirthdayVideo
      drawScene={drawScene}
      cues={CUES}
      label="วิดีโอ: พ่อน๊อบ แม่หยกอุ้มน้องนาวา คุณตาศักผมสีเทาใส่แว่น และน้าเจ็ม ร่วมกันร้องเพลงวันเกิดให้คุณยายแก้ว แล้วคุณยายเป่าเค้กและกอดทุกคนบนหาดทรายขาวยามเย็น"
      fileName="happy-birthday-khun-yai-kaew"
      fontFamily={fontFamily}
      className={className}
    />
  );
}
