import type { CSSProperties } from "react";

// 5x7 dot-matrix letters; every "X" becomes a flower.
const LETTERS: Record<string, string[]> = {
  A: [".XXX.", "X...X", "X...X", "XXXXX", "X...X", "X...X", "X...X"],
  K: ["X...X", "X..X.", "X.X..", "XX...", "X.X..", "X..X.", "X...X"],
  N: ["X...X", "X...X", "XX..X", "X.X.X", "X..XX", "X...X", "X...X"],
  O: [".XXX.", "X...X", "X...X", "X...X", "X...X", "X...X", ".XXX."],
  P: ["XXXX.", "X...X", "X...X", "XXXX.", "X....", "X....", "X...."],
  V: ["X...X", "X...X", "X...X", "X...X", "X...X", ".X.X.", "..X.."],
  Y: ["X...X", "X...X", ".X.X.", "..X..", "..X..", "..X..", "..X.."],
};

type Kind = "mixed" | "sunflower" | "rose";

// `letters` is the flower used for the word; `border` fills the empty cells
// touching the word.
const LINES: { word: string; letters: Kind; border?: Kind }[] = [
  { word: "YOK", letters: "mixed" },
  { word: "NOP", letters: "sunflower", border: "rose" },
  { word: "NAVA", letters: "mixed" },
];

const FLOWER_COLORS = [
  { petal: "#f472b6", tip: "#fce7f3", center: "#facc15" }, // pink
  { petal: "#e11d48", tip: "#fda4af", center: "#fde047" }, // red
  { petal: "#facc15", tip: "#fef9c3", center: "#92400e" }, // yellow
  { petal: "#e7e5e4", tip: "#ffffff", center: "#eab308" }, // white
  { petal: "#a78bfa", tip: "#ede9fe", center: "#fde68a" }, // lavender
  { petal: "#fb923c", tip: "#ffedd5", center: "#fef08a" }, // peach
];

const CELL = 28;
// Flowers were designed for a 36px grid; shrink them to fit the cell.
const FLOWER_SCALE = CELL / 36;
const KIND_SCALE: Record<Kind, number> = { mixed: 1, sunflower: 1.2, rose: 0.8 };
const LINE_GAP_ROWS = 3;
const WIDTH = 720;
const TOP = 40;
const LETTERS_BOTTOM =
  TOP + (LINES.length * 7 + (LINES.length - 1) * LINE_GAP_ROWS) * CELL;
const CX = WIDTH / 2;
const WRAP_TOP = LETTERS_BOTTOM + 25;
const WRAP_BOTTOM = LETTERS_BOTTOM + 230;
const GATHER = { x: CX, y: LETTERS_BOTTOM + 210 };
const HEIGHT = LETTERS_BOTTOM + 270;

// Deterministic pseudo-random in [0, 1) so every render looks the same.
function rand(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const FLOWERS = (() => {
  const flowers: { x: number; y: number; kind: Kind }[] = [];
  LINES.forEach(({ word, letters, border }, line) => {
    const cols = word.length * 5 + (word.length - 1);
    const left = (WIDTH - cols * CELL) / 2 + CELL / 2;
    const top = TOP + CELL / 2 + line * (7 + LINE_GAP_ROWS) * CELL;
    const filled = new Set<string>();
    [...word].forEach((letter, l) => {
      LETTERS[letter].forEach((row, r) => {
        [...row].forEach((cell, c) => {
          if (cell === "X") filled.add(`${l * 6 + c},${r}`);
        });
      });
    });
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= cols; c++) {
        const x = left + c * CELL;
        const y = top + r * CELL;
        if (filled.has(`${c},${r}`)) {
          flowers.push({ x, y, kind: letters });
        } else if (border) {
          const touchesWord = [-1, 0, 1].some((dr) =>
            [-1, 0, 1].some((dc) => filled.has(`${c + dc},${r + dr}`)),
          );
          if (touchesWord) flowers.push({ x, y, kind: border });
        }
      }
    }
  });
  return flowers.map((f, i) => ({
    ...f,
    color: FLOWER_COLORS[Math.floor(rand(i, 1) * FLOWER_COLORS.length)],
    spin: rand(i, 2) * 360,
    scale: (0.9 + rand(i, 3) * 0.25) * FLOWER_SCALE * KIND_SCALE[f.kind],
    // Border roses sit a little behind the word so it stands out.
    z: rand(i, 4) * 20 - (f.kind === "rose" ? 14 : 6),
  }));
})();

const LEAVES = [
  { dx: -150, dy: 2, angle: -62 },
  { dx: -105, dy: -8, angle: -38 },
  { dx: -50, dy: -12, angle: -14 },
  { dx: 50, dy: -12, angle: 14 },
  { dx: 105, dy: -8, angle: 38 },
  { dx: 150, dy: 2, angle: 62 },
];

const ROUND_PETAL = "50% 50% 45% 45% / 65% 65% 35% 35%";

