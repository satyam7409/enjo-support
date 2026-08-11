import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Ticket {
  _id: string;
  subject: string;
  customerEmail: string;
  createdAt: string;
  category?: string;
  urgency?: string;
  status: "new" | "processing" | "escalated" | "resolved" | string;
  confidenceScore?: number | null;
  body: string;
  aiDraft?: string | null;
}

function formatStatus(status: string): string {
  return status.replace("_", " ");
}

interface TicketRowProps {
  ticket: Ticket;
}

function TicketRow({ ticket }: TicketRowProps) {
  const [expanded, setExpanded] = useState(false);

  const confidencePct =
    ticket.confidenceScore != null
      ? Math.round(ticket.confidenceScore * 100)
      : null;

  return (
    <div className="ticket-row">
      <div
        className="ticket-summary"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="ticket-summary-left">
          <span className="ticket-subject">
            {ticket.subject}
          </span>

          <span className="ticket-meta">
            {ticket.customerEmail} ·{" "}
            {new Date(ticket.createdAt).toLocaleString()}
          </span>
        </div>

        <div className="ticket-badges">
          {ticket.category && (
            <span className="badge status-new">
              {ticket.category}
            </span>
          )}

          {ticket.urgency && (
            <span className="badge status-new">
              {ticket.urgency}
            </span>
          )}

          <span className={`badge status-${ticket.status}`}>
            {formatStatus(ticket.status)}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="ticket-detail">
          <div className="detail-block">
            <div className="detail-label">
              Customer message
            </div>

            <div className="detail-text">
              {ticket.body}
            </div>
          </div>

          {ticket.aiDraft ? (
            <div className="detail-block">
              <div className="detail-label">
                AI drafted reply

                {confidencePct != null && (
                  <span
                    className="confidence-pill"
                    style={{
                      background:
                        confidencePct >= 70
                          ? "var(--green-bg)"
                          : "var(--amber-bg)",
                      color:
                        confidencePct >= 70
                          ? "var(--green-text)"
                          : "var(--amber-text)",
                    }}
                  >
                    {confidencePct}% confidence
                  </span>
                )}
              </div>

              <div className="detail-text">
                {ticket.aiDraft}
              </div>
            </div>
          ) : (
            <p className="loading-text">
              {ticket.status === "escalated"
                ? "No confident AI draft - needs a human reply."
                : "AI is still processing this ticket..."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function AgentQueue() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function loadTickets(): Promise<void> {
    try {
      setError(null);

      const res = await fetch(`${API_URL}/tickets`);

      const data: Ticket[] | { error: string } = await res.json();

      if (!res.ok) {
        if ("error" in data) {
          throw new Error(data.error);
        }

        throw new Error("Something went wrong");
      }

      setTickets(data as Ticket[]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();

    const interval = setInterval(loadTickets, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page wide">
      <h1>Agent queue</h1>

      <p className="subtitle">
        Tickets and their AI-drafted replies.
      </p>

      {loading && tickets.length === 0 && (
        <p className="loading-text">
          Loading tickets...
        </p>
      )}

      {error && (
        <p className="field-error">
          {error}
        </p>
      )}

      {!loading && tickets.length === 0 && (
        <div className="empty-state">
          No tickets here yet.
        </div>
      )}

      {tickets.map((ticket) => (
        <TicketRow
          key={ticket._id}
          ticket={ticket}
        />
      ))}
    </div>
  );
}