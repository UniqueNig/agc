
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";

const NAV_ITEMS = [
  { label: "Contestants", href: "/contestants" },
  { label: "Stages", href: "#" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "About", href: "#" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-yellow-600/20 bg-stone-50/90 backdrop-blur-md dark:border-yellow-500/20 dark:bg-[#0a0414]/90">
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="font-serif text-lg font-bold text-yellow-600 dark:text-yellow-400">
          GOSPEL<span className="text-stone-900 dark:text-stone-100">AGC</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-xs uppercase tracking-widest text-stone-500 transition-colors hover:text-yellow-600 dark:text-stone-400 dark:hover:text-yellow-400"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/contestants"
            className="hidden rounded-full bg-yellow-500 px-5 py-2 text-sm font-medium text-stone-900 transition-opacity hover:opacity-90 dark:bg-yellow-400 md:inline-flex"
          >
            Vote Now
          </Link>
          <button
            type="button"
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsOpen((open) => !open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-yellow-600/30 text-yellow-600 transition-colors hover:bg-yellow-500/10 dark:border-yellow-500/30 dark:text-yellow-400 md:hidden"
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-yellow-600/15 px-6 pb-6 pt-4 dark:border-yellow-500/15 md:hidden">
          <div className="rounded-2xl border border-stone-200 bg-stone-100/80 p-3 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-white/[0.04]">
            <div className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm uppercase tracking-widest text-stone-600 transition-colors hover:bg-yellow-500/10 hover:text-yellow-600 dark:text-stone-300 dark:hover:text-yellow-400"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <Link
              href="/contestants"
              onClick={() => setIsOpen(false)}
              className="mt-3 block rounded-xl bg-yellow-500 px-4 py-3 text-center text-sm font-medium text-stone-900 transition-opacity hover:opacity-90 dark:bg-yellow-400"
            >
              Vote Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
