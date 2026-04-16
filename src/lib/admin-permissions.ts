export const ADMIN_ROLES = [
  "super_admin",
  "contestant_manager",
  "stage_manager",
  "finance_admin",
  "viewer",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export type AdminPermission =
  | "manage_admins"
  | "manage_contestants"
  | "manage_stages"
  | "manage_payments";

const rolePermissions: Record<AdminRole, AdminPermission[]> = {
  super_admin: [
    "manage_admins",
    "manage_contestants",
    "manage_stages",
    "manage_payments",
  ],
  contestant_manager: ["manage_contestants"],
  stage_manager: ["manage_stages"],
  finance_admin: ["manage_payments"],
  viewer: [],
};

export const isAdminRole = (value: string): value is AdminRole =>
  ADMIN_ROLES.includes(value as AdminRole);

export const hasAdminPermission = (
  role: AdminRole,
  permission: AdminPermission
) => rolePermissions[role].includes(permission);

export const formatAdminRole = (role: AdminRole) =>
  role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const adminRoleOptions = ADMIN_ROLES.map((role) => ({
  value: role,
  label: formatAdminRole(role),
}));
