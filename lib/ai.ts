import Anthropic from "@anthropic-ai/sdk";
import supportArticles from "./support-articles.json";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TicketCategory,
  TicketPriority,
} from "./constants";

const client = new Anthropic();

export type AiAnalysis = {
  summary: string;
  category: TicketCategory;
  priority: TicketPriority;
  suggestedResponse: string;
};

export type AiAnalysisResult =
  | { ok: true; data: AiAnalysis }
  | { ok: false; error: string };

export type ConversationTurn = {
  role: "customer" | "agent";
  content: string;
};

export type AiReplyResult =
  | { ok: true; data: { suggestedResponse: string } }
  | { ok: false; error: string };

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    summary: {
      type: "string",
      description: "One or two sentence summary of the customer's main issue.",
    },
    category: { type: "string", enum: [...TICKET_CATEGORIES] },
    priority: { type: "string", enum: [...TICKET_PRIORITIES] },
    suggestedResponse: {
      type: "string",
      description: "A short, professional reply the support agent can review and send.",
    },
  },
  required: ["summary", "category", "priority", "suggestedResponse"],
  additionalProperties: false,
} as const;

const REPLY_SCHEMA = {
  type: "object",
  properties: {
    suggestedResponse: {
      type: "string",
      description: "A short, professional reply the support agent can review and send, addressing the customer's most recent message.",
    },
  },
  required: ["suggestedResponse"],
  additionalProperties: false,
} as const;

function formatArticles(): string {
  return (supportArticles as { title: string; category: string; content: string }[])
    .map((article) => `Title: ${article.title}\nCategory: ${article.category}\nContent: ${article.content}`)
    .join("\n\n");
}

function buildSystemPrompt(): string {
  const articles = formatArticles();

  return `You are an assistant helping a customer support team triage incoming support tickets.

Given a customer's ticket title and message, analyze it and produce exactly these four fields:

- summary: a one- or two-sentence summary of the customer's main issue.
- category: the single best-fitting category, chosen from exactly these six values: "Technical Issue", "Billing", "Account Access", "Feature Request", "General Question", "Other".
- priority: how urgently this ticket needs attention, chosen from exactly these four values: "Low", "Medium", "High", "Urgent".
- suggestedResponse: a short, professional reply the support agent can review, edit, and send to the customer. When one of the reference articles below is relevant, use it to ground the reply (e.g. point the customer toward the right steps) - but write a natural reply, don't quote the article verbatim.

Reference support articles:

${articles}

Respond with only a JSON object matching this exact shape - no prose, no markdown code fences, no explanation before or after:
{"summary": "...", "category": "...", "priority": "...", "suggestedResponse": "..."}`;
}

type RawAiResult =
  | { ok: true; data: unknown }
  | { ok: false; error: string };

async function requestAiJson(
  systemPrompt: string,
  userContent: string,
  schema: { [key: string]: unknown },
  messages: { requestFailed: string; refused: string; parseFailed: string }
): Promise<RawAiResult> {
  let response;
  try {
    response = await client.messages.create(
      {
        model: "claude-haiku-4-5",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userContent,
          },
        ],
        output_config: {
          format: { type: "json_schema", schema },
        },
      },
      { timeout: 30_000 }
    );
  } catch (error) {
    console.error(messages.requestFailed, error);
    return { ok: false, error: "The AI request failed or the AI service is unavailable." };
  }

  if (response.stop_reason === "refusal") {
    return { ok: false, error: messages.refused };
  }

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return { ok: false, error: "The AI response did not contain any text." };
  }

  try {
    const raw = textBlock.text
      .trim()
      .replace(/^```(?:json)?/, "")
      .replace(/```$/, "")
      .trim();
    return { ok: true, data: JSON.parse(raw) };
  } catch (error) {
    console.error(messages.parseFailed, error, textBlock.text);
    return { ok: false, error: "The AI response could not be parsed." };
  }
}

