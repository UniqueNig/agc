"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  CreditCard,
  Layers,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Pencil,
  Play,
  Settings,
  ShieldCheck,
  Square,
  TrendingUp,
  Trash2,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import ThemeToggle from "@/src/components/ui/ThemeToggle";
import ContestantMedia from "@/src/components/ui/ContestantMedia";
import {
  activateStage,
  createAdminUser,
  createContestant,
  createStage,
  deleteAdminUser,
  deleteContestant,
  fetchAdminDashboardData,
  updateAdminUser,
  updateContestant,
  updateStage,
  type AdminDashboardData,
} from "@/src/lib/graphql/api";
import {
  adminRoleOptions,
  formatAdminRole,
  hasAdminPermission,
  type AdminRole,
} from "@/src/lib/admin-permissions";
import {
  formatCurrency,
  formatStageLabel,
} from "@/src/lib/contestants";
import type {
  GraphQLAdminUser,
  ContestantStatus,
  GraphQLContestant,
  GraphQLStage,
  PaymentStatus,
} from "@/src/lib/graphql/types";

type Tab = "overview" | "contestants" | "stages" | "payments" | "admins";
type DerivedStageStatus = "ended" | "live" | "upcoming";

type ContestantFormState = {
  id: string;
  name: string;
  image: string;
  contestantNumber: string;
  stageId: string;
  status: ContestantStatus;
};

type StageFormState = {
  name: string;
  isActive: boolean;
};

type AdminFormState = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: AdminRole;
};

const AUTO_ELIMINATE_COUNT = 4;

const pageTitles: Record<Tab, string> = {
  overview: "Overview",
  contestants: "Manage Contestants",
  stages: "Manage Stages",
  payments: "Payment Logs",
  admins: "Admin Users",
};

const emptyContestantForm = (): ContestantFormState => ({
  id: "",
  name: "",
  image: "",
  contestantNumber: "",
  stageId: "",
  status: "pending",
});

const emptyStageForm = (): StageFormState => ({
  name: "",
  isActive: false,
});

const emptyAdminForm = (): AdminFormState => ({
  id: "",
  name: "",
  email: "",
  password: "",
  role: "viewer",
});

const statusBadge = (
  status: ContestantStatus | DerivedStageStatus | PaymentStatus
) => {
  const map: Record<typeof status, string> = {
    active:
      "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25",
    live: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25",
    success:
      "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25",
    pending:
      "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/25",
    upcoming:
      "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/25",
    eliminated:
      "bg-red-100 dark:bg-red-500/[0.08] text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20",
    failed:
      "bg-red-100 dark:bg-red-500/[0.08] text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20",
    ended:
      "bg-stone-100 dark:bg-white/[0.05] text-stone-500 dark:text-stone-400 border-stone-200 dark:border-white/[0.1]",
  };

  const label: Record<typeof status, string> = {
    active: "Active",
    live: "Live",
    success: "Success",
    pending: "Pending",
    upcoming: "Upcoming",
    eliminated: "Eliminated",
    failed: "Failed",
    ended: "Ended",
  };

  return (
    <span
      className={`rounded border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${map[status]}`}
    >
      {label[status]}
    </span>
  );
};

