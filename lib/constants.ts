export const TICKET_STATUSES = [
"Open",
"In Progress",
"Resolved",
"Closed",
] as const;
export const TICKET_PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;
export const TICKET_CATEGORIES = [
"Technical Issue",
"Billing",
"Account Access",
"Feature Request",
"General Question",
"Other",
] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];
export type TicketCategory = (typeof TICKET_CATEGORIES)[number];

export const TICKET_PAGE_SIZES = [5, 10, 25, 50, 100] as const;
export type TicketPageSize = (typeof TICKET_PAGE_SIZES)[number];
export const DEFAULT_TICKET_PAGE_SIZE: TicketPageSize = 5;

export const USER_ROLES = ["customer", "agent"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const MESSAGE_WRITABLE_STATUSES: TicketStatus[] = ["Open", "In Progress"];

export const ALLOWED_ATTACHMENT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;
export type AllowedAttachmentMimeType = (typeof ALLOWED_ATTACHMENT_MIME_TYPES)[number];

export const MAX_ATTACHMENT_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
