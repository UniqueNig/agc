import Link from "next/link";

const Footer = () => {
  return (
    <footer className="flex flex-wrap items-start justify-between gap-8 border-t border-yellow-600/15 px-6 pt-12 pb-8 dark:border-yellow-500/15">
      <div>
        <div className="mb-1 font-serif text-xl font-bold text-yellow-600 dark:text-yellow-400">
          GospelAGC
        </div>
        <div className="text-xs text-stone-400 dark:text-stone-500">
          Abeokuta Gospel Talent Show &middot; Season 1
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {["Contestants", "How to Vote", "Contact Us"].map((label) => (
          <Link
            key={label}
            href="#"
            className="text-sm text-stone-500 transition-colors hover:text-yellow-600 dark:text-stone-400 dark:hover:text-yellow-400"
          >
            {label}
          </Link>
        ))}
      </div>
      <div>
        <div className="mb-3 text-[11px] uppercase tracking-widest text-stone-400 dark:text-stone-500">
          Follow Us
        </div>
        <div className="flex gap-2">
          {["f", "ig", "tw", "yt"].map((social) => (
            <button
              key={social}
              className="h-9 w-9 rounded-full border border-yellow-600/30 text-xs font-medium text-yellow-600 transition-colors hover:bg-yellow-500/10 dark:border-yellow-500/30 dark:text-yellow-400"
            >
              {social}
            </button>
          ))}
        </div>
      </div>
      <div className="w-full border-t border-stone-200 pt-6 text-center text-[11px] text-stone-400 dark:border-white/[0.05] dark:text-stone-600">
        &copy; 2025 Abeokuta Gospel AGT. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