const roleBadge = (role: AdminRole) => {
  const palette: Record<AdminRole, string> = {
    super_admin:
      "border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    contestant_manager:
      "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400",
    stage_manager:
      "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-400",
    finance_admin:
      "border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-500/25 dark:bg-purple-500/10 dark:text-purple-400",
    viewer:
      "border-stone-200 bg-stone-100 text-stone-600 dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-stone-400",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${palette[role]}`}
    >
      {formatAdminRole(role)}
    </span>
  );
};

const getStageStatus = (
  stage: GraphQLStage,
  index: number,
  activeStageIndex: number
): DerivedStageStatus => {
  if (stage.isActive) {
    return "live";
  }

  if (activeStageIndex === -1) {
    return stage.contestantCount || stage.totalVotes ? "ended" : "upcoming";
  }

  return index > activeStageIndex ? "upcoming" : "ended";
};

const formatPaymentTime = (value: string) =>
  new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const escapeCsvValue = (value: string | number) =>
  `"${String(value).replaceAll('"', '""')}"`;

const buildContestantFormFromRecord = (
  contestant: GraphQLContestant
): ContestantFormState => ({
  id: contestant.id,
  name: contestant.name,
  image: contestant.image ?? "",
  contestantNumber: contestant.contestantNumber,
  stageId: contestant.stageId ?? contestant.stage?.id ?? "",
  status: contestant.status,
});

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isContestantFormOpen, setIsContestantFormOpen] = useState(false);
  const [contestantForm, setContestantForm] = useState(emptyContestantForm());
  const [contestantSubmitting, setContestantSubmitting] = useState(false);
  const [contestantImageFile, setContestantImageFile] = useState<File | null>(
    null
  );
  const [contestantImagePreview, setContestantImagePreview] = useState("");
  const [isStageFormOpen, setIsStageFormOpen] = useState(false);
  const [stageForm, setStageForm] = useState(emptyStageForm());
  const [stageSubmitting, setStageSubmitting] = useState(false);
  const [isAdminFormOpen, setIsAdminFormOpen] = useState(false);
  const [adminForm, setAdminForm] = useState(emptyAdminForm());
  const [adminSubmitting, setAdminSubmitting] = useState(false);
  const [busyActionId, setBusyActionId] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const refreshDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetchAdminDashboardData();
      setData(response);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "We could not load the admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshDashboard();
  }, []);

  useEffect(() => {
    if (!contestantImageFile) {
      setContestantImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(contestantImageFile);
    setContestantImagePreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [contestantImageFile]);

  const currentAdmin = data?.currentAdmin ?? null;
  const adminUsers = data?.adminUsers ?? [];
  const contestants = (data?.contestants ?? []).slice().sort((first, second) => {
    return Number(first.contestantNumber) - Number(second.contestantNumber);
  });
  const stages = (data?.stages ?? []).slice().sort((first, second) => {
    return (
      new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime()
    );
  });
  const payments = data?.payments ?? [];
  const activeStage = stages.find((stage) => stage.isActive) ?? null;
  const activeStageIndex = stages.findIndex((stage) => stage.isActive);
  const activeContestants = contestants.filter(
    (contestant) => contestant.status === "active"
  );
  const pendingContestants = contestants.filter(
    (contestant) => contestant.status === "pending"
  );
  const eliminatedContestants = contestants.filter(
    (contestant) => contestant.status === "eliminated"
  );
  const successfulPayments = payments.filter(
    (payment) => payment.status === "success"
  );
  const totalVotes = contestants.reduce(
    (sum, contestant) => sum + contestant.totalVotes,
    0
  );
  const totalRevenue = successfulPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todaysSuccessfulPayments = successfulPayments.filter(
    (payment) => new Date(payment.createdAt).getTime() >= todayStart.getTime()
  );
  const todaysRevenue = todaysSuccessfulPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );
  const averageTransactionValue = successfulPayments.length
    ? Math.round(totalRevenue / successfulPayments.length)
    : 0;
  const recentPayments = payments.slice(0, 4);
  const maxStageRevenue = Math.max(...stages.map((stage) => stage.totalVotes), 1);
  const canManageContestants = currentAdmin
    ? hasAdminPermission(currentAdmin.role, "manage_contestants")
    : false;
  const canManageStages = currentAdmin
    ? hasAdminPermission(currentAdmin.role, "manage_stages")
    : false;
  const canManagePayments = currentAdmin
    ? hasAdminPermission(currentAdmin.role, "manage_payments")
    : false;
  const canManageAdmins = currentAdmin
    ? hasAdminPermission(currentAdmin.role, "manage_admins")
    : false;

  const navItems = [
    { id: "overview" as const, label: "Overview", icon: LayoutDashboard, visible: true },
    {
      id: "contestants" as const,
      label: "Contestants",
      icon: Users,
      visible: canManageContestants,
    },
    {
      id: "stages" as const,
      label: "Stages",
      icon: Layers,
      visible: canManageStages,
    },
    {
      id: "payments" as const,
      label: "Payments",
      icon: CreditCard,
      visible: canManagePayments,
    },
    {
      id: "admins" as const,
      label: "Admins",
      icon: ShieldCheck,
      visible: canManageAdmins,
    },
  ].filter((item) => item.visible);

  useEffect(() => {
    if (!loading && navItems.length && !navItems.some((item) => item.id === tab)) {
      setTab("overview");
    }
  }, [loading, navItems, tab]);

  const resetContestantForm = () => {
    setContestantForm(emptyContestantForm());
    setContestantImageFile(null);
    setIsContestantFormOpen(false);
    setContestantSubmitting(false);
  };

  const resetStageForm = () => {
    setStageForm(emptyStageForm());
    setIsStageFormOpen(false);
    setStageSubmitting(false);
  };

  const resetAdminForm = () => {
    setAdminForm(emptyAdminForm());
    setIsAdminFormOpen(false);
    setAdminSubmitting(false);
  };

  const openCreateContestantForm = () => {
    setContestantForm({
      ...emptyContestantForm(),
      stageId: activeStage?.id ?? "",
    });
    setContestantImageFile(null);
    setIsContestantFormOpen(true);
  };

  const openEditContestantForm = (contestant: GraphQLContestant) => {
    setContestantForm(buildContestantFormFromRecord(contestant));
    setContestantImageFile(null);
    setIsContestantFormOpen(true);
  };

  const uploadContestantImage = async (file: File) => {
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    const response = await fetch("/api/uploads/contestant-image", {
      method: "POST",
      body: uploadFormData,
    });

    const payload = (await response.json()) as {
      url?: string;
      message?: string;
    };

    if (!response.ok || !payload.url) {
      throw new Error(payload.message ?? "Unable to upload contestant image.");
    }

    return payload.url;
  };

  const openCreateAdminForm = () => {
    setAdminForm(emptyAdminForm());
    setIsAdminFormOpen(true);
  };

  const openEditAdminForm = (adminUser: GraphQLAdminUser) => {
    setAdminForm({
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      password: "",
      role: adminUser.role,
    });
    setIsAdminFormOpen(true);
  };

  const handleContestantSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setContestantSubmitting(true);
    setError("");
    setNotice("");

    try {
      const contestantNumber = contestantForm.contestantNumber
        .trim()
        .padStart(2, "0");

      if (!contestantForm.name.trim() || !contestantNumber) {
        throw new Error("Name and contestant number are required.");
      }

      const uploadedImageUrl = contestantImageFile
        ? await uploadContestantImage(contestantImageFile)
        : contestantForm.image.trim() || undefined;

      if (contestantForm.id) {
        await updateContestant(contestantForm.id, {
          name: contestantForm.name.trim(),
          image: uploadedImageUrl,
          contestantNumber,
          stageId: contestantForm.stageId || null,
          status: contestantForm.status,
        });
        setNotice("Contestant updated successfully.");
      } else {
        await createContestant({
          name: contestantForm.name.trim(),
          image: uploadedImageUrl,
          contestantNumber,
          stageId: contestantForm.stageId || undefined,
          status: contestantForm.status,
        });
        setNotice("Contestant created successfully.");
      }

      await refreshDashboard();
      resetContestantForm();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save contestant."
      );
      setContestantSubmitting(false);
    }
  };

  const handleApproveContestant = async (contestant: GraphQLContestant) => {
    setBusyActionId(`approve-${contestant.id}`);
    setError("");
    setNotice("");

    try {
      await updateContestant(contestant.id, {
        status: "active",
        stageId: contestant.stageId ?? activeStage?.id ?? null,
      });
      setNotice(`${contestant.name} has been approved.`);
      await refreshDashboard();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Unable to approve contestant."
      );
    } finally {
      setBusyActionId("");
    }
  };

  const handleRejectContestant = async (contestant: GraphQLContestant) => {
    if (!window.confirm(`Reject ${contestant.name} and remove this entry?`)) {
      return;
    }

    setBusyActionId(`reject-${contestant.id}`);
    setError("");
    setNotice("");

    try {
      await deleteContestant(contestant.id);
      setNotice(`${contestant.name} has been rejected.`);
      await refreshDashboard();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Unable to reject contestant."
      );
    } finally {
      setBusyActionId("");
    }
  };

  const handleEliminateContestant = async (contestant: GraphQLContestant) => {
    if (!window.confirm(`Eliminate ${contestant.name} from the competition?`)) {
      return;
    }

    setBusyActionId(`eliminate-${contestant.id}`);
    setError("");
    setNotice("");

    try {
      await updateContestant(contestant.id, {
        status: "eliminated",
      });
      setNotice(`${contestant.name} has been eliminated.`);
      await refreshDashboard();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Unable to eliminate contestant."
      );
    } finally {
      setBusyActionId("");
    }
  };
  const handleRestoreContestant = async (contestant: GraphQLContestant) => {
    setBusyActionId(`restore-${contestant.id}`);
    setError("");
    setNotice("");

    try {
      await updateContestant(contestant.id, {
        status: "active",
        stageId: contestant.stageId ?? activeStage?.id ?? null,
      });
      setNotice(`${contestant.name} has been restored.`);
      await refreshDashboard();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Unable to restore contestant."
      );
    } finally {
      setBusyActionId("");
    }
  };

  const handleStageSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStageSubmitting(true);
    setError("");
    setNotice("");

    try {
      if (!stageForm.name.trim()) {
        throw new Error("Stage name is required.");
      }

      await createStage({
        name: stageForm.name.trim(),
        isActive: stageForm.isActive,
      });
      setNotice("Stage created successfully.");
      await refreshDashboard();
      resetStageForm();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create stage."
      );
      setStageSubmitting(false);
    }
  };

  const handleStartStage = async (stage: GraphQLStage) => {
    setBusyActionId(`start-${stage.id}`);
    setError("");
    setNotice("");

    try {
      await activateStage(stage.id);
      setNotice(`${stage.name} is now live.`);
      await refreshDashboard();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Unable to start stage."
      );
    } finally {
      setBusyActionId("");
    }
  };

  const handleEndStage = async (stage: GraphQLStage) => {
    if (!window.confirm(`End ${stage.name} and stop live voting for this stage?`)) {
      return;
    }

    setBusyActionId(`end-${stage.id}`);
    setError("");
    setNotice("");

    try {
      await updateStage(stage.id, { isActive: false });
      setNotice(`${stage.name} has been ended.`);
      await refreshDashboard();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Unable to end stage."
      );
    } finally {
      setBusyActionId("");
    }
  };

  const handleAutoEliminate = async () => {
    if (!activeStage) {
      setError("Start a stage before running auto-eliminate.");
      return;
    }

    const stageContestants = contestants
      .filter(
        (contestant) =>
          contestant.stageId === activeStage.id && contestant.status === "active"
      )
      .slice()
      .sort((first, second) => {
        if (first.totalVotes === second.totalVotes) {
          return Number(first.contestantNumber) - Number(second.contestantNumber);
        }

        return first.totalVotes - second.totalVotes;
      });

    const contestantsToEliminate = stageContestants.slice(
      0,
      Math.min(AUTO_ELIMINATE_COUNT, stageContestants.length)
    );

    if (!contestantsToEliminate.length) {
      setError("There are no active contestants available to eliminate.");
      return;
    }

    if (
      !window.confirm(
        `Auto-eliminate ${contestantsToEliminate.length} contestant(s) from ${activeStage.name}?`
      )
    ) {
      return;
    }

    setBusyActionId("auto-eliminate");
    setError("");
    setNotice("");

    try {
      await Promise.all(
        contestantsToEliminate.map((contestant) =>
          updateContestant(contestant.id, { status: "eliminated" })
        )
      );
      setNotice(
        `${contestantsToEliminate.length} contestant(s) were auto-eliminated from ${activeStage.name}.`
      );
      await refreshDashboard();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Unable to auto-eliminate contestants."
      );
    } finally {
      setBusyActionId("");
    }
  };

  const handleExportPayments = () => {
    const header = [
      "Reference",
      "Created At",
      "Email",
      "Contestant",
      "Votes",
      "Amount",
      "Status",
    ];
    const rows = payments.map((payment) => [
      payment.reference,
      payment.createdAt,
      payment.email,
      payment.contestant?.name ?? "Unknown contestant",
      payment.votes,
      payment.amount,
      payment.status,
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gospelagc-payments-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleVerifyPayment = async (reference: string) => {
    setBusyActionId(`payment-${reference}`);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reference }),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to verify payment.");
      }

      setNotice(`Payment ${reference} has been confirmed successfully.`);
      await refreshDashboard();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Unable to verify payment."
      );
    } finally {
      setBusyActionId("");
    }
  };

  const handleAdminSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAdminSubmitting(true);
    setError("");
    setNotice("");

    try {
      if (!adminForm.name.trim() || !adminForm.email.trim()) {
        throw new Error("Name and email are required.");
      }

      if (!adminForm.id && adminForm.password.trim().length < 8) {
        throw new Error("Password must be at least 8 characters long.");
      }

      if (adminForm.id) {
        await updateAdminUser(adminForm.id, {
          name: adminForm.name.trim(),
          email: adminForm.email.trim().toLowerCase(),
          password: adminForm.password.trim() || undefined,
          role: adminForm.role,
        });
        setNotice(`${adminForm.name.trim()} was updated successfully.`);
      } else {
        await createAdminUser({
          name: adminForm.name.trim(),
          email: adminForm.email.trim().toLowerCase(),
          password: adminForm.password.trim(),
          role: adminForm.role,
        });
        setNotice(`${adminForm.name.trim()} was created successfully.`);
      }

      await refreshDashboard();
      resetAdminForm();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save admin user."
      );
      setAdminSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (adminUser: GraphQLAdminUser) => {
    if (
      !window.confirm(`Remove ${adminUser.name || adminUser.email} from admin access?`)
    ) {
      return;
    }

    setBusyActionId(`delete-admin-${adminUser.id}`);
    setError("");
    setNotice("");

    try {
      await deleteAdminUser(adminUser.id);
      setNotice(`${adminUser.name || adminUser.email} was removed.`);
      await refreshDashboard();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Unable to delete admin user."
      );
    } finally {
      setBusyActionId("");
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-stone-50 text-stone-900 transition-colors duration-300 dark:bg-[#08050f] dark:text-stone-100">
      <aside className="hidden w-52 flex-shrink-0 flex-col gap-1 border-r border-stone-200 p-4 dark:border-white/[0.07] md:flex">
        <div className="mb-3 border-b border-stone-200 px-3 pb-4 font-serif text-base font-bold text-yellow-600 dark:border-white/[0.07] dark:text-yellow-400">
          GospelAGC
          <span className="mt-0.5 block font-sans text-[10px] font-normal tracking-wide text-stone-400 dark:text-stone-500">
            Admin Panel
          </span>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition-all ${
                tab === item.id
                  ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                  : "border-transparent text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-white/[0.05] dark:hover:text-stone-100"
              }`}
            >
              <Icon size={15} />
              {item.label}
            </button>
          );
        })}
        <div className="mt-auto border-t border-stone-200 pt-4 dark:border-white/[0.07]">
          <button className="flex w-full items-center gap-2.5 rounded-xl border border-transparent px-3 py-2.5 text-left text-sm text-stone-500 transition-colors hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-white/[0.05]">
            <Settings size={15} />
            Settings
          </button>
          <button
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className="mt-1 flex w-full items-center gap-2.5 rounded-xl border border-transparent px-3 py-2.5 text-left text-sm text-red-500 transition-colors hover:bg-red-50 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            <LogOut size={15} />
            {loggingOut ? "Signing out..." : "Logout"}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-stone-50/90 px-6 py-4 backdrop-blur-md dark:border-white/[0.07] dark:bg-[#08050f]/90">
          <div>
            <div className="text-base font-medium text-stone-900 dark:text-stone-100">
              {pageTitles[tab]}
            </div>
            <div className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">
              {currentAdmin?.email
                ? `${currentAdmin.email} / ${formatAdminRole(currentAdmin.role)}`
                : "Season 1 / Abeokuta Gospel AGC"}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-xs text-yellow-600 dark:text-yellow-400">
              {currentAdmin ? formatAdminRole(currentAdmin.role) : "Admin"}
            </span>
            <button
              onClick={() => void handleLogout()}
              disabled={loggingOut}
              className="rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-600 transition-colors hover:border-red-300 hover:text-red-500 disabled:opacity-60 dark:border-white/[0.1] dark:text-stone-300 dark:hover:border-red-500/30 dark:hover:text-red-400"
            >
              {loggingOut ? "Signing out..." : "Logout"}
            </button>
          </div>
        </div>

        <div className="scrollbar-none flex gap-2 overflow-x-auto border-b border-stone-200 px-4 py-3 dark:border-white/[0.07] md:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all ${
                  tab === item.id
                    ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                    : "border-stone-200 text-stone-500 dark:border-white/[0.1] dark:text-stone-400"
                }`}
              >
                <Icon size={14} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="overflow-auto p-6">
          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          )}

          {notice && (
            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
              {notice}
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-stone-200 bg-stone-100 dark:border-white/[0.08] dark:bg-white/[0.03]">
              <div className="flex items-center gap-3 text-sm text-stone-500 dark:text-stone-400">
                <LoaderCircle size={18} className="animate-spin" />
                Loading dashboard data...
              </div>
            </div>
          ) : (
            <>
              {tab === "overview" && (
                <>
                  <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                    {[
                      {
                        icon: <Users size={14} />,
                        label: "Contestants",
                        value: contestants.length.toLocaleString(),
                        delta: pendingContestants.length
                          ? `${pendingContestants.length} pending`
                          : "All reviewed",
                        up: true,
                      },
                      {
                        icon: <Layers size={14} />,
                        label: "Active Stage",
                        value: activeStage ? formatStageLabel(activeStageIndex) : "None",
                        delta: activeStage?.name ?? "Waiting to begin",
                        up: true,
                      },
                      {
                        icon: <TrendingUp size={14} />,
                        label: "Total Votes",
                        value: totalVotes.toLocaleString(),
                        delta: `${todaysSuccessfulPayments.length} payments today`,
                        up: true,
                      },
                      {
                        icon: <CreditCard size={14} />,
                        label: "Revenue",
                        value: formatCurrency(totalRevenue),
                        delta: `+${formatCurrency(todaysRevenue)} today`,
                        up: true,
                      },
                      {
                        icon: <XCircle size={14} />,
                        label: "Eliminated",
                        value: eliminatedContestants.length.toLocaleString(),
                        delta: "Across all stages",
                        up: false,
                      },
                      {
                        icon: <CheckCircle2 size={14} />,
                        label: "Remaining",
                        value: activeContestants.length.toLocaleString(),
                        delta: "In competition",
                        up: true,
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-xl border border-stone-200 bg-stone-100 p-4 dark:border-white/[0.08] dark:bg-white/[0.04]"
                      >
                        <div
                          className={`mb-2 ${
                            stat.up
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-stone-400 dark:text-stone-500"
                          }`}
                        >
                          {stat.icon}
                        </div>
                        <div className="text-[11px] uppercase tracking-wide text-stone-400 dark:text-stone-500">
                          {stat.label}
                        </div>
                        <div className="my-1 font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                          {stat.value}
                        </div>
                        <div
                          className={`text-xs ${
                            stat.up
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-stone-400 dark:text-stone-500"
                          }`}
                        >
                          {stat.delta}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-stone-200 bg-stone-100 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
                      <div className="mb-4 text-sm font-medium text-stone-900 dark:text-stone-100">
                        Revenue by Stage
                      </div>
                      <div className="flex h-20 items-end gap-2">
                        {stages.map((stage, index) => (
                          <div
                            key={stage.id}
                            className="flex flex-1 flex-col items-center gap-1"
                          >
                            <div
                              className="w-full rounded-t bg-yellow-500/40 transition-colors hover:bg-yellow-500/70 dark:bg-yellow-400/40 dark:hover:bg-yellow-400/70"
                              style={{
                                height: `${Math.max(
                                  12,
                                  Math.round((stage.totalVotes / maxStageRevenue) * 100)
                                )}%`,
                              }}
                            />
                            <span className="text-[9px] text-stone-400 dark:text-stone-500">
                              {formatStageLabel(index).replace("Stage ", "S")}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 text-xs text-stone-400 dark:text-stone-500">
                        {formatCurrency(totalRevenue)} total collected
                      </div>
                    </div>

                    <div className="rounded-xl border border-stone-200 bg-stone-100 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
                      <div className="mb-3 text-sm font-medium text-stone-900 dark:text-stone-100">
                        Recent Payments
                      </div>
                      <div className="flex flex-col divide-y divide-stone-200 dark:divide-white/[0.06]">
                        {recentPayments.length ? (
                          recentPayments.map((payment) => (
                            <div
                              key={payment.id}
                              className="flex items-center gap-3 py-2.5"
                            >
                              <ContestantMedia
                                name={payment.contestant?.name ?? "Unknown"}
                                imageSrc={payment.contestant?.image}
                                index={0}
                                className="h-8 w-8 flex-shrink-0 rounded-full"
                                sizes="32px"
                                fallbackClassName="font-serif text-xs text-yellow-500/70 dark:text-yellow-400/60"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-xs text-stone-900 dark:text-stone-100">
                                  For {payment.contestant?.name ?? "Unknown contestant"}
                                </div>
                                <div className="text-[10px] text-stone-400 dark:text-stone-500">
                                  {payment.votes} votes
                                </div>
                              </div>
                              <div
                                className={`text-xs font-medium ${
                                  payment.status === "success"
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : payment.status === "failed"
                                      ? "text-red-500 dark:text-red-400"
                                      : "text-yellow-600 dark:text-yellow-400"
                                }`}
                              >
                                {formatCurrency(payment.amount)}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-6 text-sm text-stone-400 dark:text-stone-500">
                            No payment activity yet.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {tab === "contestants" && (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
                      All Contestants
                    </div>
                    <button
                      onClick={openCreateContestantForm}
                      className="rounded-full border border-yellow-500/30 px-3 py-1.5 text-xs text-yellow-600 transition-colors hover:bg-yellow-500/10 dark:text-yellow-400"
                    >
                      + Add Contestant
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-stone-200 dark:border-white/[0.07]">
                          {["Image", "#", "Name", "Votes", "Status", "Actions"].map(
                            (heading) => (
                              <th
                                key={heading}
                                className="px-4 py-2.5 text-left text-[11px] font-normal uppercase tracking-wide text-stone-400 dark:text-stone-500"
                              >
                                {heading}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {contestants.map((contestant) => (
                          <tr
                            key={contestant.id}
                            className="border-b border-stone-100 transition-colors hover:bg-stone-100/70 dark:border-white/[0.05] dark:hover:bg-white/[0.02]"
                          >
                            <td className="px-4 py-3">
                              <ContestantMedia
                                name={contestant.name}
                                imageSrc={contestant.image}
                                index={Number(contestant.contestantNumber) || 0}
                                className="h-10 w-10 rounded-full border border-yellow-500/25"
                                sizes="40px"
                                fallbackClassName="font-serif text-[11px] font-bold text-yellow-700 dark:text-yellow-400"
                              />
                            </td>
                            <td className="px-4 py-3 text-stone-400 dark:text-stone-500">
                              #{contestant.contestantNumber}
                            </td>
                            <td className="px-4 py-3 text-stone-900 dark:text-stone-100">
                              <div className="font-medium">{contestant.name}</div>
                              <div className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">
                                {contestant.stage?.name ?? "No stage assigned"}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                              {contestant.totalVotes.toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                              {statusBadge(contestant.status)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => openEditContestantForm(contestant)}
                                  className="flex items-center gap-1 rounded border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] text-stone-600 transition-opacity hover:opacity-75 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-stone-300"
                                >
                                  <Pencil size={11} /> Edit
                                </button>

                                {contestant.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        void handleApproveContestant(contestant)
                                      }
                                      disabled={
                                        busyActionId === `approve-${contestant.id}`
                                      }
                                      className="flex items-center gap-1 rounded border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-700 transition-opacity hover:opacity-75 disabled:opacity-60 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"
                                    >
                                      <CheckCircle2 size={11} /> Approve
                                    </button>
                                    <button
                                      onClick={() =>
                                        void handleRejectContestant(contestant)
                                      }
                                      disabled={
                                        busyActionId === `reject-${contestant.id}`
                                      }
                                      className="flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] text-red-600 transition-opacity hover:opacity-75 disabled:opacity-60 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-400"
                                    >
                                      <XCircle size={11} /> Reject
                                    </button>
                                  </>
                                )}

                                {contestant.status === "active" && (
                                  <button
                                    onClick={() =>
                                      void handleEliminateContestant(contestant)
                                    }
                                    disabled={
                                      busyActionId === `eliminate-${contestant.id}`
                                    }
                                    className="flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] text-red-600 transition-opacity hover:opacity-75 disabled:opacity-60 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-400"
                                  >
                                    <XCircle size={11} /> Eliminate
                                  </button>
                                )}

                                {contestant.status === "eliminated" && (
                                  <button
                                    onClick={() =>
                                      void handleRestoreContestant(contestant)
                                    }
                                    disabled={
                                      busyActionId === `restore-${contestant.id}`
                                    }
                                    className="flex items-center gap-1 rounded border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-700 transition-opacity hover:opacity-75 disabled:opacity-60 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"
                                  >
                                    <CheckCircle2 size={11} /> Restore
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

              {tab === "stages" && (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
                      Competition Stages
                    </div>
                    <button
                      onClick={() => setIsStageFormOpen(true)}
                      className="rounded-full border border-yellow-500/30 px-3 py-1.5 text-xs text-yellow-600 transition-colors hover:bg-yellow-500/10 dark:text-yellow-400"
                    >
                      + New Stage
                    </button>
                  </div>
                  <div className="mb-6 overflow-x-auto">
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
                          ].map((heading) => (
                            <th
                              key={heading}
                              className="px-4 py-2.5 text-left text-[11px] font-normal uppercase tracking-wide text-stone-400 dark:text-stone-500"
                            >
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {stages.map((stage, index) => {
                          const stageStatus = getStageStatus(
                            stage,
                            index,
                            activeStageIndex
                          );

                          return (
                            <tr
                              key={stage.id}
                              className="border-b border-stone-100 transition-colors hover:bg-stone-100/70 dark:border-white/[0.05] dark:hover:bg-white/[0.02]"
                            >
                              <td className="px-4 py-3 font-medium text-yellow-600 dark:text-yellow-400">
                                {formatStageLabel(index)}
                              </td>
                              <td className="px-4 py-3 text-stone-900 dark:text-stone-100">
                                {stage.name}
                              </td>
                              <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                                {stage.contestantCount}
                              </td>
                              <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                                {stage.totalVotes.toLocaleString()}
                              </td>
                              <td className="px-4 py-3">
                                {statusBadge(stageStatus)}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-2">
                                  {stageStatus === "live" && (
                                    <>
                                      <button
                                        onClick={() => void handleEndStage(stage)}
                                        disabled={busyActionId === `end-${stage.id}`}
                                        className="flex items-center gap-1 rounded border border-yellow-300 bg-yellow-50 px-2.5 py-1 text-[11px] text-yellow-700 transition-opacity hover:opacity-75 disabled:opacity-60 dark:border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-400"
                                      >
                                        <Square size={11} /> End Stage
                                      </button>
                                      <button
                                        onClick={() => void handleAutoEliminate()}
                                        disabled={busyActionId === "auto-eliminate"}
                                        className="flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] text-red-600 transition-opacity hover:opacity-75 disabled:opacity-60 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-400"
                                      >
                                        <Zap size={11} /> Auto-Eliminate
                                      </button>
                                    </>
                                  )}
                                  {stageStatus === "upcoming" && (
                                    <button
                                      onClick={() => void handleStartStage(stage)}
                                      disabled={busyActionId === `start-${stage.id}`}
                                      className="flex items-center gap-1 rounded border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-700 transition-opacity hover:opacity-75 disabled:opacity-60 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"
                                    >
                                      <Play size={11} /> Start Stage
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="rounded-xl border border-stone-200 bg-stone-100 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
                    <div className="mb-2 text-sm font-medium text-stone-900 dark:text-stone-100">
                      {activeStage
                        ? `${activeStage.name} Auto-Elimination Settings`
                        : "Auto-Elimination Settings"}
                    </div>
                    <div className="mb-4 text-sm text-stone-500 dark:text-stone-400">
                      When a live stage ends, automatically eliminate the bottom{" "}
                      <strong className="text-stone-900 dark:text-stone-100">
                        {AUTO_ELIMINATE_COUNT}
                      </strong>{" "}
                      contestants by vote count.
                    </div>
                    <button
                      onClick={() => void handleAutoEliminate()}
                      disabled={busyActionId === "auto-eliminate" || !activeStage}
                      className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600 transition-opacity hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-400"
                    >
                      <Zap size={12} /> Run Auto-Eliminate Now
                    </button>
                  </div>
                </>
              )}

              {tab === "payments" && (
                <>
                  <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {[
                      {
                        label: "Total Revenue",
                        value: formatCurrency(totalRevenue),
                      },
                      {
                        label: "Today",
                        value: formatCurrency(todaysRevenue),
                      },
                      {
                        label: "Transactions",
                        value: payments.length.toLocaleString(),
                      },
                      {
                        label: "Avg per Txn",
                        value: formatCurrency(averageTransactionValue),
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-xl border border-stone-200 bg-stone-100 p-4 dark:border-white/[0.08] dark:bg-white/[0.04]"
                      >
                        <div className="mb-1 text-[11px] uppercase tracking-wide text-stone-400 dark:text-stone-500">
                          {stat.label}
                        </div>
                        <div className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
                      Payment Log
                    </div>
                    <button
                      onClick={handleExportPayments}
                      className="rounded-full border border-yellow-500/30 px-3 py-1.5 text-xs text-yellow-600 transition-colors hover:bg-yellow-500/10 dark:text-yellow-400"
                    >
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
                            "Actions",
                          ].map((heading) => (
                            <th
                              key={heading}
                              className="px-4 py-2.5 text-left text-[11px] font-normal uppercase tracking-wide text-stone-400 dark:text-stone-500"
                            >
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => (
                          <tr
                            key={payment.id}
                            className="border-b border-stone-100 transition-colors hover:bg-stone-100/70 dark:border-white/[0.05] dark:hover:bg-white/[0.02]"
                          >
                            <td className="px-4 py-3 text-xs text-stone-400 dark:text-stone-500">
                              {formatPaymentTime(payment.createdAt)}
                            </td>
                            <td className="px-4 py-3 text-xs text-stone-600 dark:text-stone-300">
                              {payment.email}
                            </td>
                            <td className="px-4 py-3 text-stone-900 dark:text-stone-100">
                              {payment.contestant?.name ?? "Unknown contestant"}
                            </td>
                            <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                              {payment.votes}
                            </td>
                            <td
                              className={`px-4 py-3 font-medium ${
                                payment.status === "success"
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : payment.status === "failed"
                                    ? "text-red-500 dark:text-red-400"
                                    : "text-yellow-600 dark:text-yellow-400"
                              }`}
                            >
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="px-4 py-3">
                              {statusBadge(payment.status)}
                            </td>
                            <td className="px-4 py-3">
                              {payment.status === "pending" ? (
                                <button
                                  onClick={() =>
                                    void handleVerifyPayment(payment.reference)
                                  }
                                  disabled={
                                    busyActionId === `payment-${payment.reference}`
                                  }
                                  className="rounded-full border border-yellow-500/30 px-3 py-1 text-[11px] text-yellow-600 transition-colors hover:bg-yellow-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:text-yellow-400"
                                >
                                  {busyActionId === `payment-${payment.reference}`
                                    ? "Checking..."
                                    : "Verify"}
                                </button>
                              ) : (
                                <span className="text-[11px] text-stone-400 dark:text-stone-500">
                                  -
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {tab === "admins" && (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
                      Admin Team
                    </div>
                    <button
                      onClick={openCreateAdminForm}
                      className="rounded-full border border-yellow-500/30 px-3 py-1.5 text-xs text-yellow-600 transition-colors hover:bg-yellow-500/10 dark:text-yellow-400"
                    >
                      + Add Admin
                    </button>
                  </div>
                  <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {[
                      {
                        label: "Total Admins",
                        value: adminUsers.length.toLocaleString(),
                      },
                      {
                        label: "Super Admins",
                        value: adminUsers
                          .filter((adminUser) => adminUser.role === "super_admin")
                          .length.toLocaleString(),
                      },
                      {
                        label: "Managers",
                        value: adminUsers
                          .filter((adminUser) => adminUser.role !== "viewer")
                          .length.toLocaleString(),
                      },
                      {
                        label: "Signed In As",
                        value: currentAdmin
                          ? formatAdminRole(currentAdmin.role)
                          : "Admin",
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-xl border border-stone-200 bg-stone-100 p-4 dark:border-white/[0.08] dark:bg-white/[0.04]"
                      >
                        <div className="mb-1 text-[11px] uppercase tracking-wide text-stone-400 dark:text-stone-500">
                          {stat.label}
                        </div>
                        <div className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-stone-200 dark:border-white/[0.07]">
                          {["Name", "Email", "Role", "Source", "Actions"].map(
                            (heading) => (
                              <th
                                key={heading}
                                className="px-4 py-2.5 text-left text-[11px] font-normal uppercase tracking-wide text-stone-400 dark:text-stone-500"
                              >
                                {heading}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {adminUsers.map((adminUser) => (
                          <tr
                            key={adminUser.id}
                            className="border-b border-stone-100 transition-colors hover:bg-stone-100/70 dark:border-white/[0.05] dark:hover:bg-white/[0.02]"
                          >
                            <td className="px-4 py-3 text-stone-900 dark:text-stone-100">
                              <div className="font-medium">
                                {adminUser.name || "Unnamed Admin"}
                              </div>
                              <div className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">
                                {currentAdmin?.id === adminUser.id
                                  ? "Current account"
                                  : "Managed account"}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                              {adminUser.email}
                            </td>
                            <td className="px-4 py-3">{roleBadge(adminUser.role)}</td>
                            <td className="px-4 py-3 text-xs text-stone-400 dark:text-stone-500">
                              {adminUser.isEnvironment ? "Environment" : "Database"}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => openEditAdminForm(adminUser)}
                                  className="flex items-center gap-1 rounded border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] text-stone-600 transition-opacity hover:opacity-75 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-stone-300"
                                >
                                  <Pencil size={11} /> Edit
                                </button>
                                {!adminUser.isEnvironment && (
                                  <button
                                    onClick={() => void handleDeleteAdmin(adminUser)}
                                    disabled={
                                      busyActionId ===
                                      `delete-admin-${adminUser.id}`
                                    }
                                    className="flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] text-red-600 transition-opacity hover:opacity-75 disabled:opacity-60 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-400"
                                  >
                                    <Trash2 size={11} />
                                    {busyActionId ===
                                    `delete-admin-${adminUser.id}`
                                      ? "Removing..."
                                      : "Remove"}
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
            </>
          )}
        </div>
      </div>

      {isContestantFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-stone-200 bg-white p-6 shadow-[0_25px_80px_rgba(15,23,42,0.18)] dark:border-yellow-500/[0.16] dark:bg-[#130a22]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 inline-block rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-yellow-600 dark:text-yellow-400">
                  {contestantForm.id ? "Edit Contestant" : "New Contestant"}
                </div>
                <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                  {contestantForm.id
                    ? "Update contestant details"
                    : "Create contestant record"}
                </h2>
              </div>
              <button
                onClick={resetContestantForm}
                className="rounded-full border border-stone-200 px-3 py-1.5 text-xs text-stone-500 transition-colors hover:text-stone-900 dark:border-white/[0.1] dark:text-stone-400 dark:hover:text-stone-100"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleContestantSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-stone-400 dark:text-stone-500">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={contestantForm.name}
                    onChange={(event) =>
                      setContestantForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition-colors focus:border-yellow-500/40 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-stone-100"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-stone-400 dark:text-stone-500">
                    Contestant Number
                  </label>
                  <input
                    type="text"
                    value={contestantForm.contestantNumber}
                    onChange={(event) =>
                      setContestantForm((current) => ({
                        ...current,
                        contestantNumber: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition-colors focus:border-yellow-500/40 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-stone-100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-stone-400 dark:text-stone-500">
                  Contestant Image
                </label>
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-white/[0.08] dark:bg-white/[0.04]">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <ContestantMedia
                      name={contestantForm.name || "Contestant"}
                      imageSrc={contestantImagePreview || contestantForm.image}
                      index={Number(contestantForm.contestantNumber) || 0}
                      className="h-24 w-24 rounded-2xl border border-yellow-500/20"
                      sizes="96px"
                      fallbackClassName="font-serif text-2xl text-yellow-500/70 dark:text-yellow-400/60"
                    />
                    <div className="min-w-0 flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          setContestantImageFile(
                            event.target.files?.[0] ?? null
                          )
                        }
                        className="block w-full rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-3 text-sm text-stone-700 file:mr-4 file:rounded-full file:border-0 file:bg-yellow-500/15 file:px-4 file:py-2 file:text-sm file:font-medium file:text-yellow-700 dark:border-white/[0.12] dark:bg-white/[0.03] dark:text-stone-300 dark:file:bg-yellow-500/10 dark:file:text-yellow-400"
                      />
                      <p className="mt-2 text-xs text-stone-400 dark:text-stone-500">
                        Upload JPG, PNG, or WebP up to 5MB. The image will be
                        stored in Cloudinary.
                      </p>
                      {(contestantImagePreview || contestantForm.image) && (
                        <button
                          type="button"
                          onClick={() => {
                            setContestantImageFile(null);
                            setContestantForm((current) => ({
                              ...current,
                              image: "",
                            }));
                          }}
                          className="mt-3 text-xs text-red-500 transition-colors hover:text-red-400"
                        >
                          Remove current image
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-stone-400 dark:text-stone-500">
                    Stage
                  </label>
                  <select
                    value={contestantForm.stageId}
                    onChange={(event) =>
                      setContestantForm((current) => ({
                        ...current,
                        stageId: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition-colors focus:border-yellow-500/40 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-stone-100"
                  >
                    <option value="">No stage assigned</option>
                    {stages.map((stage, index) => (
                      <option key={stage.id} value={stage.id}>
                        {formatStageLabel(index)} - {stage.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-stone-400 dark:text-stone-500">
                    Status
                  </label>
                  <select
                    value={contestantForm.status}
                    onChange={(event) =>
                      setContestantForm((current) => ({
                        ...current,
                        status: event.target.value as ContestantStatus,
                      }))
                    }
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition-colors focus:border-yellow-500/40 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-stone-100"
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="eliminated">Eliminated</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetContestantForm}
                  className="rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-600 transition-colors hover:border-stone-300 dark:border-white/[0.1] dark:text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={contestantSubmitting}
                  className="rounded-full bg-yellow-500 px-5 py-2 text-sm font-medium text-stone-900 transition-opacity hover:opacity-90 disabled:opacity-60 dark:bg-yellow-400"
                >
                  {contestantSubmitting ? "Saving..." : "Save Contestant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isStageFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-6 shadow-[0_25px_80px_rgba(15,23,42,0.18)] dark:border-yellow-500/[0.16] dark:bg-[#130a22]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 inline-block rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-yellow-600 dark:text-yellow-400">
                  New Stage
                </div>
                <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                  Create competition stage
                </h2>
              </div>
              <button
                onClick={resetStageForm}
                className="rounded-full border border-stone-200 px-3 py-1.5 text-xs text-stone-500 transition-colors hover:text-stone-900 dark:border-white/[0.1] dark:text-stone-400 dark:hover:text-stone-100"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleStageSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-stone-400 dark:text-stone-500">
                  Stage Name
                </label>
                <input
                  type="text"
                  value={stageForm.name}
                  onChange={(event) =>
                    setStageForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition-colors focus:border-yellow-500/40 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-stone-100"
                  required
                />
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-stone-300">
                <input
                  type="checkbox"
                  checked={stageForm.isActive}
                  onChange={(event) =>
                    setStageForm((current) => ({
                      ...current,
                      isActive: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-stone-300 text-yellow-500 focus:ring-yellow-500"
                />
                Start this stage immediately after creation
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetStageForm}
                  className="rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-600 transition-colors hover:border-stone-300 dark:border-white/[0.1] dark:text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={stageSubmitting}
                  className="rounded-full bg-yellow-500 px-5 py-2 text-sm font-medium text-stone-900 transition-opacity hover:opacity-90 disabled:opacity-60 dark:bg-yellow-400"
                >
                  {stageSubmitting ? "Creating..." : "Create Stage"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAdminFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-stone-200 bg-white p-6 shadow-[0_25px_80px_rgba(15,23,42,0.18)] dark:border-yellow-500/[0.16] dark:bg-[#130a22]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 inline-block rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-yellow-600 dark:text-yellow-400">
                  {adminForm.id ? "Edit Admin" : "New Admin"}
                </div>
                <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                  {adminForm.id
                    ? "Update admin access"
                    : "Create admin account"}
                </h2>
              </div>
              <button
                onClick={resetAdminForm}
                className="rounded-full border border-stone-200 px-3 py-1.5 text-xs text-stone-500 transition-colors hover:text-stone-900 dark:border-white/[0.1] dark:text-stone-400 dark:hover:text-stone-100"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-stone-400 dark:text-stone-500">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={adminForm.name}
                    onChange={(event) =>
                      setAdminForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition-colors focus:border-yellow-500/40 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-stone-100"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-stone-400 dark:text-stone-500">
                    Role
                  </label>
                  <select
                    value={adminForm.role}
                    onChange={(event) =>
                      setAdminForm((current) => ({
                        ...current,
                        role: event.target.value as AdminRole,
                      }))
                    }
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition-colors focus:border-yellow-500/40 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-stone-100"
                  >
                    {adminRoleOptions.map((roleOption) => (
                      <option key={roleOption.value} value={roleOption.value}>
                        {roleOption.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-stone-400 dark:text-stone-500">
                  Email
                </label>
                <input
                  type="email"
                  value={adminForm.email}
                  onChange={(event) =>
                    setAdminForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition-colors focus:border-yellow-500/40 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-stone-100"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-stone-400 dark:text-stone-500">
                  {adminForm.id ? "New Password (Optional)" : "Password"}
                </label>
                <input
                  type="password"
                  value={adminForm.password}
                  onChange={(event) =>
                    setAdminForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  placeholder={
                    adminForm.id
                      ? "Leave blank to keep current password"
                      : "At least 8 characters"
                  }
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition-colors focus:border-yellow-500/40 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-stone-100"
                  required={!adminForm.id}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetAdminForm}
                  className="rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-600 transition-colors hover:border-stone-300 dark:border-white/[0.1] dark:text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adminSubmitting}
                  className="rounded-full bg-yellow-500 px-5 py-2 text-sm font-medium text-stone-900 transition-opacity hover:opacity-90 disabled:opacity-60 dark:bg-yellow-400"
                >
                  {adminSubmitting ? "Saving..." : "Save Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
