import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import SiteFooter from "./_components/site-footer";
import SiteHeader from "./_components/site-header";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
});

export const metadata: Metadata = {
  title: "SolarSkill Academy | อบรมติดตั้งระบบโซลาร์เซลล์",
  description:
    "สถาบันอบรมการติดตั้งระบบผลิตไฟฟ้าพลังงานแสงอาทิตย์ ฝึกปฏิบัติจริง พร้อมใบรับรองหลังจบหลักสูตร",
};

export default function SolarLayout({ children }: LayoutProps<"/solar">) {
  return (
    <div
      className={`${notoSansThai.className} flex flex-1 flex-col bg-white text-slate-800`}
    >
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
