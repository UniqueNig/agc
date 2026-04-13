"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ThemeToggle from "@/src/components/ui/ThemeToggle";


type Stage = 1 | 2 | 3 | 4;

interface Row {
  rank: number;
  init: string;
  name: string;
  votes: number;
  pct: number;
  trend: "up" | "dn" | null;
  eliminated?: boolean;
}

const ROWS: Row[] = [
  { rank: 1, init: "GA", name: "Grace Adeyemi", votes: 3241, pct: 100, trend: "up" },
  { rank: 2, init: "SO", name: "Solomon Obi", votes: 2890, pct: 89, trend: "up" },
  { rank: 3, init: "FN", name: "Faith Nwosu", votes: 2615, pct: 81, trend: "dn" },
  { rank: 4, init: "EB", name: "Emmanuel Bello", votes: 2430, pct: 75, trend: "up" },
  { rank: 5, init: "MA", name: "Miriam Afolabi", votes: 2198, pct: 68, trend: "up" },
  { rank: 6, init: "DO", name: "David Okafor", votes: 1987, pct: 61, trend: "dn" },
  { rank: 7, init: "PE", name: "Praise Eze", votes: 1745, pct: 54, trend: "up" },
  { rank: 8, init: "JA", name: "Joy Adeleke", votes: 1600, pct: 49, trend: "dn" },
  { rank: 9, init: "BO", name: "Blessed Okeke", votes: 1450, pct: 45, trend: "up" },
  { rank: 10, init: "HF", name: "Hope Fashola", votes: 1320, pct: 41, trend: "dn" },
  { rank: 11, init: "ME", name: "Mercy Adeyinka", votes: 1200, pct: 37, trend: "dn" },
  { rank: 12, init: "VE", name: "Victor Eze", votes: 1050, pct: 32, trend: "up" },
  { rank: 13, init: "RO", name: "Ruth Olawale", votes: 950, pct: 29, trend: "dn" },
  { rank: 14, init: "CM", name: "Caleb Martins", votes: 820, pct: 25, trend: "dn" },
  { rank: 15, init: "ES", name: "Esther Balogun", votes: 700, pct: 22, trend: "up" },
  { rank: 16, init: "PO", name: "Paul Onuoha", votes: 600, pct: 19, trend: "dn" },
  { rank: 17, init: "AO", name: "Abigail Otu", votes: 490, pct: 15, trend: null, eliminated: true },
  { rank: 18, init: "JO", name: "Joshua Adeyemi", votes: 400, pct: 12, trend: null, eliminated: true },
];

const GRADS = [
  "from-purple-900/40 to-purple-950/70",
  "from-yellow-900/25 to-yellow-950/50",
  "from-blue-900/40 to-blue-950/70",
  "from-rose-900/35 to-rose-950/65",
  "from-emerald-900/35 to-emerald-950/65",
];



