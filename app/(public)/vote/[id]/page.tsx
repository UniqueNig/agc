"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {  X, Minus, Plus } from "lucide-react";
import ThemeToggle from "@/src/components/ui/ThemeToggle";

const PRICE_PER_VOTE = 100;
const QUICK_OPTIONS = [5, 10, 25, 50];
const CONTESTANT_NAMES: Record<string, string> = {
  "01": "Grace Adeyemi",
  "02": "Solomon Obi",
  "03": "Faith Nwosu",
  "04": "Emmanuel Bello",
  "05": "Miriam Afolabi",
  "06": "David Okafor",
  "07": "Praise Eze",
  "08": "Joy Adeleke",
  "09": "Blessed Okeke",
  "10": "Hope Fashola",
  "11": "Mercy Adeyinka",
  "12": "Victor Eze",
  "13": "Ruth Olawale",
  "14": "Caleb Martins",
  "15": "Esther Balogun",
  "16": "Paul Onuoha",
  "17": "Abigail Otu",
  "18": "Joshua Adeyemi",
  "19": "Naomi Ogundele",
  "20": "Isaac Fadeyibi",
  "21": "Lydia Omonuwa",
  "22": "Samuel Adeolu",
  "23": "Ruth Chime",
  "24": "Daniel Omale",
};


export default function VotePage() {
  const params = useParams<{ id?: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const contestantNum = typeof params?.id === "string" ? params.id : searchParams.get("id") ?? "01";
  const contestantName =
    CONTESTANT_NAMES[contestantNum] ?? searchParams.get("name") ?? "Grace Adeyemi";
  const initials = contestantName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const [votes, setVotes] = useState(1);
  const [loading, setLoading] = useState(false);

  const total = votes * PRICE_PER_VOTE;

  const adjust = (delta: number) => setVotes((v) => Math.max(1, v + delta));

  const handlePay = async () => {
    setLoading(true);
    // TODO: Initialize Paystack here
    // const handler = PaystackPop.setup({ key: process.env.NEXT_PUBLIC_PAYSTACK_KEY, ... });
    // handler.openIframe();
    await new Promise((r) => setTimeout(r, 1200)); // placeholder
    setLoading(false);
    alert(`Payment of ₦${total.toLocaleString()} initiated for ${votes} vote${votes > 1 ? "s" : ""} for ${contestantName}`);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0a0414] text-stone-900 dark:text-stone-100 transition-colors duration-300 flex flex-col">

      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-yellow-600/20 dark:border-yellow-500/20">
        <span className="font-serif text-lg font-bold text-yellow-600 dark:text-yellow-400">
          GOSPEL<span className="text-stone-900 dark:text-stone-100">AGT</span>
        </span>
        <ThemeToggle />
      </nav>

      {/* MODAL CENTERED */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white dark:bg-[#130a22] border border-stone-200 dark:border-yellow-500/[0.18] rounded-3xl overflow-hidden relative">

          {/* Close */}
          <button
            onClick={() => router.back()}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 dark:bg-white/[0.06] border border-stone-200 dark:border-white/[0.1] text-stone-400 dark:text-stone-500 flex items-center justify-center hover:opacity-70 transition-opacity"
          >
            <X size={14} />
          </button>

          {/* Contestant info */}
          <div className="p-6 pb-0 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-900/40 to-purple-950/70 border border-yellow-500/20 flex items-center justify-center font-serif text-2xl text-yellow-500/70 dark:text-yellow-400/60 flex-shrink-0">
              {initials}
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.15em] text-yellow-600 dark:text-yellow-400 mb-0.5">
                Contestant #{contestantNum}
              </div>
              <div className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">{contestantName}</div>
              <div className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">Stage 3 · Semi-Finals</div>
            </div>
          </div>

          <div className="h-px bg-stone-100 dark:bg-white/[0.07] mx-6 my-5" />

          <div className="px-6 pb-6">
            {/* Vote count input */}
            <label className="block text-[11px] uppercase tracking-[0.12em] text-stone-400 dark:text-stone-500 mb-3">
              Number of votes
            </label>
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => adjust(-1)}
                className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 flex items-center justify-center hover:bg-yellow-500/20 transition-colors flex-shrink-0"
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                min={1}
                value={votes}
                onChange={(e) => setVotes(Math.max(1, parseInt(e.target.value) || 1))}
                className="min-w-0 flex-1 appearance-none bg-stone-50 dark:bg-white/[0.05] border border-stone-200 dark:border-white/[0.12] rounded-xl px-3 py-2.5 text-center font-serif text-3xl font-bold text-stone-900 dark:text-stone-100 outline-none focus:border-yellow-500/50 transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                onClick={() => adjust(1)}
                className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 flex items-center justify-center hover:bg-yellow-500/20 transition-colors flex-shrink-0"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Quick pick buttons */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {QUICK_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setVotes(n)}
                  className={`py-2 rounded-xl text-sm border transition-all ${
                    votes === n
                      ? "bg-yellow-500/15 border-yellow-500/50 text-yellow-600 dark:text-yellow-400"
                      : "bg-stone-50 dark:bg-white/[0.04] border-stone-200 dark:border-white/[0.08] text-stone-500 dark:text-stone-400 hover:border-yellow-500/30 hover:text-yellow-600 dark:hover:text-yellow-400"
                  }`}
                >
                  {n} votes
                </button>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="bg-stone-50 dark:bg-white/[0.03] border border-stone-200 dark:border-white/[0.08] rounded-2xl p-4 mb-5">
              <div className="flex justify-between items-center py-2 border-b border-stone-200 dark:border-white/[0.06]">
                <span className="text-sm text-stone-500 dark:text-stone-400">Price per vote</span>
                <span className="text-sm font-medium text-stone-900 dark:text-stone-100">₦100</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-stone-200 dark:border-white/[0.06]">
                <span className="text-sm text-stone-500 dark:text-stone-400">Number of votes</span>
                <span className="text-sm font-medium text-stone-900 dark:text-stone-100">
                  {votes} {votes === 1 ? "vote" : "votes"}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Total amount</span>
                <span className="font-serif text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  ₦{total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Pay button */}
            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full bg-yellow-500 dark:bg-yellow-400 text-stone-900 font-medium py-4 rounded-2xl text-[15px] hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 transition-all"
            >
              {loading ? "Processing…" : `Proceed to Pay → ₦${total.toLocaleString()}`}
            </button>

            <p className="text-center text-xs text-stone-400 dark:text-stone-600 mt-3">
              Powered by <span className="text-yellow-600 dark:text-yellow-500">Paystack</span> · Secure payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
