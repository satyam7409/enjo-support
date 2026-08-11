import { useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

interface FormData {
  subject: string;
  body: string;
  customerEmail: string;
}

interface Ticket {
  id: string;
  subject: string;
  body: string;
  customerEmail: string;
}

interface TicketResponse {
  ticket: Ticket;
  error?: string;
}

const initialForm: FormData = {
  subject: "",
  body: "",
  customerEmail: "",
};

export default function SubmitTicket() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [confirmedTicket, setConfirmedTicket] =
    useState<Ticket | null>(null);
  const [formError, setFormError] =
    useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    e.preventDefault();

    setFormError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data: TicketResponse = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Something went wrong"
        );
      }

      setConfirmedTicket(data.ticket);
      setForm(initialForm);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmedTicket) {
    return (
      <div className="page">
        <div className="card confirmation">
          <div className="confirmation-icon">✓</div>

          <h1>Ticket received</h1>

          <p className="subtitle">
            Ticket #{confirmedTicket.id.slice(-6)} ·{" "}
            {confirmedTicket.subject}
          </p>

          <p
            style={{
              fontSize: 14,
              color: "var(--text-muted)",
            }}
          >
            We'll get back to you soon.
          </p>

          <button
            className="btn-secondary"
            style={{ marginTop: 20 }}
            onClick={() => setConfirmedTicket(null)}
          >
            Submit another ticket
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Contact support</h1>

      <p className="subtitle">
        Tell us what's going on and we'll help you sort it out.
      </p>

      <form className="card" onSubmit={handleSubmit}>
        <label htmlFor="customerEmail">
          Your email
        </label>

        <input
          id="customerEmail"
          name="customerEmail"
          type="email"
          value={form.customerEmail}
          onChange={handleChange}
          placeholder="you@example.com"
          required
        />

        <label htmlFor="subject">
          Subject
        </label>

        <input
          id="subject"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          placeholder="Briefly describe the issue"
          required
        />

        <label htmlFor="body">
          Message
        </label>

        <textarea
          id="body"
          name="body"
          value={form.body}
          onChange={handleChange}
          placeholder="Give us the details - what happened, when, and anything you've already tried."
          required
        />

        {formError && (
          <p className="field-error">
            {formError}
          </p>
        )}

        <button
          type="submit"
          className="btn-primary"
          disabled={submitting}
          style={{
            marginTop: 20,
            width: "100%",
          }}
        >
          {submitting
            ? "Submitting..."
            : "Submit ticket"}
        </button>
      </form>
    </div>
  );
}