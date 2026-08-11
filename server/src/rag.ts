import { KnowledgeDoc } from "./models/knowledgedoc.model.js";
import { embedText, cosineSimilarity } from "./embeedings/embeedings.js";
import { TicketType } from "./models/ticket.model.js";

/**
 * Finds the top-N most relevant knowledge docs for a ticket.
 *
 * This does the comparison in plain JS rather than a vector database -
 * completely fine at this scale (a few dozen/hundred docs). If the
 * knowledge base grew to thousands of docs, this is the point you'd
 * swap in MongoDB Atlas Vector Search or a dedicated vector store -
 * the retrieval function's signature wouldn't need to change.
 */
export async function retrieveRelevantDocs(
  ticket: TicketType,
  topN = 3,
  minSimilarity = 0.65,
) {
  const queryText = `${ticket.subject}\n${ticket.body}`;
  const queryEmbedding = await embedText(queryText);

  const allDocs = await KnowledgeDoc.find({});
  if (allDocs.length === 0) return [];

  const scored = allDocs.map((doc: any) => ({
    doc,
    score: cosineSimilarity(queryEmbedding, doc.embedding),
  }));

  scored.sort((a: any, b: any) => b.score - a.score);

  return scored
    .filter((entry: any) => entry.score >= minSimilarity)
    .slice(0, topN);
}
