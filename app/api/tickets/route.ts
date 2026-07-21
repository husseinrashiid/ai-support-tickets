import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

  try {
    const ticket = await prisma.ticket.create({
      data: {
        title: title.trim(),
        message: message.trim(),
        status: "Open",
      },
    });
    // AI analysis (summary,category,priority,suggested response) is triggered separately once the AI service is wired up 
    // the ticketmust be saved successfully even if later call fails.
    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tickets failed:", error);
    return NextResponse.json(
      { error: "Failed to create ticket." },
      { status: 500 }
    );
  }
}
