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
