"use client";

import { useState, type FormEvent } from "react";
import { contactSchema, type ContactResponse } from "@/lib/contact";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

function isContactResponse(value: unknown): value is ContactResponse {
  return typeof value === "object" && value !== null && "ok" in value;
}

export function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      setStatus({ kind: "error", message: parsed.error.issues[0]?.message ?? "Check the form and try again." });
      return;
    }

    setStatus({ kind: "sending" });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const body: unknown = await response.json();
      if (isContactResponse(body) && body.ok) {
        form.reset();
        setStatus({ kind: "sent" });
      } else {
        setStatus({ kind: "error", message: isContactResponse(body) && !body.ok ? body.error : "Something went wrong." });
      }
    } catch {
      setStatus({ kind: "error", message: "Couldn't reach the server. Check your connection and try again." });
    }
  }

  const message =
    status.kind === "sent" ? "Thanks. Your message is on its way, and I'll reply soon." : status.kind === "error" ? status.message : "";

  return (
    <form className="glass rv" onSubmit={onSubmit} noValidate>
      <label htmlFor="f-name">
        Name
        <input id="f-name" name="name" required autoComplete="name" maxLength={100} />
      </label>
      <label htmlFor="f-mail">
        Email
        <input id="f-mail" name="email" type="email" required autoComplete="email" maxLength={200} />
      </label>
      <label htmlFor="f-msg">
        Your message
        <textarea id="f-msg" name="message" rows={5} required maxLength={5000} />
      </label>
      <label className="hp" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <button className="btn pri" type="submit" disabled={status.kind === "sending"}>
        {status.kind === "sending" ? "Sending…" : "Send message"}
      </button>
      <p id="sent" role="status" className={status.kind === "error" ? "err" : undefined}>
        {message}
      </p>
    </form>
  );
}
