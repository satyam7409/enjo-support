import { Worker } from "bullmq";
import { connection } from "./config/redis.js";
import { Ticket } from "./models/ticket.model.js";
import mongoose from "mongoose";
import { retrieveRelevantDocs } from "./rag.js";
import { processTicketWithAI } from "./pipeline.js";
import dotenv from "dotenv"
dotenv.config();

async function connectDB() {
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ticket-triage",
  );
  console.log("Worker connected to MongoDB");
}

export const worker = new Worker(
  "ticket-processing",
  async (job) => {
    const { ticketId } = job.data;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      console.warn(`Ticket ${ticketId} not found, skipping job ${job.id}`);
      return;
    }

    // ---- Retrieval: find relevant knowledge docs for this ticket ----
    const relevantDocs = await retrieveRelevantDocs(ticket);
    const knowledgeContext = relevantDocs.length
      ? relevantDocs
          .map((entry:any) => `- ${entry.doc.title}: ${entry.doc.content}`)
          .join("\n\n")
      : null;

    // ---- AI logic: classify + draft, grounded in the retrieved docs ----
    let result;
    try {
      result = await processTicketWithAI(ticket, knowledgeContext);
    } catch (err) {
      console.error(`AI call failed for ticket ${ticketId}`);
      // Fail safe: don't leave the ticket stuck - send it straight to a human.
      ticket.status = "escalated";
      await ticket.save();
      throw err; // let BullMQ's retry/backoff handle it
    }

    ticket.category = result.category;
    ticket.urgency = result.urgency;
    ticket.aiDraft = result.aiDraft;
    ticket.confidenceScore = result.confidenceScore;
    ticket.sourceDocIds = relevantDocs.map((entry:any) => entry.doc._id);
    ticket.status = result.confidenceScore < 0.4 ? "escalated" : "ai_drafted";

    await ticket.save();
    console.log(`Ticket ${ticketId} processed -> status: ${ticket.status}`);
  },
  {
    connection,
    concurrency: 5, // process up to 5 tickets in parallel
  },
);

worker.on("failed", (job, err) => {
  console.error(`Job ${job!.id} failed:`, err.message);
});

connectDB().then(() => {
  console.log("Ticket worker is running and waiting for jobs...");
});
