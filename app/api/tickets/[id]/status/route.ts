import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { TICKET_STATUSES } from "@/lib/constants";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const { status } = (body ?? {}) as { status?: unknown };

  if (
    typeof status !== "string" ||
    !TICKET_STATUSES.includes(status as (typeof TICKET_STATUSES)[number])
  ) {
    return NextResponse.json(
      { error: `Status must be one of: ${TICKET_STATUSES.join(", ")}.` },
      { status: 400 }
    );
  }

  try {
    const ticket = await prisma.ticket.update({
      where: { id },
      data: { status },
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
    console.error(`PATCH /api/tickets/${id}/status failed:`, error);
    return NextResponse.json(
      { error: "Failed to update ticket status." },
      { status: 500 }
    );
  }
}
