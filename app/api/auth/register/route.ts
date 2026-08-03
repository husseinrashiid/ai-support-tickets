import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { USER_ROLES } from "@/lib/constants";
import { createSessionToken, hashPassword, setSessionCookie } from "@/lib/auth";
import { PASSWORD_REQUIREMENTS_TEXT, isPasswordStrong } from "@/lib/password";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const { email, password, role } = (body ?? {}) as {
    email?: unknown;
    password?: unknown;
    role?: unknown;
  };

  if (typeof email !== "string" || email.trim().length === 0) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }
  if (typeof password !== "string" || !isPasswordStrong(password)) {
    return NextResponse.json(
      { error: PASSWORD_REQUIREMENTS_TEXT },
      { status: 400 }
    );
  }
  if (
    typeof role !== "string" ||
    !(USER_ROLES as readonly string[]).includes(role)
  ) {
    return NextResponse.json(
      { error: `Role must be one of: ${USER_ROLES.join(", ")}.` },
      { status: 400 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  let user;
  try {
    const passwordHash = await hashPassword(password);
    user = await prisma.user.create({
      data: { email: normalizedEmail, passwordHash, role },
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
