import { StitchingLogo } from '@theguild/components';

const nodes = [
  [40, 28],
  [110, 18],
  [180, 32],
  [250, 14],
  [320, 26],
  [390, 16],
  [460, 30],
  [530, 12],
  [600, 24],
  [670, 18],
  [740, 28],
  [810, 14],
  [75, 42],
  [210, 44],
  [355, 40],
  [490, 44],
  [630, 42],
  [760, 40],
] as const;

const edges: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [8, 9],
  [9, 10],
  [10, 11],
  [0, 12],
  [2, 13],
  [4, 14],
  [6, 15],
  [8, 16],
  [10, 17],
  [12, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [16, 17],
];

function NetworkDecoration() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 bottom-0 h-16 w-full text-[#8ebfd0] opacity-70 dark:opacity-40"
      viewBox="0 0 850 56"
      fill="none"
      aria-hidden="true"
    >
      {edges.map(([a, b]) => (
        <line
          key={`${a}-${b}`}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          stroke="currentColor"
          strokeWidth="0.8"
        />
      ))}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 4 === 0 ? 2.4 : 1.6} fill="currentColor" />
      ))}
    </svg>
  );
}

export function HandbookBanner() {
  return (
    <header className="not-prose relative mb-10 overflow-hidden pb-8 pt-1 text-center">
      <h1 className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[1.65rem] font-bold tracking-tight sm:text-4xl">
        <span>Schema Stitching</span>
        <StitchingLogo className="size-9 stroke-none sm:size-11" />
        <span>Handbook</span>
      </h1>
      <p className="mt-3 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400 sm:text-xs">
        Awesome distributed GraphQL services, from top to bottom
      </p>
      <NetworkDecoration />
    </header>
  );
}
