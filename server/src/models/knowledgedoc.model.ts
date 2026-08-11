import mongoose from "mongoose";
const knowledgeDocSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["billing", "technical", "account", "general"],
      required: true,
    },
    embedding: {
      type: [Number], // vector from the embeddings API
      required: true,
    },
  },
  { timestamps: true }
);

export const KnowledgeDoc = mongoose.model("KnowledgeDoc", knowledgeDocSchema);