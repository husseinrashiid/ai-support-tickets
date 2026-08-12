import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-helpers";

export async function GET() {
  const user = await requireUser("agent");
  if (user instanceof NextResponse) return user;

  try {
    const [total, open, resolved, urgent] = await Promise.all([
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: "Open" } }),
      prisma.ticket.count({ where: { status: { in: ["Resolved", "Closed"] } } }),
      prisma.ticket.count({
        where: { priority: "Urgent", status: { notIn: ["Resolved", "Closed"] } },
      }),
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
