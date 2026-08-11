# AI Support Tickets

An AI-powered customer support ticket system. Customers submit tickets and message with support agents; agents triage tickets with AI-generated summaries, categories, priorities, and suggested replies.

## Main features

**Core ticket flow**
- Submit a ticket (title + message, optional image attachment).
- On submission, Claude analyzes the ticket and returns a summary, category, priority, and a suggested first response.
- Agents can edit and save the suggested response, and retry AI analysis if it failed or the ticket has no category yet.
- Agent dashboard with ticket counts (total / open / resolved / urgent), plus filtering, sorting, and pagination over the ticket list.

**Authentication and roles**
- Email/password auth with signed session cookies (`jose` JWT, `bcryptjs` password hashing).
- Two roles: **customer** (owns and manages only their own tickets) and **agent** (sees and manages every ticket).
- Public registration always creates a customer account — agent accounts can't be self-registered, only provisioned via a CLI script (see below).
- Every API route and page re-checks the session and role server-side; hiding a link in the UI is never the only guard.

**Ticket conversation**
- Each ticket has a threaded conversation (customer + agent messages, chronological, persisted in the database).
- Customers can add follow-up messages only while a ticket is `Open` or `In Progress`; `Resolved`/`Closed` tickets are read-only for customers.
- Agents can reply through the same thread and ask the AI to draft or regenerate a reply based on the full conversation so far, not just the original message.
- Messages support one optional image attachment (JPG/PNG/GIF/WEBP, up to 8MB), stored in the database and served back through an authorized endpoint.

## Technology stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend:** Next.js API routes
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** `jose` (JWT session cookies), `bcryptjs` (password hashing)
- **AI:** Anthropic API (`@anthropic-ai/sdk`), model `claude-haiku-4-5`

## Local installation

**Requirements:** Node.js 18+, a PostgreSQL database, an Anthropic API key.

```bash
npm install
cp .env.example .env   # then fill in the values below
npx prisma migrate deploy
npm run dev
```

The app runs at `http://localhost:3000`.

## Environment variables

Set these in `.env` (see `.env.example`):

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `ANTHROPIC_API_KEY` | Anthropic API key, used server-side only |
| `AUTH_SECRET` | Random secret used to sign session JWTs (e.g. `openssl rand -base64 32`) |

## Database setup

The schema lives in `prisma/schema.prisma`; migrations are in `prisma/migrations/`.

```bash
npx prisma migrate deploy   # apply existing migrations
npx prisma generate         # regenerate the Prisma client (also runs automatically on install)
```

The four models are `User`, `Ticket`, `Message`, and `Attachment` (attachments belong to either a ticket or a message).

## Create an agent account

Agent accounts cannot be created through public registration.

To create one locally:

```bash
npm run create-agent -- agent@example.com Agent123!
```

The script hashes the password and upserts a user with `role: "agent"` directly into the database.

You can then log in with those credentials to access the agent dashboard.

Customer accounts are created normally through `/register`.

## How it works

1. A customer creates a ticket.
2. The ticket is persisted in PostgreSQL.
3. The server sends the ticket content to Anthropic for analysis.
4. The returned summary, category, priority, and suggested response are validated and stored.
5. Agents review tickets from the dashboard and can reply manually or use an AI-generated draft.
6. Customer and agent messages are persisted as a chronological conversation thread.

## AI integration

AI features are implemented in `lib/ai.ts` using the Anthropic SDK.

### Initial ticket analysis

When a customer creates a ticket, the AI returns:

- a short summary
- category
- priority
- suggested first response

The response is constrained to structured JSON and validated before being stored.

### Conversation replies

Agents can generate suggested replies using the full ticket conversation so far.

The prompt includes the original ticket and all persisted customer/agent messages, allowing the suggestion to reflect later context rather than only the initial request.

### Support knowledge

Five support articles from `lib/support-articles.json` are included directly in the system prompts.

There is currently no retrieval or embedding pipeline because the knowledge base is small enough to send in full.

### Failure handling

AI failure never prevents ticket creation.

If the AI request times out, is refused, or returns invalid data:

- the ticket is still stored
- fallback values are used where needed
- the agent can retry analysis from the ticket page

## Known limitations

- No password-reset flow yet.
- Only one image attachment is supported per ticket or message.
- Attachments are stored directly in PostgreSQL rather than object storage.
- Long conversations are sent to the AI in full and are not summarized or truncated yet.
- No automated test suite yet.

## Repository notes

- `.env` is git-ignored; `.env.example` lists the required variables with no real values.
- `prisma/migrations/` contains the full migration history — run `npx prisma migrate deploy` rather than `db push` to reproduce it.
