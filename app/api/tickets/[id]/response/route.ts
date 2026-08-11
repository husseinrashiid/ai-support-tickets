import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (user.role !== "agent") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }
  const { aiSuggestedResponse } = (body ?? {}) as {
    aiSuggestedResponse?: unknown;
  };

  if (typeof aiSuggestedResponse !== "string") {
    return NextResponse.json(
      { error: "aiSuggestedResponse must be a string." },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.ticket.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }

    // Internal draft edits are not customer-visible, so they must not
    // bump "last updated" — explicitly pin @updatedAt back to its prior value.
    const ticket = await prisma.ticket.update({
      where: { id },
      data: { aiSuggestedResponse, updatedAt: existing.updatedAt },
    });

    return NextResponse.json({ ticket });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Ticket not found." },
        { status: 404 }
      );
    }
    console.error(`PATCH /api/tickets/${id}/response failed:`, error);
    return NextResponse.json(
      { error: "Failed to save the response." },
      { status: 500 }
    );
  }
}
