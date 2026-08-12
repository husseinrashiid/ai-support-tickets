import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, isForbiddenForCustomer } from "@/lib/api-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  try {
    const ticket = await prisma.ticket.findUnique({ where: { id } });

    if (!ticket || isForbiddenForCustomer(user, ticket.ownerId)) {
      return NextResponse.json(
        { error: "Ticket not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({ ticket });
  } catch (error) {
    console.error(`GET /api/tickets/${id} failed:`, error);
    return NextResponse.json(
      { error: "Failed to load ticket." },
      { status: 500 }
    );
  }
}
