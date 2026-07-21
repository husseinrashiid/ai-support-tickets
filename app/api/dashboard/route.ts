import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [total, open, resolved, urgent] = await Promise.all([
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: "Open" } }),
      prisma.ticket.count({ where: { status: "Resolved" } }),
      prisma.ticket.count({ where: { priority: "Urgent" } }),
    ]);

    return NextResponse.json({ total, open, resolved, urgent });
  } catch (error) {
    console.error("GET /api/dashboard failed:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard stats." },
      { status: 500 }
    );
  }
}
