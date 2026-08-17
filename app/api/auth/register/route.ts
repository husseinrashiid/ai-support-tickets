import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createSessionToken, hashPassword, setSessionCookie } from "@/lib/auth";
import { PASSWORD_REQUIREMENTS_TEXT, isPasswordStrong } from "@/lib/password";
import { parseJsonBody } from "@/lib/api-helpers";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

const REGISTER_LIMIT = 5;
const REGISTER_WINDOW_MS = 60 * 60 * 1000;

// Public registration always creates a customer account. Agent accounts are
// provisioned out-of-band (see prisma/create-agent.mjs) so a visitor can never
// grant themselves access to other customers' tickets by posting role: "agent".
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited(`register:${ip}`, REGISTER_LIMIT, REGISTER_WINDOW_MS)) {
    return NextResponse.json(
      { error: "Too many accounts created from this network. Please try again later." },
      { status: 429 }
    );
  }

  const body = await parseJsonBody<{ email?: unknown; password?: unknown }>(request);
  if (body instanceof NextResponse) return body;

  const { email, password } = body ?? {};

  if (typeof email !== "string" || email.trim().length === 0) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }
  if (typeof password !== "string" || !isPasswordStrong(password)) {
    return NextResponse.json(
      { error: PASSWORD_REQUIREMENTS_TEXT },
      { status: 400 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  let user;
  try {
    const passwordHash = await hashPassword(password);
    user = await prisma.user.create({
      data: { email: normalizedEmail, passwordHash, role: "customer" },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }
    console.error("POST /api/auth/register failed:", error);
    return NextResponse.json(
      { error: "Failed to create account." },
      { status: 500 }
    );
  }

  const token = await createSessionToken({
    id: user.id,
    email: user.email,
    role: user.role as "customer" | "agent",
  });
  await setSessionCookie(token);

  return NextResponse.json(
    { user: { id: user.id, email: user.email, role: user.role } },
    { status: 201 }
  );
}
