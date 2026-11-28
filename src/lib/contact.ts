import { z } from "zod";

/** Shared by the form and the API route so both validate the same way. */
export const contactSchema = z.object({
  name: z.string().trim().min(1, "Tell me your name.").max(100, "That name is too long."),
  email: z.email("That email doesn't look right.").max(200),
  message: z.string().trim().min(10, "Write at least a sentence.").max(5000, "Keep it under 5000 characters."),
  /** Honeypot: hidden from people, filled in by naive bots. The route checks it. */
  website: z.string().max(500).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export type ContactFieldErrors = Partial<Record<keyof ContactInput, string[]>>;

export type ContactResponse = { ok: true } | { ok: false; error: string; code?: string; fieldErrors?: ContactFieldErrors };

/** What the email provider reported. Mirrors the error object Resend returns. */
export type SendError = { name: string; message: string };

export type SendFailure = { status: number; code: string; error: string };

/**
 * Turns a provider error into a message that says what actually failed. Public messages never include
 * secrets or the provider's raw text; with `detail` on (development), the provider's name and message
 * are appended so the cause can be fixed from the browser.
 */
export function describeSendFailure(failure: SendError, detail: boolean): SendFailure {
  const raw = `${failure.name}: ${failure.message}`;
  const text = raw.toLowerCase();
  const pick = (): SendFailure => {
    if (/api[_ ]key/.test(text) || failure.name === "invalid_access")
      return { status: 503, code: "email_auth", error: "The email service rejected this site's credentials, so the message wasn't sent." };
    if (failure.name === "invalid_from_address" || /domain|sender|from address/.test(text))
      return { status: 503, code: "email_sender", error: "The email service doesn't accept this site's sender address yet, so the message wasn't sent." };
    if (/rate_limit|quota/.test(failure.name))
      return { status: 429, code: "email_rate_limited", error: "Too many messages were sent recently. Please try again in a few minutes." };
    if (failure.name === "validation_error")
      return { status: 502, code: "email_rejected", error: "The email service rejected the message." };
    return { status: 502, code: "email_failed", error: "The email service failed to send the message." };
  };
  const result = pick();
  return detail ? { ...result, error: `${result.error} (${raw})` } : result;
}

/** Message for missing server configuration. Variable names are not secret, so they are always listed. */
export function describeMissingConfig(missing: readonly string[]): SendFailure {
  return {
    status: 503,
    code: "not_configured",
    error: `The contact form isn't configured on the server (missing ${missing.join(", ")}). Please reach me on LinkedIn.`,
  };
}
