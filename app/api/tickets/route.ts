import { after, NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analysisToTicketUpdate, analyzeTicket } from "@/lib/ai";
import { validateAttachmentFile, type AttachmentInput } from "@/lib/attachments";
import { requireUser, parseFormData } from "@/lib/api-helpers";

export async function GET() {
  const user = await requireUser("agent");
  if (user instanceof NextResponse) return user;

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
  const user = await requireUser("customer");
  if (user instanceof NextResponse) return user;

  const formData = await parseFormData(request);
  if (formData instanceof NextResponse) return formData;

  const title = formData.get("title");
  const message = formData.get("message");
  const attachmentFile = formData.get("attachment");

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

  let attachment: AttachmentInput | undefined;
  if (attachmentFile instanceof File) {
    const result = await validateAttachmentFile(attachmentFile);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    attachment = result.attachment;
  }

  let ticket;
  try {
    ticket = await prisma.ticket.create({
      data: {
        title: title.trim(),
        message: message.trim(),
        status: "Open",
        ownerId: user.id,
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
    });
  } catch (error) {
    console.error("POST /api/tickets failed:", error);
    return NextResponse.json(
      { error: "Failed to create ticket." },
      { status: 500 }
    );
  }

  // The ticket is already saved at this point, so AI analysis runs after the
  // response is sent instead of blocking ticket creation on it. analyzeTicket()
  // never throws - a failure just leaves the fallback aiSummary from
  // analysisToTicketUpdate(); the UI already treats a missing category/summary
  // as pending review, with a manual retry available on the ticket page.
  after(async () => {
    const analysis = await analyzeTicket(ticket.title, ticket.message);
    const updateData = analysisToTicketUpdate(analysis);

    try {
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: updateData,
      });
    } catch (error) {
      console.error(`Failed to save AI analysis for ticket ${ticket.id}:`, error);
    }
  });

  return NextResponse.json({ ticket }, { status: 201 });
}
