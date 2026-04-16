"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "@/src/components/layouts/Footer";
import Navbar from "@/src/components/layouts/Navbar";
import ContestantMedia from "@/src/components/ui/ContestantMedia";
import {
  fetchHomePageData,
  type HomePageData,
} from "@/src/lib/graphql/api";
import {
  getVotePercentage,
} from "@/src/lib/contestants";

type CountdownUnitProps = {
  label: string;
  value: string;
};

function CountdownUnit({ label, value }: CountdownUnitProps) {
  return (
    <div className="text-center">
      <span className="block font-serif text-3xl font-bold leading-none text-yellow-500 dark:text-yellow-400">
        {value}
      </span>
      <span className="mt-1 block text-[10px] uppercase tracking-widest text-stone-400 dark:text-stone-500">
        {label}
      </span>
    </div>
  );
}

function Countdown() {
  const [secondsLeft, setSecondsLeft] = useState(3 * 3600 + 47 * 60 + 21);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;
  const pad = (value: number) => String(value).padStart(2, "0");

  return (
    <div className="flex items-center gap-3">
      <CountdownUnit value={pad(hours)} label="Hours" />
      <span className="-mt-2 text-2xl text-yellow-600/40">:</span>
      <CountdownUnit value={pad(minutes)} label="Mins" />
      <span className="-mt-2 text-2xl text-yellow-600/40">:</span>
      <CountdownUnit value={pad(seconds)} label="Secs" />
    </div>
  );
}

