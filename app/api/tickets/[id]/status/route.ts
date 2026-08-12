import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TICKET_STATUSES } from "@/lib/constants";
import { requireUser, parseJsonBody, notFoundOnRecordMissing } from "@/lib/api-helpers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await requireUser("agent");
  if (user instanceof NextResponse) return user;

  const body = await parseJsonBody<{ status?: unknown }>(request);
  if (body instanceof NextResponse) return body;

  const { status } = body ?? {};

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
    const notFound = notFoundOnRecordMissing(error);
    if (notFound) return notFound;

    console.error(`PATCH /api/tickets/${id}/status failed:`, error);
    return NextResponse.json(
      { error: "Failed to update ticket status." },
      { status: 500 }
    );
  }
}
