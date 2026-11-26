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

export type ContactResponse = { ok: true } | { ok: false; error: string; fieldErrors?: ContactFieldErrors };
