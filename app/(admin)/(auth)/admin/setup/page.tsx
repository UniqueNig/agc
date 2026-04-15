"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/src/components/ui/ThemeToggle";

export default function AdminSetupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to create admin account.");
      }

      router.replace("/admin");
      router.refresh();
    } catch (setupError) {
      setError(
        setupError instanceof Error
          ? setupError.message
          : "Unable to create admin account."
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 transition-colors duration-300 dark:bg-[#08050f] dark:text-stone-100">
      <div className="flex items-center justify-between border-b border-yellow-600/20 px-6 py-4 dark:border-yellow-500/20">
        <Link
          href="/"
          className="font-serif text-lg font-bold text-yellow-600 dark:text-yellow-400"
        >
          GOSPEL<span className="text-stone-900 dark:text-stone-100">AGC</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="relative flex min-h-[calc(100vh-74px)] items-center justify-center overflow-hidden px-4 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_20%,rgba(120,40,200,0.14)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_70%_50%_at_50%_20%,rgba(100,30,150,0.3)_0%,transparent_70%)]" />
        <div className="pointer-events-none absolute -left-16 top-12 h-64 w-64 rounded-full bg-purple-400/10 blur-3xl dark:bg-purple-900/20" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl dark:bg-yellow-600/10" />

        <div className="relative z-10 w-full max-w-md rounded-3xl border border-stone-200 bg-white/90 p-7 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-yellow-500/[0.16] dark:bg-[#130a22]/95">
          <div className="mb-6">
            <div className="mb-3 inline-block rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-yellow-600 dark:text-yellow-400">
              Admin Setup
            </div>
            <h1 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">
              Create your admin account
            </h1>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
              This first account will own the admin dashboard and unlock contestant, stage, and payment management.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-stone-400 dark:text-stone-500">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-yellow-500/40 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-stone-100 dark:placeholder:text-stone-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-stone-400 dark:text-stone-500">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@example.com"
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-yellow-500/40 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-stone-100 dark:placeholder:text-stone-600"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-stone-400 dark:text-stone-500">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-yellow-500/40 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-stone-100 dark:placeholder:text-stone-600"
                autoComplete="new-password"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-stone-400 dark:text-stone-500">
                Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat password"
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-yellow-500/40 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-stone-100 dark:placeholder:text-stone-600"
                autoComplete="new-password"
                required
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-yellow-500 py-3.5 text-sm font-medium text-stone-900 transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:bg-yellow-400"
            >
              {loading ? "Creating account..." : "Create Admin Account"}
            </button>
          </form>

          <div className="mt-5 border-t border-stone-200 pt-4 text-xs text-stone-400 dark:border-white/[0.08] dark:text-stone-500">
            Already set up?{" "}
            <Link
              href="/admin/login"
              className="text-yellow-600 transition-colors hover:text-yellow-500 dark:text-yellow-400 dark:hover:text-yellow-300"
            >
              Sign in instead
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  );
}
