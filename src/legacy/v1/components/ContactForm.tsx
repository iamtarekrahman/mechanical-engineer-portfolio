"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        setStatus("sent");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="ink-border bg-paper p-6 sm:p-8">
      <input type="hidden" name="access_key" value="b494cdf3-75a9-4d18-b019-75e55253b10e" />
      <input type="hidden" name="subject" value="New message from portfolio — Tarek Rahman" />

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="mono-label mb-2 block text-graphite">
            Name
          </label>
          <input
            id="cf-name"
            name="name"
            type="text"
            required
            placeholder="Your name"
            className="w-full border border-hairline bg-transparent px-4 py-3 font-body text-ink placeholder:text-graphite/50 focus:border-blueline focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="cf-email" className="mono-label mb-2 block text-graphite">
            Email
          </label>
          <input
            id="cf-email"
            name="email"
            type="email"
            required
            placeholder="you@email.com"
            className="w-full border border-hairline bg-transparent px-4 py-3 font-body text-ink placeholder:text-graphite/50 focus:border-blueline focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="cf-message" className="mono-label mb-2 block text-graphite">
          Project Details
        </label>
        <textarea
          id="cf-message"
          name="message"
          required
          rows={5}
          placeholder="Share a bit about what you'd like to design or build."
          className="w-full resize-y border border-hairline bg-transparent px-4 py-3 font-body text-ink placeholder:text-graphite/50 focus:border-blueline focus:outline-none"
        />
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={status === "sending"}
          className="mono-label w-full rounded-full border border-hairline px-6 py-3 text-ink transition-colors hover:border-blueline hover:text-blueline disabled:opacity-50 sm:w-auto"
        >
          {status === "sending" ? "Sending..." : "Send Message"}
        </button>
      </div>

      {status === "sent" && (
        <p className="mono-label mt-4 text-blueline">
          Message sent — I'll get back to you soon.
        </p>
      )}
      {status === "error" && (
        <p className="mono-label mt-4 text-redline">
          Something went wrong. Please try again or email me directly.
        </p>
      )}
    </form>
  );
}
