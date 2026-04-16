"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import Footer from "@/src/components/layouts/Footer";
import Navbar from "@/src/components/layouts/Navbar";
import ContestantMedia from "@/src/components/ui/ContestantMedia";
import {
  fetchContestantsPageData,
  type ContestantsPageData,
} from "@/src/lib/graphql/api";
import {
  getVotePercentage,
} from "@/src/lib/contestants";

type Tab = "all" | "active" | "eliminated";
type Sort = "votes" | "number" | "name";

export default function ContestantsPage() {
  const [data, setData] = useState<ContestantsPageData | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [sort, setSort] = useState<Sort>("votes");

  useEffect(() => {
    let cancelled = false;

    const loadContestants = async () => {
      try {
        const response = await fetchContestantsPageData();
        if (!cancelled) {
          setData(response);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "We could not load the contestants right now."
          );
        }
      }
    };

    void loadContestants();

    return () => {
      cancelled = true;
    };
  }, []);

  const contestants = (data?.contestants ?? []).filter(
    (contestant) => contestant.status !== "pending"
  );
  const highestVoteCount = contestants[0]?.totalVotes
    ? Math.max(...contestants.map((contestant) => contestant.totalVotes))
    : 0;

  const filteredContestants = contestants
    .filter((contestant) => {
      const matchesTab = tab === "all" || contestant.status === tab;
      const searchValue = query.trim().toLowerCase();
      const matchesQuery =
        contestant.name.toLowerCase().includes(searchValue) ||
        contestant.contestantNumber.includes(query.trim());

      return matchesTab && matchesQuery;
    })
    .sort((first, second) => {
      if (sort === "votes") return second.totalVotes - first.totalVotes;
      if (sort === "number") {
        return Number(first.contestantNumber) - Number(second.contestantNumber);
      }

      return first.name.localeCompare(second.name);
    });

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 transition-colors duration-300 dark:bg-[#0a0414] dark:text-stone-100">
      <Navbar />

      <div className="border-b border-stone-200 px-6 py-8 dark:border-white/[0.07]">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/"
            className="mb-2 inline-block text-sm text-stone-400 transition-colors hover:text-yellow-600 dark:text-stone-500 dark:hover:text-yellow-400"
          >
            &larr; Back
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                Contestants
              </h1>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                Browse the contestants, check current standing, and vote directly from each card.
              </p>
            </div>
            <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-xs uppercase tracking-widest text-yellow-600 dark:text-yellow-400">
              {data?.activeStage?.name ?? "No live stage"}
            </span>
          </div>
        </div>
      </div>

      <div className="border-b border-stone-200 px-6 py-4 dark:border-white/[0.07]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] max-w-sm flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500"
            />
            <input
              type="text"
              placeholder="Search contestant..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-100 py-2.5 pl-9 pr-4 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-yellow-500/50 dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-stone-100 dark:placeholder:text-stone-600"
            />
          </div>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as Sort)}
            className="cursor-pointer rounded-xl border border-stone-200 bg-stone-100 px-3 py-2.5 text-sm text-stone-700 outline-none dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-stone-300"
          >
            <option value="votes">Most Votes</option>
            <option value="number">Contestant No.</option>
            <option value="name">Name A-Z</option>
          </select>
          {(["all", "active", "eliminated"] as Tab[]).map((filterTab) => (
            <button
              key={filterTab}
              onClick={() => setTab(filterTab)}
              className={`rounded-full border px-4 py-2 text-sm capitalize transition-all ${
                tab === filterTab
                  ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                  : "border-stone-200 text-stone-500 hover:border-stone-300 dark:border-white/[0.1] dark:text-stone-400 dark:hover:border-white/20"
              }`}
            >
              {filterTab}
            </button>
          ))}
          <span className="ml-auto text-sm text-stone-400 dark:text-stone-500">
            {filteredContestants.length} contestants
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-6">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}

        {filteredContestants.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredContestants.map((contestant, index) => {
              const isEliminated = contestant.status === "eliminated";

              return (
                <div
                  key={contestant.id}
                  className={`overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 transition-all duration-200 dark:border-white/[0.08] dark:bg-white/[0.04] ${
                    isEliminated
                      ? "opacity-60"
                      : "cursor-pointer hover:-translate-y-1 hover:border-yellow-500/40"
                  }`}
                >
                  <ContestantMedia
                    name={contestant.name}
                    imageSrc={contestant.image}
                    index={index}
                    className="aspect-[3/4] w-full"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                    fallbackClassName="font-serif text-3xl text-yellow-500/60 dark:text-yellow-400/50"
                  >
                    {isEliminated ? (
                      <span className="absolute bottom-2 left-2 rounded bg-red-500/70 px-2 py-0.5 text-[9px] uppercase tracking-wide text-white">
                        Eliminated
                      </span>
                    ) : (
                      <span className="absolute top-2 right-2 rounded bg-emerald-500/80 px-2 py-0.5 text-[9px] uppercase tracking-wide text-white">
                        Active
                      </span>
                    )}
                  </ContestantMedia>
                  <div className="p-3">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-yellow-600 dark:text-yellow-400">
                      #{contestant.contestantNumber}
                    </div>
                    <div className="mt-0.5 mb-1 font-serif text-sm font-bold leading-tight text-stone-900 dark:text-stone-100">
                      {contestant.name}
                    </div>
                    <div className="text-xs text-stone-400 dark:text-stone-500">
                      {contestant.totalVotes.toLocaleString()} votes
                    </div>
                    <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-stone-200 dark:bg-white/[0.07]">
                      <div
                        className="h-full rounded-full bg-yellow-500 dark:bg-yellow-400"
                        style={{
                          width: `${getVotePercentage(
                            contestant.totalVotes,
                            highestVoteCount
                          )}%`,
                        }}
                      />
                    </div>
                    {isEliminated ? (
                      <div className="mt-3 rounded-lg border border-stone-200 bg-stone-50 py-2 text-center text-xs text-stone-400 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-stone-500">
                        Voting closed
                      </div>
                    ) : (
                      <Link
                        href={`/vote/${contestant.id}`}
                        className="mt-3 block w-full rounded-lg border border-yellow-500/30 bg-yellow-500/10 py-2 text-center text-xs text-yellow-600 transition-colors hover:bg-yellow-500/20 dark:text-yellow-400"
                      >
                        Vote for {contestant.name.split(" ")[0]}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-stone-200 bg-stone-100 px-6 py-12 text-center text-sm text-stone-500 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-stone-400">
            No contestants match your current filters yet.
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

