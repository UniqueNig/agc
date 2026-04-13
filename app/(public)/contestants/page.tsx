"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/src/components/ui/ThemeToggle";
import { Search } from "lucide-react";

type Status = "active" | "eliminated";
type Tab = "all" | "active" | "eliminated";
type Sort = "votes" | "number" | "name";

interface Contestant {
  num: string;
  name: string;
  votes: number;
  pct: number;
  init: string;
  status: Status;
}

const CONTESTANTS: Contestant[] = [
  { num: "01", name: "Grace Adeyemi", votes: 3241, pct: 100, init: "GA", status: "active" },
  { num: "02", name: "Solomon Obi", votes: 2890, pct: 89, init: "SO", status: "active" },
  { num: "03", name: "Faith Nwosu", votes: 2615, pct: 81, init: "FN", status: "active" },
  { num: "04", name: "Emmanuel Bello", votes: 2430, pct: 75, init: "EB", status: "active" },
  { num: "05", name: "Miriam Afolabi", votes: 2198, pct: 68, init: "MA", status: "active" },
  { num: "06", name: "David Okafor", votes: 1987, pct: 61, init: "DO", status: "active" },
  { num: "07", name: "Praise Eze", votes: 1745, pct: 54, init: "PE", status: "active" },
  { num: "08", name: "Joy Adeleke", votes: 1600, pct: 49, init: "JA", status: "active" },
  { num: "09", name: "Blessed Okeke", votes: 1450, pct: 45, init: "BO", status: "active" },
  { num: "10", name: "Hope Fashola", votes: 1320, pct: 41, init: "HF", status: "active" },
  { num: "11", name: "Mercy Adeyinka", votes: 1200, pct: 37, init: "ME", status: "active" },
  { num: "12", name: "Victor Eze", votes: 1050, pct: 32, init: "VE", status: "active" },
  { num: "13", name: "Ruth Olawale", votes: 950, pct: 29, init: "RO", status: "active" },
  { num: "14", name: "Caleb Martins", votes: 820, pct: 25, init: "CM", status: "active" },
  { num: "15", name: "Esther Balogun", votes: 700, pct: 22, init: "ES", status: "active" },
  { num: "16", name: "Paul Onuoha", votes: 600, pct: 19, init: "PO", status: "active" },
  { num: "17", name: "Abigail Otu", votes: 490, pct: 15, init: "AO", status: "eliminated" },
  { num: "18", name: "Joshua Adeyemi", votes: 400, pct: 12, init: "JO", status: "eliminated" },
  { num: "19", name: "Naomi Ogundele", votes: 310, pct: 10, init: "NO", status: "eliminated" },
  { num: "20", name: "Isaac Fadeyibi", votes: 250, pct: 8, init: "IF", status: "eliminated" },
  { num: "21", name: "Lydia Omonuwa", votes: 200, pct: 6, init: "LO", status: "eliminated" },
  { num: "22", name: "Samuel Adeolu", votes: 150, pct: 5, init: "SA", status: "eliminated" },
  { num: "23", name: "Ruth Chime", votes: 100, pct: 3, init: "RC", status: "eliminated" },
  { num: "24", name: "Daniel Omale", votes: 60, pct: 2, init: "DO2", status: "eliminated" },
];

const GRADS = [
  "from-purple-900/50 to-purple-950/80",
  "from-yellow-900/30 to-yellow-950/60",
  "from-blue-900/50 to-blue-950/80",
  "from-rose-900/40 to-rose-950/70",
  "from-emerald-900/40 to-emerald-950/70",
];



