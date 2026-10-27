export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <a href="#top" className="flex items-center gap-2.5">
      <svg viewBox="0 0 40 40" className="size-10" aria-hidden>
        <circle cx={20} cy={14} r={7} fill="#f59e0b" />
        <g stroke="#f59e0b" strokeWidth={2} strokeLinecap="round">
          <path d="M20 2v3M8 14H5M35 14h-3M11.5 5.5l2 2M28.5 5.5l-2 2" />
        </g>
        <path d="M6 38 10 24h20l4 14Z" fill="#1e3a8a" />
        <path
          d="M8 31h24M20 24v14M15 24l-1.5 14M25 24l1.5 14"
          stroke="#93c5fd"
          strokeWidth={1}
        />
      </svg>
      <span className="leading-tight">
        <span
          className={`block text-lg font-bold ${light ? "text-white" : "text-blue-950"}`}
        >
          SolarSkill Academy
        </span>
        <span
          className={`block text-xs ${light ? "text-blue-200" : "text-slate-500"}`}
        >
          สถาบันอบรมช่างโซลาร์เซลล์
        </span>
      </span>
    </a>
  );
}