// A ring of petals radiating from the flower center, each tilted toward the
// viewer by `tilt` degrees.
function PetalRing({
  count,
  width,
  height,
  tilt,
  z = 0,
  offset = 0,
  background,
  radius = ROUND_PETAL,
  shadow = "inset 0 -2px 4px rgb(0 0 0 / 0.15)",
}: {
  count: number;
  width: number;
  height: number;
  tilt: number;
  z?: number;
  offset?: number;
  background: string;
  radius?: string;
  shadow?: string;
}) {
  return Array.from({ length: count }, (_, k) => (
    <span
      key={k}
      className="absolute top-1/2 left-1/2"
      style={{
        width,
        height,
        marginLeft: -width / 2,
        marginTop: -height,
        transformOrigin: "50% 100%",
        transform: `translateZ(${z}px) rotate(${offset + (k * 360) / count}deg) rotateX(${-tilt}deg)`,
        borderRadius: radius,
        background,
        boxShadow: shadow,
      }}
    />
  ));
}

function Center({
  size,
  z,
  background,
}: {
  size: number;
  z: number;
  background: string;
}) {
  return (
    <span
      className="absolute top-1/2 left-1/2 rounded-full"
      style={{
        width: size,
        height: size,
        margin: -size / 2,
        transform: `translateZ(${z}px)`,
        background,
      }}
    />
  );
}

function MixedBloom({ color }: { color: (typeof FLOWER_COLORS)[number] }) {
  const petals = `radial-gradient(ellipse at 50% 15%, ${color.tip}, ${color.petal} 75%)`;
  return (
    <>
      <PetalRing count={8} width={18} height={24} tilt={28} background={petals} />
      <PetalRing
        count={6}
        width={13}
        height={16}
        tilt={58}
        z={2}
        offset={30}
        background={petals}
      />
      <Center
        size={12}
        z={6}
        background={`radial-gradient(circle at 35% 35%, #fff8, ${color.center} 55%)`}
      />
    </>
  );
}

function Sunflower() {
  const pointed = "50% 50% 50% 50% / 75% 75% 25% 25%";
  return (
    <>
      <PetalRing
        count={10}
        width={9}
        height={24}
        tilt={12}
        radius={pointed}
        background="linear-gradient(to top, #d97706, #fbbf24 55%, #fde047)"
      />
      <PetalRing
        count={10}
        width={9}
        height={20}
        tilt={24}
        z={1}
        offset={18}
        radius={pointed}
        background="linear-gradient(to top, #f59e0b, #facc15 55%, #fef08a)"
      />
      <Center
        size={22}
        z={4}
        background="radial-gradient(circle, #ca8a04 0.8px, transparent 1.4px) 0 0 / 4px 4px, radial-gradient(circle at 40% 35%, #92400e, #3b1a06 80%)"
      />
    </>
  );
}

function WhiteRose() {
  const shadow = "inset 0 -3px 5px rgb(120 113 108 / 0.35)";
  return (
    <>
      <PetalRing
        count={5}
        width={20}
        height={18}
        tilt={38}
        shadow={shadow}
        radius="50% 50% 45% 45% / 55% 55% 45% 45%"
        background="radial-gradient(ellipse at 50% 20%, #ffffff, #e7e5e4 85%)"
      />
      <PetalRing
        count={5}
        width={14}
        height={13}
        tilt={62}
        z={2}
        offset={36}
        shadow={shadow}
        background="radial-gradient(ellipse at 50% 20%, #ffffff, #d6d3d1 90%)"
      />
      <PetalRing
        count={3}
        width={9}
        height={10}
        tilt={78}
        z={4}
        offset={20}
        shadow={shadow}
        background="radial-gradient(ellipse at 50% 20%, #fafaf9, #d6d3d1)"
      />
      <Center
        size={8}
        z={6}
        background="radial-gradient(circle at 40% 35%, #ffffff, #d6d3d1)"
      />
    </>
  );
}

function Flower({ flower }: { flower: (typeof FLOWERS)[number] }) {
  return (
    <div
      className="absolute size-12 transform-3d"
      style={{
        left: flower.x - 24,
        top: flower.y - 24,
        transform: `translateZ(${flower.z}px) rotate(${flower.spin}deg) scale(${flower.scale})`,
      }}
    >
      {flower.kind === "sunflower" ? (
        <Sunflower />
      ) : flower.kind === "rose" ? (
        <WhiteRose />
      ) : (
        <MixedBloom color={flower.color} />
      )}
    </div>
  );
}

