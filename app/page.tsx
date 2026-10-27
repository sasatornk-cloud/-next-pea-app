const HEART_PATH =
  "M50 88 C20 65 2 45 2 28 C2 13 14 2 28 2 C38 2 46 8 50 16 C54 8 62 2 72 2 C86 2 98 13 98 28 C98 45 80 65 50 88 Z";

const HEARTS = [
  { name: "Ruby", light: "#ff8a9a", base: "#e11d48", dark: "#881337" },
  { name: "Tangerine", light: "#ffc58a", base: "#f97316", dark: "#9a3412" },
  { name: "Sunflower", light: "#fff3a3", base: "#facc15", dark: "#a16207" },
  { name: "Lime", light: "#d9ff9e", base: "#84cc16", dark: "#3f6212" },
  { name: "Emerald", light: "#9ff5cf", base: "#10b981", dark: "#065f46" },
  { name: "Cyan", light: "#a5f3fc", base: "#06b6d4", dark: "#155e75" },
  { name: "Sapphire", light: "#a5c8ff", base: "#3b82f6", dark: "#1e3a8a" },
  { name: "Violet", light: "#d4c2ff", base: "#8b5cf6", dark: "#4c1d95" },
  { name: "Magenta", light: "#ffb3f0", base: "#d946ef", dark: "#86198f" },
  { name: "Rose Gold", light: "#ffe0d6", base: "#e8a090", dark: "#9c5a4c" },
];

// The heart is extruded by stacking flat SVG layers along the Z axis.
const LAYERS = 14;
const DEPTH = 28;

function Heart3D({
  id,
  light,
  base,
  dark,
  delay,
}: {
  id: string;
  light: string;
  base: string;
  dark: string;
  delay: number;
}) {
  return (
    <div className="perspective-[600px]">
      <div className="rotate-x-[-12deg] transform-3d">
        <div
          className="relative size-32 transform-3d motion-safe:animate-heart-spin"
          style={{ animationDelay: `${delay}s` }}
        >
          {Array.from({ length: LAYERS }, (_, i) => {
            const z = (i / (LAYERS - 1) - 0.5) * DEPTH;
            const isFace = i === 0 || i === LAYERS - 1;
            return (
              <svg
                key={i}
                viewBox="0 0 100 90"
                className="absolute inset-0 size-full"
                style={{ transform: `translateZ(${z}px)` }}
                aria-hidden
              >
                {isFace && (
                  <defs>
                    <radialGradient
                      id={`${id}-${i}`}
                      cx="32%"
                      cy="28%"
                      r="80%"
                    >
                      <stop offset="0%" stopColor="#fff" stopOpacity={0.9} />
                      <stop offset="12%" stopColor={light} />
                      <stop offset="55%" stopColor={base} />
                      <stop offset="100%" stopColor={dark} />
                    </radialGradient>
                  </defs>
                )}
                <path
                  d={HEART_PATH}
                  fill={isFace ? `url(#${id}-${i})` : dark}
                />
              </svg>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-12 bg-zinc-50 px-8 py-16 font-sans dark:bg-black">
      <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
        10 Hearts
      </h1>
      <ul className="grid grid-cols-2 gap-x-12 gap-y-14 sm:grid-cols-3 lg:grid-cols-5">
        {HEARTS.map((heart, i) => (
          <li key={heart.name} className="flex flex-col items-center gap-4">
            <Heart3D
              id={`heart-${i}`}
              light={heart.light}
              base={heart.base}
              dark={heart.dark}
              delay={-i * 0.6}
            />
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              {heart.name}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
