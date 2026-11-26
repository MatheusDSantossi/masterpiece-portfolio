import { Resend } from "resend";
import { z } from "zod";
import { contactSchema, type ContactResponse } from "@/lib/contact";
import { logger } from "@/lib/logger";

const json = (body: ContactResponse, status: number) => Response.json(body, { status });

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "Expected a JSON body." }, 400);
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return json({ ok: false, error: "Some fields need another look.", fieldErrors: z.flattenError(parsed.error).fieldErrors }, 400);
  }

  const { name, email, message, website } = parsed.data;
  // Bots that fill the honeypot get a normal-looking success so they don't retry.
  if (website) return json({ ok: true }, 200);

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    logger.error("contact form is not configured", { hasKey: Boolean(apiKey), hasTo: Boolean(to), hasFrom: Boolean(from) });
    return json({ ok: false, error: "The contact form is offline right now. Please reach me on LinkedIn." }, 503);
  }

  const { error } = await new Resend(apiKey).emails.send({
    from,
    to,
    replyTo: email,
    subject: `Portfolio message from ${name}`,
    text: `${message}\n\n${name} <${email}>`,
  });
  if (error) {
    logger.error("contact email failed", { name: error.name, message: error.message });
    return json({ ok: false, error: "Your message didn't go through. Please try again in a minute." }, 502);
  }

  return json({ ok: true }, 200);
}
