import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import adminUserModel from "@/src/models/AdminUser";
import { connectDB } from "@/src/lib/db";
import {
  isAdminRole,
  type AdminRole,
} from "@/src/lib/admin-permissions";

export const ADMIN_AUTH_COOKIE = "agc-admin-session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

type AdminJwtPayload = {
  email: string;
};

export type AdminSession = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  source: "database" | "environment";
  createdAt: string | null;
  updatedAt: string | null;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET?.trim();

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV !== "production") {
    return "agc-dev-admin-secret-change-me";
  }

  throw new Error("JWT_SECRET is not configured.");
}

function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();

  return {
    email: email || "",
    password: password || "",
    passwordHash: passwordHash || "",
  };
}

const mapAdminUserToSession = (adminUser: {
  _id: { toString(): string };
  name?: string;
  email: string;
  role: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}): AdminSession => ({
  id: adminUser._id.toString(),
  name: adminUser.name ?? "",
  email: adminUser.email,
  role: isAdminRole(adminUser.role) ? adminUser.role : "viewer",
  source: "database",
  createdAt: adminUser.createdAt
    ? new Date(adminUser.createdAt).toISOString()
    : null,
  updatedAt: adminUser.updatedAt
    ? new Date(adminUser.updatedAt).toISOString()
    : null,
});

const getEnvironmentAdminSession = (email?: string) => {
  const credentials = getAdminCredentials();

  if (!hasEnvAdminCredentials()) {
    return null;
  }

  if (email && email.trim().toLowerCase() !== credentials.email) {
    return null;
  }

  return {
    id: `env:${credentials.email}`,
    name: "Environment Admin",
    email: credentials.email,
    role: "super_admin" as const,
    source: "environment" as const,
    createdAt: null,
    updatedAt: null,
  };
};

function hasEnvAdminCredentials() {
  const credentials = getAdminCredentials();
  return Boolean(
    credentials.email && (credentials.password || credentials.passwordHash)
  );
}

async function matchesEnvironmentAdminPassword(password: string) {
  const credentials = getAdminCredentials();

  if (credentials.passwordHash) {
    try {
      if (await bcrypt.compare(password, credentials.passwordHash)) {
        return true;
      }
    } catch {
      // Ignore invalid hashes and fall back to the plain password if present.
    }
  }

  if (credentials.password) {
    return password === credentials.password;
  }

  return false;
}

export async function hasAdminUsers() {
  await connectDB();
  return (await adminUserModel.countDocuments()) > 0;
}

export async function isAdminSetupRequired() {
  if (hasEnvAdminCredentials()) {
    return false;
  }

  try {
    return !(await hasAdminUsers());
  } catch {
    return false;
  }
}

export async function createAdminAccount(input: {
  name?: string;
  email: string;
  password: string;
  role?: AdminRole;
}) {
  await connectDB();

  const email = input.email.trim().toLowerCase();
  const password = input.password.trim();
  const name = input.name?.trim() ?? "";
  const existingAdmin = await adminUserModel.exists({ email });

  if (!email) {
    throw new Error("Email is required.");
  }

  if (existingAdmin) {
    throw new Error("An admin with this email already exists.");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long.");
  }

  const existingAdminCount = await adminUserModel.countDocuments();
  const passwordHash = await bcrypt.hash(password, 12);
  const role =
    input.role ?? (existingAdminCount === 0 ? "super_admin" : "viewer");

  return adminUserModel.create({
    name,
    email,
    passwordHash,
    role,
  });
}

async function getStoredAdminByEmail(email: string) {
  await connectDB();
  return adminUserModel.findOne({ email });
}

export async function validateAdminCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const adminUser = await getStoredAdminByEmail(normalizedEmail);

  if (adminUser) {
    if (await bcrypt.compare(password, adminUser.passwordHash)) {
      return mapAdminUserToSession(adminUser);
    }

    return null;
  }

  const envSession = getEnvironmentAdminSession(normalizedEmail);

  if (!envSession) {
    return null;
  }

  return (await matchesEnvironmentAdminPassword(password)) ? envSession : null;
}

export function signAdminToken(email: string) {
  return jwt.sign(
    {
      email,
    } satisfies AdminJwtPayload,
    getJwtSecret(),
    {
      expiresIn: ADMIN_SESSION_MAX_AGE,
    }
  );
}

function verifyAdminTokenPayload(token: string): AdminJwtPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret());

    if (
      typeof decoded === "object" &&
      decoded &&
      typeof decoded.email === "string"
    ) {
      return {
        email: decoded.email,
      };
    }

    return null;
  } catch {
    return null;
  }
}

export async function getAdminSessionFromToken(token: string) {
  const decoded = verifyAdminTokenPayload(token);

  if (!decoded) {
    return null;
  }

  const normalizedEmail = decoded.email.trim().toLowerCase();
  const storedAdmin = await getStoredAdminByEmail(normalizedEmail);

  if (storedAdmin) {
    return mapAdminUserToSession(storedAdmin);
  }

  return getEnvironmentAdminSession(normalizedEmail);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return getAdminSessionFromToken(token);
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  };
}
