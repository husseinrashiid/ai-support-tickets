import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MESSAGE_WRITABLE_STATUSES } from "@/lib/constants";
import { validateAttachmentFile, type AttachmentInput } from "@/lib/attachments";
import { requireUser, parseFormData, isForbiddenForCustomer } from "@/lib/api-helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  try {
    const ticket = await prisma.ticket.findUnique({ where: { id } });

    if (!ticket || isForbiddenForCustomer(user, ticket.ownerId)) {
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

  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const formData = await parseFormData(request);
  if (formData instanceof NextResponse) return formData;

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

    if (!ticket || isForbiddenForCustomer(user, ticket.ownerId)) {
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
