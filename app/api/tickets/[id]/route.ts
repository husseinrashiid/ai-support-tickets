import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const ticket = await prisma.ticket.findUnique({ where: { id } });

    if (!ticket || (user.role === "customer" && ticket.ownerId !== user.id)) {
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
