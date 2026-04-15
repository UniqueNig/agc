import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import adminUserModel from "@/src/models/AdminUser";
import { connectDB } from "@/src/lib/db";

export const ADMIN_AUTH_COOKIE = "agc-admin-session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

type AdminJwtPayload = {
  email: string;
  role: "admin";
};

type AdminSession = {
  email: string;
  role: "admin";
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

function hasEnvAdminCredentials() {
  const credentials = getAdminCredentials();
  return Boolean(
    credentials.email && (credentials.password || credentials.passwordHash)
  );
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
}) {
  await connectDB();

  if (await hasAdminUsers()) {
    throw new Error("An admin account already exists. Sign in instead.");
  }

  const email = input.email.trim().toLowerCase();
  const password = input.password.trim();
  const name = input.name?.trim() ?? "";

  if (!email) {
    throw new Error("Email is required.");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  return adminUserModel.create({
    name,
    email,
    passwordHash,
  });
}

export async function validateAdminCredentials(email: string, password: string) {
  await connectDB();
  const credentials = getAdminCredentials();
  const normalizedEmail = email.trim().toLowerCase();
  const adminUser = await adminUserModel.findOne({ email: normalizedEmail });

  if (adminUser) {
    return bcrypt.compare(password, adminUser.passwordHash);
  }

  if (!hasEnvAdminCredentials() || normalizedEmail !== credentials.email) {
    return false;
  }

  if (credentials.passwordHash) {
    return bcrypt.compare(password, credentials.passwordHash);
  }

  return password === credentials.password;
}

export function signAdminToken(email: string) {
  return jwt.sign(
    {
      email,
      role: "admin",
    } satisfies AdminJwtPayload,
    getJwtSecret(),
    {
      expiresIn: ADMIN_SESSION_MAX_AGE,
    }
  );
}

export function verifyAdminToken(token: string): AdminSession | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret());

    if (
      typeof decoded === "object" &&
      decoded &&
      decoded.role === "admin" &&
      typeof decoded.email === "string"
    ) {
      return {
        email: decoded.email,
        role: "admin",
      };
    }

    return null;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return verifyAdminToken(token);
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
