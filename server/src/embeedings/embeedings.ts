import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv"
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

/**
 * Turns a piece of text into a vector. Used both when seeding the
 * knowledge base and when embedding an incoming ticket at query time.
 */
export async function embedText(text:string) {
  const result = await embeddingModel.embedContent(text);
  console.log("result form embeedings", result);
  return result.embedding.values; // plain array of numbers
}

/**
 * Standard cosine similarity between two equal-length vectors.
 * Returns a value from -1 to 1 - closer to 1 means more similar.
 */
export function cosineSimilarity(a:any, b:any) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
