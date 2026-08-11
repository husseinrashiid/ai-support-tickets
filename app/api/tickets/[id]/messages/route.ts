import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { MESSAGE_WRITABLE_STATUSES } from "@/lib/constants";
import { validateAttachmentFile, type AttachmentInput } from "@/lib/attachments";

export async function GET(
  _request: NextRequest,
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
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }

    const messages = await prisma.message.findMany({
      where: { ticketId: id },
      orderBy: { createdAt: "asc" },
      include: { attachments: true },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error(`GET /api/tickets/${id}/messages failed:`, error);
    return NextResponse.json(
      { error: "Failed to load messages." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid form data." },
      { status: 400 }
    );
  }

  const content = formData.get("content");
  const attachmentFile = formData.get("attachment");

  if (typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json(
      { error: "Message content is required." },
      { status: 400 }
    );
  }

  let attachment: AttachmentInput | undefined;
  if (attachmentFile instanceof File) {
    const result = await validateAttachmentFile(attachmentFile);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    attachment = result.attachment;
  }

  try {
    const ticket = await prisma.ticket.findUnique({ where: { id } });

    if (!ticket || (user.role === "customer" && ticket.ownerId !== user.id)) {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }

    if (!MESSAGE_WRITABLE_STATUSES.includes(ticket.status as (typeof MESSAGE_WRITABLE_STATUSES)[number])) {
      return NextResponse.json(
        { error: `Messages can only be added while the ticket is ${MESSAGE_WRITABLE_STATUSES.join(" or ")}.` },
        { status: 403 }
      );
    }

    const message = await prisma.$transaction(async (tx) => {
      const created = await tx.message.create({
        data: {
          ticketId: id,
          senderId: user.id,
          senderRole: user.role,
          content: content.trim(),
          attachments: attachment
            ? {
                create: {
                  filename: attachment.filename,
                  mimeType: attachment.mimeType,
                  size: attachment.size,
                  data: attachment.buffer,
                },
              }
            : undefined,
        },
        include: { attachments: true },
      });
      await tx.ticket.update({
        where: { id },
        data: { updatedAt: new Date() },
      });
      return created;
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error(`POST /api/tickets/${id}/messages failed:`, error);
    return NextResponse.json(
      { error: "Failed to add message." },
      { status: 500 }
    );
  }
}
