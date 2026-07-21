import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const ticket = await prisma.ticket.findUnique({ where: { id } });

    if (!ticket) {
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
