import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, parseJsonBody, notFoundOnRecordMissing } from "@/lib/api-helpers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await requireUser("agent");
  if (user instanceof NextResponse) return user;

  const body = await parseJsonBody<{ aiSuggestedResponse?: unknown }>(request);
  if (body instanceof NextResponse) return body;

  const { aiSuggestedResponse } = body ?? {};

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
    const notFound = notFoundOnRecordMissing(error);
    if (notFound) return notFound;

    console.error(`PATCH /api/tickets/${id}/response failed:`, error);
    return NextResponse.json(
      { error: "Failed to save the response." },
      { status: 500 }
    );
  }
}
