const CONTESTANT_GRADIENTS = [
  "from-purple-900/50 to-purple-950/80",
  "from-yellow-900/30 to-yellow-950/60",
  "from-blue-900/50 to-blue-950/80",
  "from-rose-900/40 to-rose-950/70",
  "from-emerald-900/40 to-emerald-950/70",
];

export const getContestantInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const getContestantGradient = (index: number) =>
  CONTESTANT_GRADIENTS[index % CONTESTANT_GRADIENTS.length];

export const getVotePercentage = (value: number, maxValue: number) => {
  if (!maxValue) return 0;
  return Math.max(2, Math.round((value / maxValue) * 100));
};

export const formatStageLabel = (index: number) => `Stage ${index + 1}`;

export const formatCurrency = (value: number) =>
  `\u20A6${value.toLocaleString()}`;