export default function LeaderboardPage() {
  const [activeStage, setActiveStage] = useState<Stage>(3);
  const [live, setLive] = useState(true);

  // Blink live dot
  useEffect(() => {
    const t = setInterval(() => setLive((v) => !v), 900);
    return () => clearInterval(t);
  }, []);

  const top3 = ROWS.slice(0, 3);
  const rest = ROWS.slice(3);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0a0414] text-stone-900 dark:text-stone-100 transition-colors duration-300">

      {/* NAV */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-yellow-600/20 dark:border-yellow-500/20 bg-stone-50/90 dark:bg-[#0a0414]/90 backdrop-blur-md">
        <Link href="/" className="font-serif text-lg font-bold text-yellow-600 dark:text-yellow-400">
          GOSPEL<span className="text-stone-900 dark:text-stone-100">AGC</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/contestants"
            className="bg-yellow-500 dark:bg-yellow-400 text-stone-900 text-sm font-medium px-5 py-2 rounded-full hover:opacity-90 transition-opacity"
          >
            Vote Now
          </Link>
        </div>
      </nav>

      {/* HEADER */}
      <div className="px-6 pt-8 pb-4 border-b border-stone-200 dark:border-white/[0.07] flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">Leaderboard</h1>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`inline-block w-2 h-2 rounded-full bg-emerald-500 transition-opacity duration-500 ${live ? "opacity-100" : "opacity-20"}`} />
            <span className="text-sm text-stone-400 dark:text-stone-500">Live · Updated every 60s</span>
          </div>
        </div>
        <span className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 text-xs uppercase tracking-widest px-3 py-1.5 rounded-full">
          Stage 3 · Semi-Finals
        </span>
      </div>

      {/* PODIUM */}
      <div className="px-6 pt-10 pb-6 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(120,40,200,0.1)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(100,30,150,0.25)_0%,transparent_70%)]">
        <div className="text-[11px] uppercase tracking-[0.2em] text-yellow-600 dark:text-yellow-400 text-center mb-6">Top Performers</div>
        <div className="flex justify-center items-end max-w-lg mx-auto mb-8">
          {[top3[1], top3[0], top3[2]].map((p, displayIdx) => {
            const isFirst = p.rank === 1;
            const isSecond = p.rank === 2;
            const badgeColor = isFirst ? "bg-yellow-500 text-stone-900" : isSecond ? "bg-stone-400 text-stone-900" : "bg-amber-700 text-white";
            const avatarBorder = isFirst ? "border-yellow-500/50 bg-yellow-500/15 text-yellow-600 dark:text-yellow-400" : isSecond ? "border-stone-400/30 bg-stone-300/20 dark:bg-stone-600/20 text-stone-500 dark:text-stone-400" : "border-amber-700/30 bg-amber-800/15 text-amber-700 dark:text-amber-600";
            return (
              <div
                key={p.rank}
                className={`relative text-center px-5 pt-8 pb-4 rounded-t-2xl border flex-1 max-w-[160px] ${
                  isFirst
                    ? "bg-yellow-50 dark:bg-yellow-500/[0.07] border-yellow-400/40 dark:border-yellow-500/25 min-h-[170px] z-10"
                    : isSecond
                    ? "bg-stone-100 dark:bg-white/[0.04] border-stone-200 dark:border-white/[0.08] min-h-[130px]"
                    : "bg-stone-100/70 dark:bg-white/[0.03] border-stone-200 dark:border-white/[0.06] min-h-[110px]"
                }`}
              >
                <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full text-[10px] font-medium flex items-center justify-center ${badgeColor}`}>
                  {p.rank}
                </div>
                {isFirst && <div className="text-xl mb-2 leading-none">♛</div>}
                <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center font-serif text-base font-bold border ${avatarBorder}`}>
                  {p.init}
                </div>
                <div className="text-sm font-medium text-stone-900 dark:text-stone-100 leading-tight">{p.name}</div>
                <div className="text-xs text-stone-400 dark:text-stone-500 mt-1">{p.votes.toLocaleString()} votes</div>
              </div>
            );
          })}
        </div>

        {/* Stage tabs */}
        <div className="flex justify-center gap-2 flex-wrap">
          {([1, 2, 3, 4] as Stage[]).map((s) => (
            <button
              key={s}
              onClick={() => s !== 4 && setActiveStage(s)}
              className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                s === 4
                  ? "border-stone-200 dark:border-white/[0.07] text-stone-300 dark:text-stone-600 cursor-not-allowed"
                  : activeStage === s
                  ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-600 dark:text-yellow-400"
                  : "border-stone-200 dark:border-white/[0.1] text-stone-500 dark:text-stone-400 hover:border-stone-300 dark:hover:border-white/20"
              }`}
            >
              {s === 4 ? "Finals (soon)" : `Stage ${s}`}
            </button>
          ))}
        </div>
      </div>

      {/* LIST */}
      <div className="max-w-2xl mx-auto px-6 pb-16">
        <div className="flex gap-4 px-5 pb-2 text-[11px] uppercase tracking-[0.08em] text-stone-400 dark:text-stone-600">
          <span className="w-6 text-center">#</span>
          <span className="w-8" />
          <span className="flex-1">Contestant</span>
          <span className="w-28 text-right">Progress</span>
          <span className="min-w-[80px] text-right">Votes</span>
        </div>
        <div className="flex flex-col gap-2">
          {rest.map((row, i) => (
            <div
              key={row.rank}
              className={`flex items-center gap-4 px-5 py-3 rounded-xl border transition-colors ${
                row.eliminated
                  ? "opacity-50 bg-stone-100/50 dark:bg-white/[0.02] border-stone-100 dark:border-white/[0.04]"
                  : "bg-stone-100 dark:bg-white/[0.03] border-stone-200 dark:border-white/[0.06] hover:bg-stone-200/70 dark:hover:bg-white/[0.06]"
              }`}
            >
              <div className="w-6 text-sm text-stone-400 dark:text-stone-500 font-medium text-center">{row.rank}</div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-serif text-xs font-bold bg-gradient-to-br ${GRADS[i % GRADS.length]} text-yellow-500/70 dark:text-yellow-400/60 flex-shrink-0`}>
                {row.init}
              </div>
              <div className="flex-1 text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                {row.name}
                {row.eliminated && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-100 dark:bg-red-500/10 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-500/25">
                    Out
                  </span>
                )}
              </div>
              <div className="w-28 h-1 bg-stone-200 dark:bg-white/[0.07] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${row.eliminated ? "bg-red-400/50" : "bg-yellow-500 dark:bg-yellow-400"}`}
                  style={{ width: `${row.pct}%` }}
                />
              </div>
              <div className="flex items-center gap-1.5 min-w-[80px] justify-end">
                {row.trend === "up" && <span className="text-emerald-500 text-xs">↑</span>}
                {row.trend === "dn" && <span className="text-red-400 text-xs">↓</span>}
                <span className="text-xs text-stone-400 dark:text-stone-500">{row.votes.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}