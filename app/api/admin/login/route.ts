import { NextResponse } from "next/server";
import {
  ADMIN_AUTH_COOKIE,
  getAdminCookieOptions,
  isAdminSetupRequired,
  signAdminToken,
  validateAdminCredentials,
} from "@/src/lib/admin-auth";

type LoginRequestBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginRequestBody;
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    if (await isAdminSetupRequired()) {
      return NextResponse.json(
        {
          message:
            "No admin account exists yet. Create one first from the setup page.",
        },
        { status: 409 }
      );
    }

    const isValid = await validateAdminCredentials(email, password);

    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid admin credentials." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(
      ADMIN_AUTH_COOKIE,
      signAdminToken(email),
      getAdminCookieOptions()
    );

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to sign in right now.",
      },
      { status: 500 }
    );
  }
}
