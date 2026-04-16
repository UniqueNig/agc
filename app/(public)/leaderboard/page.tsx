"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "@/src/components/layouts/Footer";
import Navbar from "@/src/components/layouts/Navbar";
import ContestantMedia from "@/src/components/ui/ContestantMedia";
import {
  fetchLeaderboardPageData,
  type LeaderboardPageData,
} from "@/src/lib/graphql/api";
import {
  formatStageLabel,
  getVotePercentage,
} from "@/src/lib/contestants";

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardPageData | null>(null);
  const [error, setError] = useState("");
  const [selectedStageId, setSelectedStageId] = useState<string | undefined>();
  const [liveDot, setLiveDot] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setLiveDot((current) => !current), 900);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadLeaderboard = async () => {
      try {
        const response = await fetchLeaderboardPageData(selectedStageId);
        if (!cancelled) {
          setData(response);
          if (!selectedStageId && response.activeStage?.id) {
            setSelectedStageId(response.activeStage.id);
          }
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "We could not load the leaderboard right now."
          );
        }
      }
    };

    void loadLeaderboard();

    return () => {
      cancelled = true;
    };
  }, [selectedStageId]);

  const stages = (data?.stages ?? []).slice().sort((first, second) => {
    return (
      new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime()
    );
  });
  const activeStageIndex = stages.findIndex((stage) => stage.isActive);
  const selectedStage =
    stages.find((stage) => stage.id === selectedStageId) ??
    data?.activeStage ??
    stages[0] ??
    null;
  const rows = data?.leaderboard ?? [];
  const topThree = rows.slice(0, 3);
  const rest = rows.slice(3);
  const highestVoteCount = rows[0]?.totalVotes ?? 0;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 transition-colors duration-300 dark:bg-[#0a0414] dark:text-stone-100">
      <Navbar />

      <div className="border-b border-stone-200 px-6 pt-8 pb-4 dark:border-white/[0.07]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
              Leaderboard
            </h1>
            <div className="mt-1 flex items-center gap-1.5">
              <span
                className={`inline-block h-2 w-2 rounded-full bg-emerald-500 transition-opacity duration-500 ${
                  liveDot ? "opacity-100" : "opacity-20"
                }`}
              />
              <span className="text-sm text-stone-400 dark:text-stone-500">
                {selectedStage?.isActive
                  ? "Live / Updated every 60s"
                  : "Stage snapshot"}
              </span>
            </div>
          </div>
          <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-xs uppercase tracking-widest text-yellow-600 dark:text-yellow-400">
            {selectedStage?.name ?? "No stage selected"}
          </span>
        </div>
      </div>

      <div className="bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(120,40,200,0.1)_0%,transparent_70%)] px-6 pt-10 pb-6 dark:bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(100,30,150,0.25)_0%,transparent_70%)]">
        <div className="mb-6 text-center text-[11px] uppercase tracking-[0.2em] text-yellow-600 dark:text-yellow-400">
          Top Performers
        </div>

        {topThree.length > 0 ? (
          <div className="mx-auto mb-8 flex max-w-lg items-end justify-center">
            {[topThree[1], topThree[0], topThree[2]].filter(Boolean).map((contestant, displayIndex) => {
              const isFirst = displayIndex === 1;
              const isSecond = displayIndex === 0;
              const badgeColor = isFirst
                ? "bg-yellow-500 text-stone-900"
                : isSecond
                  ? "bg-stone-400 text-stone-900"
                  : "bg-amber-700 text-white";
              const avatarBorder = isFirst
                ? "border-yellow-500/50 bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
                : isSecond
                  ? "border-stone-400/30 bg-stone-300/20 dark:bg-stone-600/20 text-stone-500 dark:text-stone-400"
                  : "border-amber-700/30 bg-amber-800/15 text-amber-700 dark:text-amber-600";

              return (
                <div
                  key={contestant.id}
                  className={`relative flex-1 max-w-[160px] rounded-t-2xl border px-5 pt-8 pb-4 text-center ${
                    isFirst
                      ? "z-10 min-h-[170px] border-yellow-400/40 bg-yellow-50 dark:border-yellow-500/25 dark:bg-yellow-500/[0.07]"
                      : isSecond
                        ? "min-h-[130px] border-stone-200 bg-stone-100 dark:border-white/[0.08] dark:bg-white/[0.04]"
                        : "min-h-[110px] border-stone-200 bg-stone-100/70 dark:border-white/[0.06] dark:bg-white/[0.03]"
                  }`}
                >
                  <div className={`absolute -top-2.5 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full text-[10px] font-medium ${badgeColor}`}>
                    {displayIndex === 1 ? 1 : displayIndex === 0 ? 2 : 3}
                  </div>
                  {isFirst && <div className="mb-2 text-xl leading-none">&#9819;</div>}
                  <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border font-serif text-base font-bold ${avatarBorder}`}>
                    <ContestantMedia
                      name={contestant.name}
                      imageSrc={contestant.image}
                      index={displayIndex}
                      className="h-full w-full rounded-full"
                      sizes="48px"
                      fallbackClassName="font-serif text-base font-bold"
                    />
                  </div>
                  <div className="text-sm font-medium leading-tight text-stone-900 dark:text-stone-100">
                    {contestant.name}
                  </div>
                  <div className="mt-1 text-xs text-stone-400 dark:text-stone-500">
                    {contestant.totalVotes.toLocaleString()} votes
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-stone-200 bg-stone-100 px-6 py-10 text-center text-sm text-stone-500 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-stone-400">
            No leaderboard entries yet for this stage.
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-2">
          {stages.map((stage, index) => {
            const derivedStatus = stage.isActive
              ? "live"
              : activeStageIndex === -1
                ? "ended"
                : index > activeStageIndex
                  ? "upcoming"
                  : "ended";

            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStageId(stage.id)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-all ${
                  selectedStage?.id === stage.id
                    ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                    : "border-stone-200 text-stone-500 hover:border-stone-300 dark:border-white/[0.1] dark:text-stone-400 dark:hover:border-white/20"
                }`}
              >
                {formatStageLabel(index)} / {stage.name}
                {derivedStatus === "live" ? " (live)" : derivedStatus === "upcoming" ? " (soon)" : ""}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 pb-16">
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="flex gap-4 px-5 pb-2 pt-8 text-[11px] uppercase tracking-[0.08em] text-stone-400 dark:text-stone-600">
          <span className="w-6 text-center">#</span>
          <span className="w-8" />
          <span className="flex-1">Contestant</span>
          <span className="w-28 text-right">Progress</span>
          <span className="min-w-[80px] text-right">Votes</span>
        </div>
        <div className="flex flex-col gap-2">
          {rest.map((contestant, index) => {
            const isEliminated = contestant.status === "eliminated";

            return (
              <div
                key={contestant.id}
                className={`flex items-center gap-4 rounded-xl border px-5 py-3 transition-colors ${
                  isEliminated
                    ? "border-stone-100 bg-stone-100/50 opacity-50 dark:border-white/[0.04] dark:bg-white/[0.02]"
                    : "border-stone-200 bg-stone-100 hover:bg-stone-200/70 dark:border-white/[0.06] dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                }`}
              >
                <div className="w-6 text-center text-sm font-medium text-stone-400 dark:text-stone-500">
                  {index + 4}
                </div>
                <ContestantMedia
                  name={contestant.name}
                  imageSrc={contestant.image}
                  index={index}
                  className="h-8 w-8 flex-shrink-0 rounded-full"
                  sizes="32px"
                  fallbackClassName="font-serif text-xs font-bold text-yellow-500/70 dark:text-yellow-400/60"
                />
                <div className="flex flex-1 items-center gap-2 text-sm text-stone-900 dark:text-stone-100">
                  {contestant.status === "active" ? (
                    <Link href={`/vote/${contestant.id}`} className="transition-colors hover:text-yellow-600 dark:hover:text-yellow-400">
                      {contestant.name}
                    </Link>
                  ) : (
                    contestant.name
                  )}
                  {isEliminated && (
                    <span className="rounded border border-red-200 bg-red-100 px-2 py-0.5 text-[10px] text-red-500 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-400">
                      Out
                    </span>
                  )}
                </div>
                <div className="h-1 w-28 overflow-hidden rounded-full bg-stone-200 dark:bg-white/[0.07]">
                  <div
                    className={`h-full rounded-full ${
                      isEliminated ? "bg-red-400/50" : "bg-yellow-500 dark:bg-yellow-400"
                    }`}
                    style={{
                      width: `${getVotePercentage(
                        contestant.totalVotes,
                        highestVoteCount
                      )}%`,
                    }}
                  />
                </div>
                <div className="min-w-[80px] text-right text-xs text-stone-400 dark:text-stone-500">
                  {contestant.totalVotes.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
}


