import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getCurrentUser, type SessionUser } from "@/lib/auth";
import type { UserRole } from "@/lib/constants";

export async function requireUser(
  role?: UserRole
): Promise<SessionUser | NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (role && user.role !== role) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  return user;
}

export async function parseJsonBody<T = unknown>(
  request: Request
): Promise<T | NextResponse> {
  try {
    return (await request.json()) as T;
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }
}

export async function parseFormData(
  request: Request
): Promise<FormData | NextResponse> {
  try {
    return await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid form data." },
      { status: 400 }
    );
  }
}

export function notFoundOnRecordMissing(
  error: unknown,
  message = "Ticket not found."
): NextResponse | null {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
    return NextResponse.json({ error: message }, { status: 404 });
  }
  return null;
}

export function isForbiddenForCustomer(
  user: SessionUser,
  ownerId: string | null | undefined
): boolean {
  return user.role === "customer" && ownerId !== user.id;
}
