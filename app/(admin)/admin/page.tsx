"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Layers,
  CreditCard,
  Settings,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Play,
  Square,
  Zap,
} from "lucide-react";
import ThemeToggle from "@/src/components/ui/ThemeToggle";

type Tab = "overview" | "contestants" | "stages" | "payments";
type ContestantStatus = "active" | "pending" | "eliminated";
type StageStatus = "ended" | "live" | "upcoming";

interface Contestant {
  num: string;
  name: string;
  votes: number;
  status: ContestantStatus;
}

interface Stage {
  n: number;
  name: string;
  contestants: number;
  votes: number;
  status: StageStatus;
}

interface Payment {
  time: string;
  voter: string;
  contestant: string;
  votes: number;
  amount: number;
  success: boolean;
}

const CONTESTANTS: Contestant[] = [
  { num: "01", name: "Grace Adeyemi", votes: 3241, status: "active" },
  { num: "02", name: "Solomon Obi", votes: 2890, status: "active" },
  { num: "03", name: "Faith Nwosu", votes: 2615, status: "active" },
  { num: "04", name: "Emmanuel Bello", votes: 2430, status: "active" },
  { num: "17", name: "Abigail Otu", votes: 490, status: "eliminated" },
  { num: "25", name: "New Applicant", votes: 0, status: "pending" },
  { num: "26", name: "Tosin Williams", votes: 0, status: "pending" },
];

const STAGES: Stage[] = [
  { n: 1, name: "Auditions", contestants: 24, votes: 4200, status: "ended" },
  {
    n: 2,
    name: "Quarter-Finals",
    contestants: 20,
    votes: 7800,
    status: "ended",
  },
  { n: 3, name: "Semi-Finals", contestants: 16, votes: 6450, status: "live" },
  { n: 4, name: "Grand Finals", contestants: 8, votes: 0, status: "upcoming" },
];

const PAYMENTS: Payment[] = [
  {
    time: "2:41 PM",
    voter: "Ade***@gmail.com",
    contestant: "Grace Adeyemi",
    votes: 50,
    amount: 5000,
    success: true,
  },
  {
    time: "2:38 PM",
    voter: "Tem***@gmail.com",
    contestant: "Solomon Obi",
    votes: 25,
    amount: 2500,
    success: true,
  },
  {
    time: "2:35 PM",
    voter: "Chi***@gmail.com",
    contestant: "Faith Nwosu",
    votes: 10,
    amount: 1000,
    success: true,
  },
  {
    time: "2:31 PM",
    voter: "Ola***@gmail.com",
    contestant: "Emmanuel Bello",
    votes: 5,
    amount: 500,
    success: true,
  },
  {
    time: "2:28 PM",
    voter: "Fun***@gmail.com",
    contestant: "Grace Adeyemi",
    votes: 100,
    amount: 10000,
    success: true,
  },
  {
    time: "2:15 PM",
    voter: "Ife***@gmail.com",
    contestant: "Miriam Afolabi",
    votes: 3,
    amount: 300,
    success: false,
  },
];

const statusBadge = (status: ContestantStatus | StageStatus) => {
  const map: Record<string, string> = {
    active:
      "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25",
    live: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25",
    pending:
      "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/25",
    upcoming:
      "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/25",
    eliminated:
      "bg-red-100 dark:bg-red-500/[0.08] text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20",
    ended:
      "bg-stone-100 dark:bg-white/[0.05] text-stone-500 dark:text-stone-400 border-stone-200 dark:border-white/[0.1]",
  };
  const label: Record<string, string> = {
    active: "Active",
    live: "Live",
    pending: "Pending",
    upcoming: "Upcoming",
    eliminated: "Eliminated",
    ended: "Ended",
  };
  return (
    <span
      className={`text-[10px] px-2.5 py-0.5 rounded border uppercase tracking-wide font-medium ${map[status]}`}
    >
      {label[status]}
    </span>
  );
};

const contestantInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={15} /> },
    { id: "contestants", label: "Contestants", icon: <Users size={15} /> },
    { id: "stages", label: "Stages", icon: <Layers size={15} /> },
    { id: "payments", label: "Payments", icon: <CreditCard size={15} /> },
  ];

  const pageTitles: Record<Tab, string> = {
    overview: "Overview",
    contestants: "Manage Contestants",
    stages: "Manage Stages",
    payments: "Payment Logs",
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#08050f] text-stone-900 dark:text-stone-100 transition-colors duration-300 flex">
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-52 flex-shrink-0 flex-col border-r border-stone-200 dark:border-white/[0.07] p-4 gap-1">
        <div className="font-serif text-base font-bold text-yellow-600 dark:text-yellow-400 px-3 pb-4 border-b border-stone-200 dark:border-white/[0.07] mb-3">
          GospelAGT
          <span className="block text-[10px] font-sans font-normal text-stone-400 dark:text-stone-500 tracking-wide mt-0.5">
            Admin Panel
          </span>
        </div>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-all border ${
              tab === item.id
                ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400"
                : "border-transparent text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/[0.05] hover:text-stone-900 dark:hover:text-stone-100"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
        <div className="mt-auto pt-4 border-t border-stone-200 dark:border-white/[0.07]">
          <button className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/[0.05] w-full text-left transition-colors border border-transparent">
            <Settings size={15} />
            Settings
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* TOPBAR */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-white/[0.07] sticky top-0 bg-stone-50/90 dark:bg-[#08050f]/90 backdrop-blur-md z-10">
          <div>
            <div className="text-base font-medium text-stone-900 dark:text-stone-100">
              {pageTitles[tab]}
            </div>
            <div className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
              Season 1 · Abeokuta Gospel AGC
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 text-xs px-3 py-1.5 rounded-full">
              Admin
            </span>
          </div>
        </div>

        {/* MOBILE NAV */}
        <div className="md:hidden flex gap-2 px-4 py-3 border-b border-stone-200 dark:border-white/[0.07] overflow-x-auto scrollbar-none">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs flex-shrink-0 border transition-all ${
                tab === item.id
                  ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400"
                  : "border-stone-200 dark:border-white/[0.1] text-stone-500 dark:text-stone-400"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-auto">
          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {[
                  {
                    icon: <Users size={14} />,
                    label: "Contestants",
                    value: "24",
                    delta: "+2 pending",
                    up: true,
                  },
                  {
                    icon: <Layers size={14} />,
                    label: "Active Stage",
                    value: "Stage 3",
                    delta: "Semi-Finals",
                    up: true,
                  },
                  {
                    icon: <TrendingUp size={14} />,
                    label: "Total Votes",
                    value: "18,450",
                    delta: "+312 today",
                    up: true,
                  },
                  {
                    icon: <CreditCard size={14} />,
                    label: "Revenue",
                    value: "₦1.85M",
                    delta: "+₦31,200 today",
                    up: true,
                  },
                  {
                    icon: <XCircle size={14} />,
                    label: "Eliminated",
                    value: "8",
                    delta: "Stage 1–2",
                    up: false,
                  },
                  {
                    icon: <CheckCircle2 size={14} />,
                    label: "Remaining",
                    value: "16",
                    delta: "In competition",
                    up: true,
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-stone-100 dark:bg-white/[0.04] border border-stone-200 dark:border-white/[0.08] rounded-xl p-4"
                  >
                    <div
                      className={`mb-2 ${s.up ? "text-yellow-600 dark:text-yellow-400" : "text-stone-400 dark:text-stone-500"}`}
                    >
                      {s.icon}
                    </div>
                    <div className="text-[11px] uppercase tracking-wide text-stone-400 dark:text-stone-500">
                      {s.label}
                    </div>
                    <div className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 my-1">
                      {s.value}
                    </div>
                    <div
                      className={`text-xs ${s.up ? "text-emerald-600 dark:text-emerald-400" : "text-stone-400 dark:text-stone-500"}`}
                    >
                      {s.delta}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Revenue chart */}
                <div className="bg-stone-100 dark:bg-white/[0.03] border border-stone-200 dark:border-white/[0.08] rounded-xl p-4">
                  <div className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-4">
                    Revenue by Stage
                  </div>
                  <div className="flex items-end gap-2 h-20">
                    {[
                      { s: "S1", v: 35 },
                      { s: "S2", v: 62 },
                      { s: "S3", v: 90 },
                      { s: "Finals", v: 20 },
                    ].map((b) => (
                      <div
                        key={b.s}
                        className="flex-1 flex flex-col items-center gap-1"
                      >
                        <div
                          className="w-full bg-yellow-500/40 dark:bg-yellow-400/40 hover:bg-yellow-500/70 dark:hover:bg-yellow-400/70 rounded-t transition-colors"
                          style={{ height: `${b.v}%` }}
                        />
                        <span className="text-[9px] text-stone-400 dark:text-stone-500">
                          {b.s}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-stone-400 dark:text-stone-500 mt-2">
                    ₦1,845,000 total collected
                  </div>
                </div>

                {/* Recent payments */}
                <div className="bg-stone-100 dark:bg-white/[0.03] border border-stone-200 dark:border-white/[0.08] rounded-xl p-4">
                  <div className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-3">
                    Recent Payments
                  </div>
                  <div className="flex flex-col divide-y divide-stone-200 dark:divide-white/[0.06]">
                    {PAYMENTS.slice(0, 4).map((p, i) => (
                      <div key={i} className="flex items-center gap-3 py-2.5">
                        <div className="w-8 h-8 rounded-full bg-purple-900/30 flex items-center justify-center text-xs text-yellow-500/70 dark:text-yellow-400/60 font-serif flex-shrink-0">
                          {p.contestant
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-stone-900 dark:text-stone-100 truncate">
                            For {p.contestant}
                          </div>
                          <div className="text-[10px] text-stone-400 dark:text-stone-500">
                            {p.votes} votes
                          </div>
                        </div>
                        <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          ₦{p.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── CONTESTANTS ── */}
          {tab === "contestants" && (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
                  All Contestants
                </div>
                <button className="text-xs text-yellow-600 dark:text-yellow-400 border border-yellow-500/30 px-3 py-1.5 rounded-full hover:bg-yellow-500/10 transition-colors">
                  + Add Contestant
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 dark:border-white/[0.07]">
                      {["Image", "#", "Name", "Votes", "Status", "Actions"].map((h) => (
                        <th
                          key={h}
                          className="text-left py-2.5 px-4 text-[11px] uppercase tracking-wide text-stone-400 dark:text-stone-500 font-normal"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CONTESTANTS.map((c) => (
                      <tr
                        key={c.num}
                        className="border-b border-stone-100 dark:border-white/[0.05] hover:bg-stone-100/70 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500/20 to-purple-500/20 border border-yellow-500/25 flex items-center justify-center font-serif text-[11px] font-bold text-yellow-700 dark:text-yellow-400">
                            {contestantInitials(c.name)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-stone-400 dark:text-stone-500">
                          #{c.num}
                        </td>
                        <td className="py-3 px-4 text-stone-900 dark:text-stone-100">
                          {c.name}
                        </td>
                        <td className="py-3 px-4 text-stone-600 dark:text-stone-300">
                          {c.votes.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">{statusBadge(c.status)}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {c.status === "pending" && (
                              <>
                                <button className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:opacity-75 transition-opacity">
                                  <CheckCircle2 size={11} /> Approve
                                </button>
                                <button className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded border border-red-200 dark:border-red-500/25 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:opacity-75 transition-opacity">
                                  <XCircle size={11} /> Reject
                                </button>
                              </>
                            )}
                            {c.status === "active" && (
                              <button className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded border border-red-200 dark:border-red-500/25 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:opacity-75 transition-opacity">
                                <XCircle size={11} /> Eliminate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── STAGES ── */}
          {tab === "stages" && (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
                  Competition Stages
                </div>
                <button className="text-xs text-yellow-600 dark:text-yellow-400 border border-yellow-500/30 px-3 py-1.5 rounded-full hover:bg-yellow-500/10 transition-colors">
                  + New Stage
                </button>
              </div>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 dark:border-white/[0.07]">
                      {[
                        "Stage",
                        "Name",
                        "Contestants",
                        "Votes",
                        "Status",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left py-2.5 px-4 text-[11px] uppercase tracking-wide text-stone-400 dark:text-stone-500 font-normal"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {STAGES.map((s) => (
                      <tr
                        key={s.n}
                        className="border-b border-stone-100 dark:border-white/[0.05] hover:bg-stone-100/70 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3 px-4 text-yellow-600 dark:text-yellow-400 font-medium">
                          Stage {s.n}
                        </td>
                        <td className="py-3 px-4 text-stone-900 dark:text-stone-100">
                          {s.name}
                        </td>
                        <td className="py-3 px-4 text-stone-600 dark:text-stone-300">
                          {s.contestants}
                        </td>
                        <td className="py-3 px-4 text-stone-600 dark:text-stone-300">
                          {s.votes.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">{statusBadge(s.status)}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {s.status === "live" && (
                              <>
                                <button className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded border border-yellow-300 dark:border-yellow-500/30 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 hover:opacity-75 transition-opacity">
                                  <Square size={11} /> End Stage
                                </button>
                                <button className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded border border-red-200 dark:border-red-500/25 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:opacity-75 transition-opacity">
                                  <Zap size={11} /> Auto-Eliminate
                                </button>
                              </>
                            )}
                            {s.status === "upcoming" && (
                              <button className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:opacity-75 transition-opacity">
                                <Play size={11} /> Start Stage
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-stone-100 dark:bg-white/[0.03] border border-stone-200 dark:border-white/[0.08] rounded-xl p-4">
                <div className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-2">
                  Stage 3 · Auto-Elimination Settings
                </div>
                <div className="text-sm text-stone-500 dark:text-stone-400 mb-4">
                  When stage ends, automatically eliminate the bottom{" "}
                  <strong className="text-stone-900 dark:text-stone-100">
                    4
                  </strong>{" "}
                  contestants by vote count.
                </div>
                <button className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg border border-red-200 dark:border-red-500/25 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:opacity-75 transition-opacity">
                  <Zap size={12} /> Run Auto-Eliminate Now
                </button>
              </div>
            </>
          )}

          {/* ── PAYMENTS ── */}
          {tab === "payments" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Total Revenue", value: "₦1,845,000" },
                  { label: "Today", value: "₦31,200" },
                  { label: "Transactions", value: "12,430" },
                  { label: "Avg per Txn", value: "₦148" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-stone-100 dark:bg-white/[0.04] border border-stone-200 dark:border-white/[0.08] rounded-xl p-4"
                  >
                    <div className="text-[11px] uppercase tracking-wide text-stone-400 dark:text-stone-500 mb-1">
                      {s.label}
                    </div>
                    <div className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
                  Payment Log
                </div>
                <button className="text-xs text-yellow-600 dark:text-yellow-400 border border-yellow-500/30 px-3 py-1.5 rounded-full hover:bg-yellow-500/10 transition-colors">
                  Export CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 dark:border-white/[0.07]">
                      {[
                        "Time",
                        "Voter",
                        "Contestant",
                        "Votes",
                        "Amount",
                        "Status",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left py-2.5 px-4 text-[11px] uppercase tracking-wide text-stone-400 dark:text-stone-500 font-normal"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PAYMENTS.map((p, i) => (
                      <tr
                        key={i}
                        className="border-b border-stone-100 dark:border-white/[0.05] hover:bg-stone-100/70 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3 px-4 text-stone-400 dark:text-stone-500 text-xs">
                          {p.time}
                        </td>
                        <td className="py-3 px-4 text-stone-600 dark:text-stone-300 text-xs">
                          {p.voter}
                        </td>
                        <td className="py-3 px-4 text-stone-900 dark:text-stone-100">
                          {p.contestant}
                        </td>
                        <td className="py-3 px-4 text-stone-600 dark:text-stone-300">
                          {p.votes}
                        </td>
                        <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-medium">
                          ₦{p.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded border uppercase tracking-wide font-medium ${
                              p.success
                                ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25"
                                : "bg-red-100 dark:bg-red-500/[0.08] text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20"
                            }`}
                          >
                            {p.success ? "Success" : "Failed"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
