import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeTicket } from "@/lib/ai";
import { requireUser } from "@/lib/api-helpers";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await requireUser("agent");
  if (user instanceof NextResponse) return user;

  let ticket;
  try {
    ticket = await prisma.ticket.findUnique({ where: { id } });
  } catch (error) {
    console.error(`POST /api/tickets/${id}/analyze failed to load ticket:`, error);
    return NextResponse.json({ error: "Failed to load ticket." }, { status: 500 });
  }

  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  }

  const analysis = await analyzeTicket(ticket.title, ticket.message);

  const updateData = analysis.ok
    ? {
        aiSummary: analysis.data.summary,
        category: analysis.data.category,
        priority: analysis.data.priority,
        aiSuggestedResponse: analysis.data.suggestedResponse,
      }
    : {
        aiSummary:
          "AI analysis could not be completed. The ticket was saved without AI-generated information.",
      };

  try {
    const updated = await prisma.ticket.update({ where: { id }, data: updateData });
    return NextResponse.json({ ticket: updated });
  } catch (error) {
    console.error(`POST /api/tickets/${id}/analyze failed to save analysis:`, error);
    return NextResponse.json({ error: "Failed to save AI analysis." }, { status: 500 });
  }
}
