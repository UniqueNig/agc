"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Sun, Moon, ChevronRight } from "lucide-react";
import Footer from "@/src/components/layouts/Footer";
import Navbar from "@/src/components/layouts/Navbar";

const FEATURED = [
  { num: "01", name: "Grace Adeyemi", votes: "3,241", init: "GA" },
  { num: "04", name: "Solomon Obi", votes: "2,890", init: "SO" },
  { num: "07", name: "Faith Nwosu", votes: "2,615", init: "FN" },
  { num: "12", name: "Emmanuel Bello", votes: "2,430", init: "EB" },
  { num: "15", name: "Miriam Afolabi", votes: "2,198", init: "MA" },
  { num: "18", name: "David Okafor", votes: "1,987", init: "DO" },
  { num: "21", name: "Praise Eze", votes: "1,745", init: "PE" },
];

const LEADERBOARD_REST = [
  { rank: 4, name: "Emmanuel Bello", votes: 2430, pct: 75 },
  { rank: 5, name: "Miriam Afolabi", votes: 2198, pct: 68 },
  { rank: 6, name: "David Okafor", votes: 1987, pct: 61 },
  { rank: 7, name: "Praise Eze", votes: 1745, pct: 54 },
];

const CARD_GRADS = [
  "from-purple-900/50 to-purple-950/80",
  "from-yellow-900/30 to-yellow-950/60",
  "from-blue-900/50 to-blue-950/80",
  "from-rose-900/40 to-rose-950/70",
  "from-emerald-900/40 to-emerald-950/70",
];

// function ThemeToggle() {
//   const { theme, setTheme } = useTheme();
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => setMounted(true), []);
//   if (!mounted) return <div className="w-9 h-9" />;
//   return (
//     <button
//       onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
//       className="w-9 h-9 rounded-full border border-yellow-600/30 bg-yellow-500/10 text-yellow-600 dark:border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-400 flex items-center justify-center hover:opacity-75 transition-opacity"
//     >
//       {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
//     </button>
//   );
// }