export default function HomePage() {
  const [data, setData] = useState<HomePageData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadHomePage = async () => {
      try {
        const response = await fetchHomePageData();
        if (!cancelled) {
          setData(response);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "We could not load the homepage data."
          );
        }
      }
    };

    void loadHomePage();

    return () => {
      cancelled = true;
    };
  }, []);

  const contestants = data?.contestants ?? [];
  const leaderboard =
    data?.leaderboard.length ? data.leaderboard : contestants.slice(0, 7);
  const activeStage = data?.activeStage ?? null;
  const totalVotes = contestants.reduce(
    (sum, contestant) => sum + contestant.totalVotes,
    0
  );
  const podium = leaderboard.slice(0, 3);
  const leaderboardRest = leaderboard.slice(3, 7);
  const highestVoteCount = leaderboard[0]?.totalVotes ?? 0;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 transition-colors duration-300 dark:bg-[#0a0414] dark:text-stone-100">
      <Navbar />

      <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden px-6 py-24 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(120,40,200,0.18)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(100,30,150,0.35)_0%,transparent_70%)]" />
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-purple-400/10 blur-3xl dark:bg-purple-900/25" />
        <div className="pointer-events-none absolute -bottom-8 -right-16 h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl dark:bg-yellow-600/10" />

        <div className="relative z-10 max-w-3xl">
          <div className="mb-6 inline-block rounded-full border border-yellow-600/30 px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-yellow-600 dark:border-yellow-500/30 dark:text-yellow-400">
            Season 1 &middot; Abeokuta, Ogun State
          </div>
          <h1 className="mb-3 font-serif text-5xl font-black leading-[1.05] md:text-7xl">
            Abeokuta
            <br />
            <span className="text-yellow-500 dark:text-yellow-400">
              Gospel AGC
            </span>
          </h1>
          <p className="mb-10 text-base font-light text-stone-500 dark:text-stone-400">
            Discover. Vote. Celebrate the voices that move heaven.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contestants"
              className="rounded-full bg-yellow-500 px-8 py-3.5 text-[15px] font-medium text-stone-900 transition-all hover:-translate-y-0.5 hover:opacity-90 dark:bg-yellow-400"
            >
              Vote Now
            </Link>
            <Link
              href="/leaderboard"
              className="rounded-full border border-stone-300 px-8 py-3.5 text-[15px] font-light text-stone-700 transition-all hover:border-yellow-500 hover:text-yellow-600 dark:border-stone-700 dark:text-stone-300 dark:hover:border-yellow-500 dark:hover:text-yellow-400"
            >
              View Leaderboard
            </Link>
          </div>

          <div className="mt-14 flex flex-wrap justify-center gap-10">
            {[
              {
                value: contestants.length ? contestants.length.toLocaleString() : "0",
                label: "Contestants",
              },
              {
                value: totalVotes ? totalVotes.toLocaleString() : "0",
                label: "Votes Cast",
              },
              {
                value: activeStage?.name ?? "No Live Stage",
                label: "Current Stage",
              },
            ].map((item, index) => (
              <div key={item.label} className="contents">
                {index > 0 && (
                  <div className="mt-1 h-10 w-px bg-stone-300 dark:bg-stone-700" />
                )}
                <div>
                  <div className="font-serif text-3xl font-bold text-yellow-500 dark:text-yellow-400">
                    {item.value}
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-widest text-stone-400 dark:text-stone-500">
                    {item.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-yellow-500/25 bg-gradient-to-br from-purple-100/80 to-yellow-50 p-6 dark:from-purple-900/20 dark:to-yellow-900/10">
            <div>
              <span className="mb-2 inline-block rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-yellow-600 dark:text-yellow-400">
                {activeStage ? "Live Now" : "Waiting"}
              </span>
              <div className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                {activeStage ? activeStage.name : "No active stage yet"}
              </div>
              <div className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                {activeStage
                  ? `${activeStage.contestantCount} contestants / ${activeStage.totalVotes.toLocaleString()} live votes`
                  : "Create and activate a stage from admin to begin voting."}
              </div>
            </div>
            <Countdown />
          </div>
          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          )}
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-2 text-[11px] uppercase tracking-[0.2em] text-yellow-600 dark:text-yellow-400">
            Featured
          </div>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-4 h-0.5 w-12 rounded bg-yellow-500 dark:bg-yellow-400" />
              <h2 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100 md:text-4xl">
                Meet the Contestants
              </h2>
              <p className="mt-1 text-sm font-light text-stone-500 dark:text-stone-400">
                Voices currently shaping the leaderboard
              </p>
            </div>
            <Link
              href="/contestants"
              className="rounded-full border border-stone-300 px-5 py-2 text-sm text-stone-600 transition-all hover:border-yellow-500 hover:text-yellow-600 dark:border-stone-700 dark:text-stone-300 dark:hover:border-yellow-400 dark:hover:text-yellow-400"
            >
              View All &rarr;
            </Link>
          </div>

          <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-none">
            {leaderboard.map((contestant, index) => (
              <div
                key={contestant.id}
                className="min-w-[200px] flex-shrink-0 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 transition-all duration-200 hover:-translate-y-1 hover:border-yellow-500/50 dark:border-white/[0.08] dark:bg-white/[0.04]"
              >
                <ContestantMedia
                  name={contestant.name}
                  imageSrc={contestant.image}
                  index={index}
                  className="aspect-[4/5] w-full"
                  sizes="200px"
                  fallbackClassName="font-serif text-3xl text-yellow-500/60 dark:text-yellow-400/50"
                />
                <div className="p-4">
                  <div className="text-[10px] uppercase tracking-[0.15em] text-yellow-600 dark:text-yellow-400">
                    Contestant #{contestant.contestantNumber}
                  </div>
                  <div className="mt-1 mb-1 font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                    {contestant.name}
                  </div>
                  <div className="text-xs text-stone-400 dark:text-stone-500">
                    {contestant.totalVotes.toLocaleString()} votes
                  </div>
                  <Link
                    href={`/vote/${contestant.id}`}
                    className="mt-3 block w-full rounded-lg border border-yellow-500/30 bg-yellow-500/10 py-2 text-center text-sm text-yellow-600 transition-colors hover:bg-yellow-500/20 dark:text-yellow-400"
                  >
                    Vote
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-stone-100/60 px-6 py-20 dark:bg-white/[0.02]">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mb-2 text-[11px] uppercase tracking-[0.2em] text-yellow-600 dark:text-yellow-400">
            Rankings
          </div>
          <div className="mx-auto mb-5 h-0.5 w-12 rounded bg-yellow-500 dark:bg-yellow-400" />
          <h2 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100 md:text-4xl">
            Leaderboard
          </h2>
          <p className="mt-2 text-sm font-light text-stone-500 dark:text-stone-400">
            {activeStage ? `${activeStage.name} / Updated in real time` : "Updated in real time"}
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          {podium.length > 0 ? (
            <>
              <div className="mb-8 flex items-end justify-center">
                {[podium[1], podium[0], podium[2]].filter(Boolean).map((contestant, displayIndex) => {
                  const isFirst = displayIndex === 1;
                  const isSecond = displayIndex === 0;
                  const badgeColor = isFirst
                    ? "bg-yellow-500 text-stone-900"
                    : isSecond
                      ? "bg-stone-400 text-stone-900"
                      : "bg-amber-700 text-white";
                  const avatarColor = isFirst
                    ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/50"
                    : isSecond
                      ? "bg-stone-300/50 dark:bg-stone-600/30 text-stone-500 dark:text-stone-400 border-stone-400/30"
                      : "bg-amber-800/20 text-amber-700 dark:text-amber-600 border-amber-700/30";

                  return (
                    <div
                      key={contestant.id}
                      className={`relative min-w-[130px] rounded-t-2xl border px-6 pt-8 pb-4 text-center ${
                        isFirst
                          ? "z-10 min-h-[160px] border-yellow-400/40 bg-yellow-50 dark:border-yellow-500/30 dark:bg-yellow-500/[0.08]"
                          : isSecond
                            ? "min-h-[120px] border-stone-300 bg-stone-200/80 dark:border-white/[0.08] dark:bg-white/[0.04]"
                            : "min-h-[100px] border-stone-200 bg-stone-200/50 dark:border-white/[0.06] dark:bg-white/[0.03]"
                      }`}
                    >
                      <div
                        className={`absolute -top-2.5 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full text-[10px] font-medium ${badgeColor}`}
                      >
                        {displayIndex === 1 ? 1 : displayIndex === 0 ? 2 : 3}
                      </div>
                      {isFirst && <div className="mb-2 text-lg">&#9819;</div>}
                      <div
                        className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border font-serif text-base font-bold ${avatarColor}`}
                      >
                        <ContestantMedia
                          name={contestant.name}
                          imageSrc={contestant.image}
                          index={displayIndex}
                          className="h-full w-full rounded-full"
                          sizes="48px"
                          fallbackClassName="font-serif text-base font-bold"
                        />
                      </div>
                      <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
                        {contestant.name}
                      </div>
                      <div className="mt-1 text-xs text-stone-400 dark:text-stone-500">
                        {contestant.totalVotes.toLocaleString()} votes
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2">
                {leaderboardRest.map((contestant, index) => (
                  <div
                    key={contestant.id}
                    className="flex items-center gap-4 rounded-xl border border-stone-200 bg-stone-100 px-5 py-3 transition-colors hover:bg-stone-200/70 dark:border-white/[0.06] dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                  >
                    <div className="w-5 text-sm font-medium text-stone-400 dark:text-stone-500">
                      {index + 4}
                    </div>
                    <div className="flex-1 text-sm text-stone-900 dark:text-stone-100">
                      {contestant.name}
                    </div>
                    <div className="h-1 w-28 overflow-hidden rounded-full bg-stone-200 dark:bg-white/[0.07]">
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
                    <div className="min-w-[70px] text-right text-xs text-stone-400 dark:text-stone-500">
                      {contestant.totalVotes.toLocaleString()} votes
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-stone-200 bg-stone-100 px-6 py-10 text-center text-sm text-stone-500 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-stone-400">
              No leaderboard data yet. Add contestants and votes from admin to bring this section to life.
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/leaderboard"
              className="rounded-full border border-stone-300 px-6 py-2.5 text-sm text-stone-600 transition-all hover:border-yellow-500 hover:text-yellow-600 dark:border-stone-700 dark:text-stone-300 dark:hover:border-yellow-400 dark:hover:text-yellow-400"
            >
              View Full Leaderboard &rarr;
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}