export default function ContestantsPage() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [sort, setSort] = useState<Sort>("votes");

  const filtered = CONTESTANTS
    .filter((c) => {
      const matchTab = tab === "all" || c.status === tab;
      const matchQuery = c.name.toLowerCase().includes(query.toLowerCase()) || c.num.includes(query);
      return matchTab && matchQuery;
    })
    .sort((a, b) => {
      if (sort === "votes") return b.votes - a.votes;
      if (sort === "number") return parseInt(a.num) - parseInt(b.num);
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0a0414] text-stone-900 dark:text-stone-100 transition-colors duration-300">

      {/* NAV */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-yellow-600/20 dark:border-yellow-500/20 bg-stone-50/90 dark:bg-[#0a0414]/90 backdrop-blur-md">
        <Link href="/" className="font-serif text-lg font-bold text-yellow-600 dark:text-yellow-400">
          GOSPEL<span className="text-stone-900 dark:text-stone-100">AGT</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <span className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 text-xs uppercase tracking-widest px-3 py-1.5 rounded-full">
            Stage 3 
          </span>
        </div>
      </nav>

      {/* HEADER */}
      <div className="px-6 py-8 border-b border-stone-200 dark:border-white/[0.07]">
        <Link href="/" className="text-sm text-stone-400 dark:text-stone-500 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors mb-2 inline-block">
          ← Back
        </Link>
        <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">Contestants</h1>
      </div>

      {/* FILTERS */}
      <div className="px-6 py-4 flex gap-3 flex-wrap items-center border-b border-stone-200 dark:border-white/[0.07]">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
          <input
            type="text"
            placeholder="Search contestant..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-stone-100 dark:bg-white/[0.05] border border-stone-200 dark:border-white/[0.1] rounded-xl text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-600 outline-none focus:border-yellow-500/50 transition-colors"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="bg-stone-100 dark:bg-white/[0.05] border border-stone-200 dark:border-white/[0.1] rounded-xl px-3 py-2.5 text-sm text-stone-700 dark:text-stone-300 outline-none cursor-pointer"
        >
          <option value="votes">Most Votes</option>
          <option value="number">Contestant No.</option>
          <option value="name">Name A–Z</option>
        </select>
        {(["all", "active", "eliminated"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm capitalize border transition-all ${
              tab === t
                ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-600 dark:text-yellow-400"
                : "border-stone-200 dark:border-white/[0.1] text-stone-500 dark:text-stone-400 hover:border-stone-300 dark:hover:border-white/20"
            }`}
          >
            {t}
          </button>
        ))}
        <span className="ml-auto text-sm text-stone-400 dark:text-stone-500">{filtered.length} contestants</span>
      </div>

      {/* GRID */}
      <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filtered.map((c, i) => {
          const isElim = c.status === "eliminated";
          return (
            <div
              key={c.num}
              className={`bg-stone-100 dark:bg-white/[0.04] border border-stone-200 dark:border-white/[0.08] rounded-2xl overflow-hidden transition-all duration-200 ${
                isElim ? "opacity-45 pointer-events-none" : "hover:-translate-y-1 hover:border-yellow-500/40 cursor-pointer"
              }`}
            >
              <div className={`w-full aspect-[3/4] bg-gradient-to-br ${GRADS[i % GRADS.length]} relative flex items-center justify-center font-serif text-3xl text-yellow-500/60 dark:text-yellow-400/50`}>
                {c.init}
                {isElim ? (
                  <span className="absolute bottom-2 left-2 text-[9px] uppercase tracking-wide bg-red-500/70 text-white px-2 py-0.5 rounded">
                    Eliminated
                  </span>
                ) : (
                  <span className="absolute top-2 right-2 text-[9px] uppercase tracking-wide bg-emerald-500/80 text-white px-2 py-0.5 rounded">
                    Safe
                  </span>
                )}
              </div>
              <div className="p-3">
                <div className="text-[10px] uppercase tracking-[0.12em] text-yellow-600 dark:text-yellow-400">#{c.num}</div>
                <div className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100 mt-0.5 mb-1 leading-tight">{c.name}</div>
                <div className="text-xs text-stone-400 dark:text-stone-500">{c.votes.toLocaleString()} votes</div>
                <div className="mt-2 h-0.5 bg-stone-200 dark:bg-white/[0.07] rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 dark:bg-yellow-400 rounded-full" style={{ width: `${c.pct}%` }} />
                </div>
                <Link
                  href={`/vote/${c.num}`}
                  className="block w-full mt-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 text-xs text-center py-2 rounded-lg hover:bg-yellow-500/20 transition-colors"
                >
                  Vote for {c.name.split(" ")[0]}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
