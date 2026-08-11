import * as z from "zod";
import { Request, Response, NextFunction } from "express";
import { TicketType } from "./models/ticket.model.js";

// Used when a customer submits a new ticket
export const createTicketSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters")
    .max(150, "Subject must be under 150 characters"),
  body: z
    .string()
    .trim()
    .min(10, "Please describe your issue in a bit more detail")
    .max(3000, "Message is too long"),
  customerEmail: z.string().trim().email("Enter a valid email address"),
});

// Used when an agent approves, edits, or escalates a ticket
export const updateTicketSchema = z.object({
  status: z
    .enum(["ai_drafted", "approved", "escalated", "resolved"])
    .optional(),
  finalReply: z.string().trim().min(1).max(3000).optional(),
});

// Express middleware factory: validates req.body against a zod schema
export function validateBody(schema:any) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.error.flatten().fieldErrors,
      });
    }

    // replace req.body with the parsed/sanitized data (trimmed, typed, etc.)
    req.body = result.data;
    next();
  };
}
