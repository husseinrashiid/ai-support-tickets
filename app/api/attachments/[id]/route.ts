import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, isForbiddenForCustomer } from "@/lib/api-helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const attachment = await prisma.attachment.findUnique({
    where: { id },
    include: {
      ticket: { select: { ownerId: true } },
      message: { include: { ticket: { select: { ownerId: true } } } },
    },
  });

  if (!attachment) {
    return NextResponse.json({ error: "Attachment not found." }, { status: 404 });
  }

  const ownerId = attachment.ticket?.ownerId ?? attachment.message?.ticket.ownerId;
  if (isForbiddenForCustomer(user, ownerId)) {
    return NextResponse.json({ error: "Attachment not found." }, { status: 404 });
  }

  const filename = attachment.filename.replace(/[\r\n"]/g, "");

  return new NextResponse(new Uint8Array(attachment.data), {
    headers: {
      "Content-Type": attachment.mimeType,
      "Content-Disposition": `inline; filename="${filename}"`,
      "Content-Length": String(attachment.size),
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
