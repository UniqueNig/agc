"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Minus, Plus, X } from "lucide-react";
import ThemeToggle from "@/src/components/ui/ThemeToggle";
import {
  createVotePayment,
  fetchContestantById,
  type VotePageData,
} from "@/src/lib/graphql/api";
import {
  formatCurrency,
  getContestantInitials,
} from "@/src/lib/contestants";

const PRICE_PER_VOTE = 100;
const QUICK_OPTIONS = [5, 10, 25, 50];

export default function VotePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<VotePageData | null>(null);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [votes, setVotes] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadContestant = async () => {
      try {
        const response = await fetchContestantById(params.id);
        if (!cancelled) {
          setData(response);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "We could not load this contestant."
          );
        }
      }
    };

    void loadContestant();

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const contestant = data?.contestant ?? null;
  const total = votes * PRICE_PER_VOTE;
  const canPay = contestant?.status === "active";

  const adjust = (delta: number) => {
    setVotes((current) => Math.max(1, current + delta));
  };

  const handlePay = async () => {
    if (!contestant) {
      setError("Contestant details are not ready yet.");
      return;
    }

    if (!email.trim()) {
      setError("Enter the voter email before continuing.");
      return;
    }

    if (!canPay) {
      setError("Voting is only available for active contestants.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const payment = await createVotePayment({
        contestantId: contestant.id,
        votes,
        email: email.trim().toLowerCase(),
      });

      window.location.assign(payment.authorizationUrl);
    } catch (paymentError) {
      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "We could not initialize the payment."
      );
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900 transition-colors duration-300 dark:bg-[#0a0414] dark:text-stone-100">
      <nav className="flex items-center justify-between border-b border-yellow-600/20 px-6 py-4 dark:border-yellow-500/20">
        <Link href="/" className="font-serif text-lg font-bold text-yellow-600 dark:text-yellow-400">
          GOSPEL<span className="text-stone-900 dark:text-stone-100">AGT</span>
        </Link>
        <ThemeToggle />
      </nav>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-stone-200 bg-white dark:border-yellow-500/[0.18] dark:bg-[#130a22]">
          <button
            onClick={() => router.back()}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-stone-100 text-stone-400 transition-opacity hover:opacity-70 dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-stone-500"
          >
            <X size={14} />
          </button>

          {contestant ? (
            <>
              <div className="flex items-center gap-4 p-6 pb-0">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-purple-900/40 to-purple-950/70 font-serif text-2xl text-yellow-500/70 dark:text-yellow-400/60">
                  {getContestantInitials(contestant.name)}
                </div>
                <div>
                  <div className="mb-0.5 text-[11px] uppercase tracking-[0.15em] text-yellow-600 dark:text-yellow-400">
                    Contestant #{contestant.contestantNumber}
                  </div>
                  <div className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                    {contestant.name}
                  </div>
                  <div className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">
                    {contestant.stage?.name ?? "Competition stage pending"}
                  </div>
                </div>
              </div>

              <div className="mx-6 my-5 h-px bg-stone-100 dark:bg-white/[0.07]" />

              <div className="px-6 pb-6">
                <label className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-stone-400 dark:text-stone-500">
                  Voter email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="mb-5 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-yellow-500/50 dark:border-white/[0.12] dark:bg-white/[0.05] dark:text-stone-100 dark:placeholder:text-stone-600"
                />

                <label className="mb-3 block text-[11px] uppercase tracking-[0.12em] text-stone-400 dark:text-stone-500">
                  Number of votes
                </label>
                <div className="mb-4 flex items-center gap-3">
                  <button
                    onClick={() => adjust(-1)}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-600 transition-colors hover:bg-yellow-500/20 dark:text-yellow-400"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={votes}
                    onChange={(event) =>
                      setVotes(Math.max(1, Number.parseInt(event.target.value, 10) || 1))
                    }
                    className="min-w-0 flex-1 appearance-none rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-center font-serif text-3xl font-bold text-stone-900 outline-none transition-colors [appearance:textfield] focus:border-yellow-500/50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none dark:border-white/[0.12] dark:bg-white/[0.05] dark:text-stone-100"
                  />
                  <button
                    onClick={() => adjust(1)}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-600 transition-colors hover:bg-yellow-500/20 dark:text-yellow-400"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="mb-6 grid grid-cols-4 gap-2">
                  {QUICK_OPTIONS.map((option) => (
                    <button
                      key={option}
                      onClick={() => setVotes(option)}
                      className={`rounded-xl border py-2 text-sm transition-all ${
                        votes === option
                          ? "border-yellow-500/50 bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
                          : "border-stone-200 bg-stone-50 text-stone-500 hover:border-yellow-500/30 hover:text-yellow-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-stone-400 dark:hover:text-yellow-400"
                      }`}
                    >
                      {option} votes
                    </button>
                  ))}
                </div>

                <div className="mb-5 rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
                  <div className="flex items-center justify-between border-b border-stone-200 py-2 dark:border-white/[0.06]">
                    <span className="text-sm text-stone-500 dark:text-stone-400">Price per vote</span>
                    <span className="text-sm font-medium text-stone-900 dark:text-stone-100">{formatCurrency(PRICE_PER_VOTE)}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-stone-200 py-2 dark:border-white/[0.06]">
                    <span className="text-sm text-stone-500 dark:text-stone-400">Number of votes</span>
                    <span className="text-sm font-medium text-stone-900 dark:text-stone-100">
                      {votes} {votes === 1 ? "vote" : "votes"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3">
                    <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Total amount</span>
                    <span className="font-serif text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                {!canPay && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                    Voting is currently unavailable for this contestant.
                  </div>
                )}

                {error && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                    {error}
                  </div>
                )}

                <button
                  onClick={handlePay}
                  disabled={loading || !canPay}
                  className="w-full rounded-2xl bg-yellow-500 py-4 text-[15px] font-medium text-stone-900 transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:bg-yellow-400"
                >
                  {loading
                    ? "Redirecting to Paystack..."
                    : `Proceed to Pay -> ${formatCurrency(total)}`}
                </button>

                <p className="mt-3 text-center text-xs text-stone-400 dark:text-stone-600">
                  Powered by <span className="text-yellow-600 dark:text-yellow-500">Paystack</span> · Secure payment
                </p>
              </div>
            </>
          ) : (
            <div className="px-6 py-16 text-center">
              <div className="mb-2 font-serif text-xl text-stone-900 dark:text-stone-100">
                Loading contestant...
              </div>
              <p className="text-sm text-stone-400 dark:text-stone-500">
                We are preparing the voting form for you.
              </p>
              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