function Countdown() {
  const [secs, setSecs] = useState(3 * 3600 + 47 * 60 + 21);
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  const Unit = ({ val, label }: { val: string; label: string }) => (
    <div className="text-center">
      <span className="block font-serif text-3xl font-bold text-yellow-500 dark:text-yellow-400 leading-none">
        {val}
      </span>
      <span className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500 mt-1 block">
        {label}
      </span>
    </div>
  );
  return (
    <div className="flex items-center gap-3">
      <Unit val={pad(h)} label="Hours" />
      <span className="text-2xl text-yellow-600/40 -mt-2">:</span>
      <Unit val={pad(m)} label="Mins" />
      <span className="text-2xl text-yellow-600/40 -mt-2">:</span>
      <Unit val={pad(s)} label="Secs" />
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0a0414] text-stone-900 dark:text-stone-100 transition-colors duration-300">
      <Navbar />
      {/* HERO */}
      <section className="relative min-h-[88vh] flex items-center justify-center text-center px-6 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(120,40,200,0.18)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(100,30,150,0.35)_0%,transparent_70%)]" />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-purple-400/10 dark:bg-purple-900/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -right-16 w-72 h-72 rounded-full bg-yellow-400/10 dark:bg-yellow-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-block text-[11px] uppercase tracking-[0.2em] text-yellow-600 dark:text-yellow-400 border border-yellow-600/30 dark:border-yellow-500/30 px-4 py-1.5 rounded-full mb-6">
            Season 1 · Abeokuta, Ogun State
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-black leading-[1.05] mb-3">
            Abeokuta
            <br />
            <span className="text-yellow-500 dark:text-yellow-400">
              Gospel AGC
            </span>
          </h1>
          <p className="text-base text-stone-500 dark:text-stone-400 font-light mb-10">
            Discover. Vote. Celebrate the voices that move heaven.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/contestants"
              className="bg-yellow-500 dark:bg-yellow-400 text-stone-900 font-medium px-8 py-3.5 rounded-full text-[15px] hover:opacity-90 hover:-translate-y-0.5 transition-all"
            >
              Vote Now
            </Link>
            <Link
              href="/leaderboard"
              className="border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-light px-8 py-3.5 rounded-full text-[15px] hover:border-yellow-500 hover:text-yellow-600 dark:hover:border-yellow-500 dark:hover:text-yellow-400 transition-all"
            >
              View Leaderboard
            </Link>
          </div>
          <div className="flex gap-10 justify-center mt-14 flex-wrap">
            {[
              { num: "24", label: "Contestants" },
              { num: "18,450", label: "Votes Cast" },
              { num: "Stage 3", label: "Current Stage" },
            ].map((s, i) => (
              <div key={s.label} className="contents">
                {i > 0 && (
                  <div className="w-px bg-stone-300 dark:bg-stone-700 h-10 mt-1" />
                )}
                <div>
                  <div className="font-serif text-3xl font-bold text-yellow-500 dark:text-yellow-400">
                    {s.num}
                  </div>
                  <div className="text-[11px] uppercase tracking-widest text-stone-400 dark:text-stone-500 mt-1">
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STAGE BANNER */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-purple-100/80 to-yellow-50 dark:from-purple-900/20 dark:to-yellow-900/10 border border-yellow-500/25 rounded-2xl p-6 flex items-center justify-between flex-wrap gap-6">
            <div>
              <span className="inline-block text-[11px] uppercase tracking-[0.15em] text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 rounded-full mb-2">
                Live Now
              </span>
              <div className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                Semi-Finals · Stage 3
              </div>
              <div className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                16 contestants remain · Voting closes Sunday 11:59 PM
              </div>
            </div>
            <Countdown />
          </div>
        </div>
      </section>

      {/* FEATURED CONTESTANTS */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-[11px] uppercase tracking-[0.2em] text-yellow-600 dark:text-yellow-400 mb-2">
            Featured
          </div>
          <div className="flex justify-between items-end flex-wrap gap-4 mb-8">
            <div>
              <div className="w-12 h-0.5 bg-yellow-500 dark:bg-yellow-400 rounded mb-4" />
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-100">
                Meet the Contestants
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400 font-light mt-1">
                24 anointed voices competing for the crown
              </p>
            </div>
            <Link
              href="/contestants"
              className="border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-sm px-5 py-2 rounded-full hover:border-yellow-500 hover:text-yellow-600 dark:hover:border-yellow-400 dark:hover:text-yellow-400 transition-all"
            >
              View All →
            </Link>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-none">
            {FEATURED.map((c, i) => (
              <div
                key={c.num}
                className="min-w-[200px] bg-stone-100 dark:bg-white/[0.04] border border-stone-200 dark:border-white/[0.08] rounded-2xl overflow-hidden flex-shrink-0 hover:-translate-y-1 hover:border-yellow-500/50 transition-all duration-200"
              >
                <div
                  className={`w-full aspect-[4/5] bg-gradient-to-br ${CARD_GRADS[i % CARD_GRADS.length]} flex items-center justify-center font-serif text-3xl text-yellow-500/60 dark:text-yellow-400/50`}
                >
                  {c.init}
                </div>
                <div className="p-4">
                  <div className="text-[10px] uppercase tracking-[0.15em] text-yellow-600 dark:text-yellow-400">
                    Contestant #{c.num}
                  </div>
                  <div className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 mt-1 mb-1">
                    {c.name}
                  </div>
                  <div className="text-xs text-stone-400 dark:text-stone-500">
                    {c.votes} votes
                  </div>
                  <Link
                    href="/vote"
                    className="block w-full mt-3 bg-yellow-500/10 dark:bg-yellow-500/10 border border-yellow-500/30 dark:border-yellow-500/30 text-yellow-600 dark:text-yellow-400 text-sm text-center py-2 rounded-lg hover:bg-yellow-500/20 transition-colors"
                  >
                    Vote
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEADERBOARD PREVIEW */}
      <section className="bg-stone-100/60 dark:bg-white/[0.02] py-20 px-6">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <div className="text-[11px] uppercase tracking-[0.2em] text-yellow-600 dark:text-yellow-400 mb-2">
            Rankings
          </div>
          <div className="w-12 h-0.5 bg-yellow-500 dark:bg-yellow-400 rounded mx-auto mb-5" />
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-100">
            Leaderboard
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 font-light mt-2">
            Stage 3 · Updated in real-time
          </p>
        </div>
        <div className="max-w-2xl mx-auto">
          {/* Podium */}
          <div className="flex justify-center items-end mb-8">
            {[
              {
                rank: 2,
                init: "SO",
                name: "Solomon Obi",
                votes: "2,890",
                cls: "min-h-[120px] order-1 bg-stone-200/80 dark:bg-white/[0.04] border-stone-300 dark:border-white/[0.08]",
              },
              {
                rank: 1,
                init: "GA",
                name: "Grace Adeyemi",
                votes: "3,241",
                cls: "min-h-[160px] order-2 bg-yellow-50 dark:bg-yellow-500/[0.08] border-yellow-400/40 dark:border-yellow-500/30 z-10",
                crown: true,
              },
              {
                rank: 3,
                init: "FN",
                name: "Faith Nwosu",
                votes: "2,615",
                cls: "min-h-[100px] order-3 bg-stone-200/50 dark:bg-white/[0.03] border-stone-200 dark:border-white/[0.06]",
              },
            ].map((p) => {
              const badgeColor =
                p.rank === 1
                  ? "bg-yellow-500 text-stone-900"
                  : p.rank === 2
                    ? "bg-stone-400 text-stone-900"
                    : "bg-amber-700 text-white";
              const avatarColor =
                p.rank === 1
                  ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/50"
                  : p.rank === 2
                    ? "bg-stone-300/50 dark:bg-stone-600/30 text-stone-500 dark:text-stone-400 border-stone-400/30"
                    : "bg-amber-800/20 text-amber-700 dark:text-amber-600 border-amber-700/30";
              return (
                <div
                  key={p.rank}
                  className={`relative text-center px-6 pt-8 pb-4 rounded-t-2xl border ${p.cls} min-w-[130px]`}
                >
                  <div
                    className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full text-[10px] font-medium flex items-center justify-center ${badgeColor}`}
                  >
                    {p.rank}
                  </div>
                  {p.crown && <div className="text-lg mb-2">♛</div>}
                  <div
                    className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center font-serif text-base font-bold border ${avatarColor}`}
                  >
                    {p.init}
                  </div>
                  <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
                    {p.name}
                  </div>
                  <div className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                    {p.votes} votes
                  </div>
                </div>
              );
            })}
          </div>
          {/* Rest */}
          <div className="flex flex-col gap-2">
            {LEADERBOARD_REST.map((row) => (
              <div
                key={row.rank}
                className="flex items-center gap-4 px-5 py-3 bg-stone-100 dark:bg-white/[0.03] border border-stone-200 dark:border-white/[0.06] rounded-xl hover:bg-stone-200/70 dark:hover:bg-white/[0.06] transition-colors"
              >
                <div className="w-5 text-sm text-stone-400 dark:text-stone-500 font-medium">
                  {row.rank}
                </div>
                <div className="flex-1 text-sm text-stone-900 dark:text-stone-100">
                  {row.name}
                </div>
                <div className="w-28 h-1 bg-stone-200 dark:bg-white/[0.07] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 dark:bg-yellow-400 rounded-full"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
                <div className="text-xs text-stone-400 dark:text-stone-500 min-w-[70px] text-right">
                  {row.votes.toLocaleString()} votes
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/leaderboard"
              className="border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-sm px-6 py-2.5 rounded-full hover:border-yellow-500 hover:text-yellow-600 dark:hover:border-yellow-400 dark:hover:text-yellow-400 transition-all"
            >
              View Full Leaderboard →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