export default function Bouquet() {
  const ribbonY = WRAP_BOTTOM - 60;
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 overflow-hidden bg-rose-50 py-12 font-sans dark:bg-zinc-950">
      <h1 className="px-6 text-center text-3xl font-semibold tracking-tight text-rose-900 dark:text-rose-100">
        Bouquet for YOK, NOP &amp; NAVA
      </h1>
      {/* Scaling doesn't shrink the layout box, so negative margins reclaim the space. */}
      <div
        className="my-[calc(var(--h)*-0.275)] shrink-0 scale-[0.45] perspective-[1600px] sm:my-[calc(var(--h)*-0.15)] sm:scale-[0.7] lg:my-[calc(var(--h)*-0.1)] lg:scale-[0.8]"
        style={{ "--h": `${HEIGHT}px` } as CSSProperties}
      >
        <div className="rotate-x-[6deg] transform-3d">
          <div
            className="relative transform-3d motion-safe:animate-bouquet-sway"
            style={{ width: WIDTH, height: HEIGHT }}
          >
            {/* Back wrapping paper */}
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="absolute inset-0 size-full overflow-visible"
              style={{ transform: "translateZ(-50px)" }}
              aria-hidden
            >
              <defs>
                <linearGradient id="paper-back" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fdf2f8" />
                  <stop offset="100%" stopColor="#f9a8d4" />
                </linearGradient>
              </defs>
              <path
                d={`M${CX - 18} ${WRAP_BOTTOM} L14 ${LETTERS_BOTTOM + 10} L0 60 Q30 0 110 -10 Q235 -40 ${CX} -36 Q${WIDTH - 235} -40 ${WIDTH - 110} -10 Q${WIDTH - 30} 0 ${WIDTH} 60 L${WIDTH - 14} ${LETTERS_BOTTOM + 10} L${CX + 18} ${WRAP_BOTTOM} Z`}
                fill="url(#paper-back)"
                stroke="#f472b6"
                strokeWidth={2}
                strokeLinejoin="round"
              />
            </svg>

            {/* Stems and leaves */}
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="absolute inset-0 size-full overflow-visible"
              style={{ transform: "translateZ(-30px)" }}
              aria-hidden
            >
              {FLOWERS.map((f, i) => (
                <path
                  key={i}
                  d={`M${f.x} ${f.y} Q${f.x} ${(f.y + GATHER.y) / 2} ${GATHER.x} ${GATHER.y}`}
                  fill="none"
                  stroke="#4d7c0f"
                  strokeWidth={2}
                  strokeOpacity={0.7}
                />
              ))}
              {[-8, -3, 2, 7].map((dx) => (
                <line
                  key={dx}
                  x1={GATHER.x}
                  y1={GATHER.y}
                  x2={GATHER.x + dx}
                  y2={HEIGHT - 8}
                  stroke="#3f6212"
                  strokeWidth={3}
                  strokeLinecap="round"
                />
              ))}
              {LEAVES.map((leaf, i) => (
                <g
                  key={i}
                  transform={`translate(${CX + leaf.dx} ${WRAP_TOP + leaf.dy}) rotate(${leaf.angle})`}
                >
                  <path
                    d="M0 0 C11 -12 11 -34 0 -48 C-11 -34 -11 -12 0 0 Z"
                    fill="#65a30d"
                  />
                  <path d="M0 0 L0 -44" stroke="#3f6212" strokeWidth={1.5} />
                </g>
              ))}
            </svg>

            {FLOWERS.map((flower, i) => (
              <Flower key={i} flower={flower} />
            ))}

            {/* Front wrapping paper and ribbon */}
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="absolute inset-0 size-full overflow-visible"
              style={{ transform: "translateZ(30px)" }}
              aria-hidden
            >
              <defs>
                <linearGradient id="paper-front" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#b08460" />
                  <stop offset="50%" stopColor="#e2c09c" />
                  <stop offset="100%" stopColor="#a87a55" />
                </linearGradient>
              </defs>
              <path
                d={`M${CX - 155} ${WRAP_TOP} Q${CX} ${WRAP_TOP + 35} ${CX + 155} ${WRAP_TOP} L${CX + 18} ${WRAP_BOTTOM} L${CX - 18} ${WRAP_BOTTOM} Z`}
                fill="url(#paper-front)"
                stroke="#8b5e3c"
                strokeWidth={1.5}
                strokeLinejoin="round"
              />
              <path
                d={`M${CX - 78} ${WRAP_TOP + 12} L${CX - 6} ${WRAP_BOTTOM} M${CX + 78} ${WRAP_TOP + 12} L${CX + 6} ${WRAP_BOTTOM}`}
                stroke="#8b5e3c"
                strokeOpacity={0.4}
                strokeWidth={1.5}
              />
              <g
                transform={`translate(${CX} ${ribbonY})`}
                fill="#e11d48"
                stroke="#9f1239"
                strokeWidth={1.5}
              >
                <path d="M0 0 C-40 -35 -55 30 0 0 Z" />
                <path d="M0 0 C40 -35 55 30 0 0 Z" />
                <path d="M-4 5 L-24 55 L-13 50 L0 7 Z" />
                <path d="M4 5 L24 55 L13 50 L0 7 Z" />
                <circle r={8} />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </main>
  );
}
