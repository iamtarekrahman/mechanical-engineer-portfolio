"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const form = event.currentTarget;
    const payload = new FormData(form);
    setStatus("sending");
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: payload,
      });
      const result = await response.json();
      if (!response.ok || result.success !== true)
        throw new Error("Submission failed");
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }
  return (
    <form
      className="contact-form"
      onSubmit={handleSubmit}
      aria-busy={status === "sending"}
      onChange={() => {
        if (status === "sent" || status === "error") setStatus("idle");
      }}
    >
      <input
        type="hidden"
        name="access_key"
        value="b494cdf3-75a9-4d18-b019-75e55253b10e"
      />
      <input
        type="hidden"
        name="subject"
        value="New message from portfolio — Tarek Rahman"
      />
      <input
        type="checkbox"
        name="botcheck"
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
      />
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="cf-name">Your name</label>
          <input
            id="cf-name"
            name="name"
            autoComplete="name"
            required
            placeholder="Full name"
            maxLength={120}
            disabled={status === "sending"}
          />
        </div>
        <div className="form-field">
          <label htmlFor="cf-email">Email address</label>
          <input
            id="cf-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            maxLength={254}
            disabled={status === "sending"}
          />
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="cf-message">What’s on your mind?</label>
        <textarea
          id="cf-message"
          name="message"
          required
          rows={4}
          placeholder="An opportunity, a project, or a good engineering conversation…"
          maxLength={5000}
          disabled={status === "sending"}
        />
      </div>
      <button
        type="submit"
        className="draft-button draft-button--primary"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Sending…" : "Send a message"}{" "}
        <span aria-hidden="true">↗</span>
      </button>
      <p
        className="form-status"
        data-error={status === "error"}
        role="status"
        aria-live="polite"
      >
        {status === "sent"
          ? "Message received. Thank you for getting in touch."
          : status === "error"
            ? "Your message couldn’t be sent. Please try again or use the email link."
            : ""}
      </p>
    </form>
  );
}
