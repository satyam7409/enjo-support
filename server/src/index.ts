import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import {
  validateBody,
  createTicketSchema,
  updateTicketSchema,
} from "./ticketvalidator.js";
import { Ticket } from "./models/ticket.model.js";
dotenv.config();
import { enqueueTicket, ticketQueue } from "./ticketqueue.js";
import cors from "cors"

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

app.use(express.json());

app.post("/tickets", async (req, res) => {
  try {
    const { subject, body, customerEmail } = req.body;
    
    const ticket = await Ticket.create({
      subject,
      body,
      customerEmail,
      status: "new",
    });

    console.log("ticket:", ticket);
    // Push a lightweight job to the queue for the worker to pick up.
    // await ticketQueue.add("process-ticket", { ticketId: ticket._id.toString() });
    // ticket.status = "queued"; await ticket.save();
        // Push a lightweight job to the queue for the worker to pick up.
    await enqueueTicket(ticket._id.toString());
    ticket.status = "queued";
    await ticket.save();
    console.log("hehe",ticketQueue);
    
    return res.status(201).json({
      message: "Ticket received",
      ticket: {
        id: ticket._id,
        subject: ticket.subject,
        status: ticket.status,
        createdAt: ticket.createdAt,
      },
    });
  } catch (err) {
    console.error("Failed to create ticket:", err);
    return res
      .status(500)
      .json({ error: "Something went wrong. Please try again." });
  }
});

// GET /api/tickets  -> returns all tickets, newest first
app.get("/tickets", async (req, res) => {
  try {
    const tickets = await Ticket.find({}).sort({ createdAt: -1 });
    return res.json(tickets);
  } catch (err) {
    console.error("Failed to fetch tickets:", err);
    return res.status(500).json({ error: "Something went wrong." });
  }
});

// GET /api/tickets/:id  -> single ticket detail (for the agent review screen)
app.get("/:id", async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate(
      "sourceDocIds",
    );
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    return res.json(ticket);
  } catch (err) {
    console.error("Failed to fetch ticket:", err);
    return res.status(400).json({ error: "Invalid ticket id" });
  }
});

// PATCH /api/tickets/:id  -> agent approves, edits, or escalates
app.patch("/:id", validateBody(updateTicketSchema), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.status === "resolved") updates.resolvedAt = new Date();

    const ticket = await Ticket.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    return res.json(ticket);
  } catch (err) {
    console.error("Failed to update ticket:", err);
    return res.status(400).json({ error: "Invalid update" });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "TypeScript backend is running successfully!" });
});

connectDB();
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
