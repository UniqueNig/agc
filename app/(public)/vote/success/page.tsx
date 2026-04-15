"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/src/components/layouts/Navbar";
import Footer from "@/src/components/layouts/Footer";

export default function VoteSuccessPage() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") ?? searchParams.get("trxref");
  const [verificationState, setVerificationState] = useState<
    "idle" | "verifying" | "success" | "pending" | "failed"
  >(reference ? "verifying" : "idle");
  const [message, setMessage] = useState(
    "Your payment was submitted successfully. We are verifying the transaction in the background and your votes will reflect once the payment is confirmed."
  );

  useEffect(() => {
    if (!reference) {
      return;
    }

    let cancelled = false;

    const verifyTransaction = async () => {
      setVerificationState("verifying");

      try {
        const response = await fetch("/api/payments/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reference }),
        });

        const payload = (await response.json()) as { message?: string };

        if (cancelled) {
          return;
        }

        if (response.ok) {
          setVerificationState("success");
          setMessage(
            "Your payment has been confirmed and the vote total has been updated."
          );
          return;
        }

        if (response.status === 409) {
          const nextState = payload.message?.includes("still")
            ? "pending"
            : "failed";
          setVerificationState(nextState);
          setMessage(
            payload.message ??
              "We are still waiting for Paystack to confirm this payment."
          );
          return;
        }

        throw new Error(payload.message ?? "Unable to verify payment.");
      } catch (error) {
        if (!cancelled) {
          setVerificationState("pending");
          setMessage(
            error instanceof Error
              ? error.message
              : "Unable to verify payment right now."
          );
        }
      }
    };

    void verifyTransaction();

    return () => {
      cancelled = true;
    };
  }, [reference]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 transition-colors duration-300 dark:bg-[#0a0414] dark:text-stone-100">
      <Navbar />

      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center">
        <div
          className={`mb-4 rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] ${
            verificationState === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : verificationState === "failed"
                ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
                : "border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
          }`}
        >
          {verificationState === "success"
            ? "Payment Confirmed"
            : verificationState === "failed"
              ? "Payment Failed"
              : verificationState === "verifying"
                ? "Verifying Payment"
                : "Payment Received"}
        </div>
        <h1 className="mb-3 font-serif text-4xl font-bold">
          Thanks for supporting your contestant
        </h1>
        <p className="max-w-xl text-sm text-stone-500 dark:text-stone-400">
          {message}
        </p>
        {reference && (
          <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-100 px-5 py-4 text-sm text-stone-600 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-stone-300">
            Reference: <span className="font-medium">{reference}</span>
          </div>
        )}
        {verificationState !== "success" && reference && (
          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-full border border-yellow-500/30 px-5 py-2 text-sm text-yellow-600 transition-colors hover:bg-yellow-500/10 dark:text-yellow-400"
          >
            Check payment again
          </button>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/leaderboard"
            className="rounded-full bg-yellow-500 px-6 py-3 text-sm font-medium text-stone-900 transition-opacity hover:opacity-90 dark:bg-yellow-400"
          >
            View Leaderboard
          </Link>
          <Link
            href="/contestants"
            className="rounded-full border border-stone-300 px-6 py-3 text-sm text-stone-700 transition-colors hover:border-yellow-500 hover:text-yellow-600 dark:border-stone-700 dark:text-stone-300 dark:hover:border-yellow-400 dark:hover:text-yellow-400"
          >
            Vote Again
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
