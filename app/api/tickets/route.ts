import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeTicket } from "@/lib/ai";

export async function GET() {
  try {
    const tickets = await prisma.ticket.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("GET /api/tickets failed:", error);
    return NextResponse.json(
      { error: "Failed to load tickets." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const { title, message } = (body ?? {}) as {
    title?: unknown;
    message?: unknown;
  };

  if (typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json(
      { error: "Title is required." },
      { status: 400 }
    );
  }

  if (typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json(
      { error: "Customer message is required." },
      { status: 400 }
    );
  }

  let ticket;
  try {
    ticket = await prisma.ticket.create({
      data: {
        title: title.trim(),
        message: message.trim(),
        status: "Open",
      },
    });
  } catch (error) {
    console.error("POST /api/tickets failed:", error);
    return NextResponse.json(
      { error: "Failed to create ticket." },
      { status: 500 }
    );
  }

  // The ticket is already saved at this point,an AI failure below must never lose it. analyzeTicket() never throws;instead it will return { ok: false }.
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
  
//try and catch for failure
  let finalTicket = ticket;
  try {
    finalTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: updateData,
    });
  } catch (error) {
    console.error(`Failed to save AI analysis for ticket ${ticket.id}:`, error);
  }

  return NextResponse.json({ ticket: finalTicket }, { status: 201 });
}
