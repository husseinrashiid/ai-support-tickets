import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReply, type ConversationTurn } from "@/lib/ai";
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
    console.error(`POST /api/tickets/${id}/response/regenerate failed to load ticket:`, error);
    return NextResponse.json({ error: "Failed to load ticket." }, { status: 500 });
  }

  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: { ticketId: id },
    orderBy: { createdAt: "asc" },
  });

  const conversation: ConversationTurn[] = messages.map((message) => ({
    role: message.senderRole === "agent" ? "agent" : "customer",
    content: message.content,
  }));

  const result = await generateReply(ticket.title, ticket.message, conversation);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  try {
    // Regenerating an internal draft is not customer-visible, so it must
    // not bump "last updated" — explicitly pin @updatedAt back to its prior value.
    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        aiSuggestedResponse: result.data.suggestedResponse,
        updatedAt: ticket.updatedAt,
      },
    });
    return NextResponse.json({ ticket: updated });
  } catch (error) {
    console.error(`POST /api/tickets/${id}/response/regenerate failed to save:`, error);
    return NextResponse.json({ error: "Failed to save the suggested response." }, { status: 500 });
  }
}
