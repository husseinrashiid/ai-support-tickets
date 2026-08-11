import {
  ALLOWED_ATTACHMENT_MIME_TYPES,
  MAX_ATTACHMENT_SIZE_BYTES,
  type AllowedAttachmentMimeType,
} from "@/lib/constants";

const EXTENSION_BY_MIME_TYPE: Record<AllowedAttachmentMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

// Identify the real file type from its content rather than trusting the
// browser-supplied MIME type, which is trivial to spoof on a renamed file.
function sniffImageMimeType(buffer: Buffer): AllowedAttachmentMimeType | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 6 &&
    buffer.toString("ascii", 0, 3) === "GIF" &&
    (buffer.toString("ascii", 3, 6) === "87a" || buffer.toString("ascii", 3, 6) === "89a")
  ) {
    return "image/gif";
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export type AttachmentInput = {
  filename: string;
  mimeType: AllowedAttachmentMimeType;
  size: number;
  buffer: Buffer<ArrayBuffer>;
};

export type AttachmentValidationResult =
  | { ok: true; attachment: AttachmentInput }
  | { ok: false; error: string };

export async function validateAttachmentFile(file: File): Promise<AttachmentValidationResult> {
  if (file.size === 0) {
    return { ok: false, error: "The attached file is empty." };
  }
  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    return {
      ok: false,
      error: `Attachments must be ${Math.floor(MAX_ATTACHMENT_SIZE_BYTES / (1024 * 1024))}MB or smaller.`,
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const sniffedType = sniffImageMimeType(buffer);

  if (!sniffedType || !(ALLOWED_ATTACHMENT_MIME_TYPES as readonly string[]).includes(sniffedType)) {
    return {
      ok: false,
      error: "Attachments must be a JPG, PNG, GIF, or WEBP image.",
    };
  }

  const safeName = (file.name || `attachment.${EXTENSION_BY_MIME_TYPE[sniffedType]}`)
    .replace(/[\r\n"]/g, "")
    .slice(0, 200);

  return {
    ok: true,
    attachment: {
      filename: safeName,
      mimeType: sniffedType,
      size: buffer.byteLength,
      buffer,
    },
  };
}
