import mongoose, {InferSchemaType} from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      enum: ["billing", "technical", "account", "general", null],
      default: null,
    },
    urgency: {
      type: String,
      enum: ["low", "medium", "high", null],
      default: null,
    },
    status: {
      type: String,
      enum: ["new", "queued", "ai_drafted", "approved", "escalated", "resolved"],
      default: "new",
    },
    aiDraft: {
      type: String,
      default: null,
    },
    finalReply: {
      type: String,
      default: null,
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },
    sourceDocIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "KnowledgeDoc",
      },
    ],
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true } // gives us createdAt / updatedAt automatically
);

export type TicketType = InferSchemaType<typeof ticketSchema>;


export const Ticket = mongoose.model("Ticket", ticketSchema);