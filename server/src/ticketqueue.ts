import { connection } from "./config/redis.js";
import { Queue } from "bullmq";

export const ticketQueue = new Queue("ticket-processing", { connection });

/**
 * Adds a lightweight job to the queue. We only pass the ticketId —
 * the worker fetches the current ticket from MongoDB when it runs,
 * so we never process stale data.
 */
export async function enqueueTicket(ticketId: string) {
  await ticketQueue.add(
    "process-ticket",
    { ticketId },
    {
      attempts: 3, // retry a couple times if the AI call fails/times out
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: 100, // keep the queue tidy
      removeOnFail: 500,
    },
  );
  console.log("queue:",ticketQueue); 
}

