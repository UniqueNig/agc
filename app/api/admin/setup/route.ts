import { NextResponse } from "next/server";
import {
  ADMIN_AUTH_COOKIE,
  createAdminAccount,
  getAdminCookieOptions,
  isAdminSetupRequired,
  signAdminToken,
} from "@/src/lib/admin-auth";

type SetupRequestBody = {
  name?: string;
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    if (!(await isAdminSetupRequired())) {
      return NextResponse.json(
        { message: "Admin setup is already complete. Sign in instead." },
        { status: 409 }
      );
    }

    const body = (await request.json()) as SetupRequestBody;
    const name = body.name?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    await createAdminAccount({
      name,
      email,
      password,
    });

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
            : "Unable to create the admin account right now.",
      },
      { status: 500 }
    );
  }
}
