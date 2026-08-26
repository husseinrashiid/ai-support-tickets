# AI Support Tickets

An AI-powered customer support ticket system. Customers submit tickets and message with support agents; agents triage tickets with AI-generated summaries, categories, priorities, and suggested replies.

## Main features

**Core ticket flow**
- Submit a ticket (title + message, optional image attachment).
- On submission, Claude analyzes the ticket in the background and returns a summary, category, priority, and a suggested first response - ticket creation returns immediately rather than waiting on the AI call.
- Agents can edit and save the suggested response, and retry AI analysis if it failed or the ticket has no category yet.
- Agent dashboard with ticket counts (open / in progress / completed / total), plus filtering, sorting, and pagination over the ticket list. Filters, sort, and page are preserved when opening a ticket and navigating back.

**Authentication and roles**
- Email/password auth with signed session cookies (`jose` JWT, `bcryptjs` password hashing).
- Login is rate-limited, and after 5 consecutive failed attempts for the same email from the same IP, that email is locked out from that IP for 5 minutes.
- Two roles: **customer** (owns and manages only their own tickets) and **agent** (sees and manages every ticket).
- Public registration always creates a customer account — agent accounts can't be self-registered, only provisioned via the `create-agent` script.
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
npm run create-agent -- agent@example.com Agent123!
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

## Test credentials

**Agent** (created by the install step above):

| Email | Password |
|---|---|
| `agent@example.com` | `Agent123!` |

**Customer:** there's no fixed account — register your own at `/register` (tickets are scoped to whichever customer creates them, so a fresh account is the natural way to test the customer flow).

To create additional agent accounts, rerun `npm run create-agent -- <email> <password>`.

## Sample data

No seed script is included — the app is fully usable from an empty database: register a customer account, submit a ticket (AI analysis runs automatically), then log in as the agent above to triage it. Nothing is gated behind data you can't produce yourself through the UI.

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

The response is constrained to structured JSON and validated before being stored. Analysis runs after the ticket is saved (via Next.js's `after()`) rather than blocking the create request, so a newly created ticket briefly shows as unclassified ("Needs review") until analysis finishes and the page is refreshed.

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

### Limitations of the AI feature

`claude-haiku-4-5` was chosen for speed and cost over maximum accuracy, since triage is a bounded classification/drafting task rather than deep reasoning. That means it can still misclassify an ambiguous ticket or draft a reply that needs editing — which is why the suggested response is always presented as an editable draft for an agent to review, never sent automatically.

## Known limitations

- Attachments are stored directly in PostgreSQL rather than object storage.
- Long conversations are sent to the AI in full and are not summarized or truncated yet.
- No automated test suite yet.
- Login/register rate limiting and the login lockout counter are in-memory, per-process state (`lib/rate-limit.ts`) — fine for a single instance, but resets on restart and wouldn't be shared across multiple instances behind a load balancer.

## Possible future improvements

- Password reset flow.
- Two-factor authentication (2FA), especially for agent accounts.
- Object storage (e.g. S3) for attachments instead of storing bytes in Postgres, for larger files.
- Real-time conversation updates (polling or websockets) instead of a manual refresh after sending a message.
- Multiple attachments per message instead of one.

## Repository notes

- `.env` is git-ignored; `.env.example` lists the required variables with no real values.
- `prisma/migrations/` contains the full migration history — run `npx prisma migrate deploy` rather than `db push` to reproduce it.
