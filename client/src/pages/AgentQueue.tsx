import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function formatStatus(status) {
  return status.replace("_", " ");
}

function TicketRow({ ticket }) {
  const [expanded, setExpanded] = useState(false);

  const confidencePct =
    ticket.confidenceScore != null ? Math.round(ticket.confidenceScore * 100) : null;

  return (
    <div className="ticket-row">
      <div className="ticket-summary" onClick={() => setExpanded(!expanded)}>
        <div className="ticket-summary-left">
          <span className="ticket-subject">{ticket.subject}</span>
          <span className="ticket-meta">
            {ticket.customerEmail} · {new Date(ticket.createdAt).toLocaleString()}
          </span>
        </div>
        <div className="ticket-badges">
          {ticket.category && <span className="badge status-new">{ticket.category}</span>}
          {ticket.urgency && <span className="badge status-new">{ticket.urgency}</span>}
          <span className={`badge status-${ticket.status}`}>{formatStatus(ticket.status)}</span>
        </div>
      </div>

      {expanded && (
        <div className="ticket-detail">
          <div className="detail-block">
            <div className="detail-label">Customer message</div>
            <div className="detail-text">{ticket.body}</div>
          </div>

          {ticket.aiDraft ? (
            <div className="detail-block">
              <div className="detail-label">
                AI drafted reply
                {confidencePct != null && (
                  <span
                    className="confidence-pill"
                    style={{
                      background: confidencePct >= 70 ? "var(--green-bg)" : "var(--amber-bg)",
                      color: confidencePct >= 70 ? "var(--green-text)" : "var(--amber-text)",
                    }}
                  >
                    {confidencePct}% confidence
                  </span>
                )}
              </div>
              <div className="detail-text">{ticket.aiDraft}</div>
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
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadTickets() {
    try {
      const res = await fetch(`${API_URL}/tickets`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setTickets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
    const interval = setInterval(loadTickets, 5000); // picks up AI drafts as they land
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page wide">
      <h1>Agent queue</h1>
      <p className="subtitle">Tickets and their AI-drafted replies.</p>

      {loading && tickets.length === 0 && <p className="loading-text">Loading tickets...</p>}
      {error && <p className="field-error">{error}</p>}

      {!loading && tickets.length === 0 && (
        <div className="empty-state">No tickets here yet.</div>
      )}

      {tickets.map((ticket) => (
        <TicketRow key={ticket._id} ticket={ticket} />
      ))}
    </div>
  );
}