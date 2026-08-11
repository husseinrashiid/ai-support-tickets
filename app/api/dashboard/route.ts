import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (user.role !== "agent") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const [total, open, resolved, urgent] = await Promise.all([
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: "Open" } }),
      prisma.ticket.count({ where: { status: { in: ["Resolved", "Closed"] } } }),
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