export async function analyzeTicket(title: string, message: string): Promise<AiAnalysisResult> {
  const result = await requestAiJson(
    buildSystemPrompt(),
    `Ticket title: ${title}\n\nCustomer message: ${message}`,
    RESPONSE_SCHEMA,
    {
      requestFailed: "AI analysis request failed:",
      refused: "The AI declined to analyze this ticket.",
      parseFailed: "Failed to parse AI response as JSON:",
    }
  );

  if (!result.ok) return result;

  return validateAnalysis(result.data);
}

function validateAnalysis(value: unknown): AiAnalysisResult {
  if (typeof value !== "object" || value === null) {
    return { ok: false, error: "The AI response was not a JSON object." };
  }

  const { summary, category, priority, suggestedResponse } = value as Record<string, unknown>;

  if (typeof summary !== "string" || summary.trim().length === 0) {
    return { ok: false, error: "The AI response is missing a valid summary." };
  }
  if (
    typeof category !== "string" ||
    !(TICKET_CATEGORIES as readonly string[]).includes(category)
  ) {
    return { ok: false, error: "The AI response is missing a valid category." };
  }
  if (
    typeof priority !== "string" ||
    !(TICKET_PRIORITIES as readonly string[]).includes(priority)
  ) {
    return { ok: false, error: "The AI response is missing a valid priority." };
  }
  if (typeof suggestedResponse !== "string" || suggestedResponse.trim().length === 0) {
    return { ok: false, error: "The AI response is missing a valid suggested response." };
  }

  return {
    ok: true,
    data: {
      summary,
      category: category as TicketCategory,
      priority: priority as TicketPriority,
      suggestedResponse,
    },
  };
}

/** Maps an analysis result to the Prisma ticket fields it should populate. */
export function analysisToTicketUpdate(analysis: AiAnalysisResult) {
  return analysis.ok
    ? {
        aiSummary: analysis.data.summary,
        category: analysis.data.category,
        priority: analysis.data.priority,
        aiSuggestedResponse: analysis.data.suggestedResponse,
      }
    : {
        aiSummary:
          "AI analysis could not be completed. The ticket was saved without AI-generated information.",
      };
}

function buildReplySystemPrompt(): string {
  const articles = formatArticles();

  return `You are an assistant helping a customer support agent reply to an ongoing support ticket conversation.

You will be given the original ticket and the full conversation so far, ending with the customer's most recent message. Write a short, professional reply the agent can review, edit, and send that directly addresses that most recent message - do not repeat earlier replies. When one of the reference articles below is relevant, use it to ground the reply, but write a natural reply, don't quote the article verbatim.

Reference support articles:

${articles}

Respond with only a JSON object matching this exact shape - no prose, no markdown code fences, no explanation before or after:
{"suggestedResponse": "..."}`;
}

export async function generateReply(
  title: string,
  message: string,
  conversation: ConversationTurn[]
): Promise<AiReplyResult> {
  const transcript = [
    `Customer: ${message}`,
    ...conversation.map((turn) => `${turn.role === "agent" ? "Support agent" : "Customer"}: ${turn.content}`),
  ].join("\n\n");

  const result = await requestAiJson(
    buildReplySystemPrompt(),
    `Ticket title: ${title}\n\nConversation so far:\n\n${transcript}`,
    REPLY_SCHEMA,
    {
      requestFailed: "AI reply request failed:",
      refused: "The AI declined to draft a reply.",
      parseFailed: "Failed to parse AI reply response as JSON:",
    }
  );

  if (!result.ok) return result;

  if (typeof result.data !== "object" || result.data === null) {
    return { ok: false, error: "The AI response was not a JSON object." };
  }

  const { suggestedResponse } = result.data as Record<string, unknown>;
  if (typeof suggestedResponse !== "string" || suggestedResponse.trim().length === 0) {
    return { ok: false, error: "The AI response is missing a valid suggested response." };
  }

  return { ok: true, data: { suggestedResponse } };
}
