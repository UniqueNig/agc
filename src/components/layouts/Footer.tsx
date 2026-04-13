import Link from 'next/link'
import React from 'react'

const Footer = () => {
  return (
   <>
         {/* FOOTER */}
      <footer className="border-t border-yellow-600/15 dark:border-yellow-500/15 px-6 pt-12 pb-8 flex justify-between items-start flex-wrap gap-8">
        <div>
          <div className="font-serif text-xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">GospelAGC</div>
          <div className="text-xs text-stone-400 dark:text-stone-500">Abeokuta Gospel Talent Show · Season 1</div>
        </div>
        <div className="flex flex-col gap-2">
          {["Contestants", "How to Vote", "Contact Us"].map((l) => (
            <Link key={l} href="#" className="text-sm text-stone-500 dark:text-stone-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">{l}</Link>
          ))}
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-3">Follow Us</div>
          <div className="flex gap-2">
            {["f", "ig", "tw", "yt"].map((s) => (
              <button key={s} className="w-9 h-9 rounded-full border border-yellow-600/30 dark:border-yellow-500/30 text-yellow-600 dark:text-yellow-400 text-xs font-medium hover:bg-yellow-500/10 transition-colors">
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="w-full text-center text-[11px] text-stone-400 dark:text-stone-600 pt-6 border-t border-stone-200 dark:border-white/[0.05]">
          © 2025 Abeokuta Gospel AGT. All rights reserved.
        </div>
      </footer>
   </>
  )
}

export default Footer