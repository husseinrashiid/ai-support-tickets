import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
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
  const { aiSuggestedResponse } = (body ?? {}) as {
    aiSuggestedResponse?: unknown;
  };

  if (typeof aiSuggestedResponse !== "string") {
    return NextResponse.json(
      { error: "ai Suggested Response must be a string." },
      { status: 400 }
    );
  }
  try {
    const ticket = await prisma.ticket.update({
      where: { id },
      data: { aiSuggestedResponse },
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
      { error: "Failed to update suggested response." },
      { status: 500 }
    );
  }
}
