import { SchemaType } from "@google/generative-ai"; // Import SchemaType
import { model } from "./config/geminiclient.js";
import { TicketType } from "./models/ticket.model.js";

const CATEGORIES = ["billing", "technical", "account", "general"];
const URGENCIES = ["low", "medium", "high"];

// Fix 1: Use SchemaType enums instead of raw strings to satisfy TypeScript
const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    category: { type: SchemaType.STRING, enum: CATEGORIES },
    urgency: { type: SchemaType.STRING, enum: URGENCIES },
    draft: { type: SchemaType.STRING },
    confidence: { type: SchemaType.NUMBER },
  },
  required: ["category", "urgency", "draft", "confidence"],
};

function buildPrompt(ticket: TicketType, knowledgeContext: string) {
  return `You are a support agent assistant for a SaaS product. Read the customer's
ticket and respond with JSON only, matching the required schema.

Ticket subject: ${ticket.subject}
Ticket message: ${ticket.body}

${
  knowledgeContext
    ? `Relevant help docs (use ONLY these as the factual basis for your draft):\n${knowledgeContext}`
    : "No matching help docs were found for this ticket."
}

Instructions:
- category: classify as one of billing, technical, account, general.
- urgency: low, medium, or high based on how time-sensitive/impactful this is.
- draft: write a short, friendly reply (2-4 sentences) grounded ONLY in the
  provided help docs. If no docs were provided or they don't actually answer
  the question, write a draft that honestly says a human will follow up,
  and set confidence low.
- confidence: a number from 0 to 1 for how well the help docs actually
  answer this specific question. Low confidence if docs are missing,
  irrelevant, or only partially relevant. Do not inflate this number.`;
}

// Fix 2: Keep the "export" keyword here, but delete the module.exports at the bottom.
export async function processTicketWithAI(ticket: TicketType, knowledgeContext: string) {
  const prompt = buildPrompt(ticket, knowledgeContext);

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema,
      temperature: 0.3,
    },
  });

  const text = result.response.text();
  const parsed = JSON.parse(text);

  return {
    category: parsed.category,
    urgency: parsed.urgency,
    aiDraft: parsed.draft,
    confidenceScore: Math.max(0, Math.min(1, parsed.confidence)),
  };
}

