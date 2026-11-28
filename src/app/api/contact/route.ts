import { Resend } from "resend";
import { z } from "zod";
import {
  contactSchema,
  describeMissingConfig,
  describeSendFailure,
  type ContactResponse,
  type SendFailure,
} from "@/lib/contact";
import { logger } from "@/lib/logger";

const json = (body: ContactResponse, status: number) =>
  Response.json(body, { status });
const fail = ({ status, code, error }: SendFailure) =>
  json({ ok: false, code, error }, status);
/** Development responses carry the provider's own error so the cause is visible in the browser. */
const detail = process.env.NODE_ENV !== "production";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "Expected a JSON body." }, 400);
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return json(
      {
        ok: false,
        error: "Some fields need another look.",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      },
      400,
    );
  }

  const { name, email, message, website } = parsed.data;
  // Bots that fill the honeypot get a normal-looking success so they don't retry.
  if (website) return json({ ok: true }, 200);

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    const missing = Object.entries({
      RESEND_API_KEY: apiKey,
      CONTACT_TO_EMAIL: to,
      CONTACT_FROM_EMAIL: from,
    })
      .filter(([, value]) => !value)
      .map(([key]) => key);
    logger.error("contact form is not configured", { missing });
    return fail(describeMissingConfig(missing));
  }

  let result: Awaited<ReturnType<Resend["emails"]["send"]>>;
  try {
    result = await new Resend(apiKey).emails.send({
      from,
      to,
      replyTo: email,
      subject: `Portfolio message from ${name}`,
      text: `${message}\n\n${name} <${email}>`,
    });
  } catch (thrown) {
    const reason = thrown instanceof Error ? thrown.message : String(thrown);
    logger.error("contact email service unreachable", { reason });
    return fail({
      status: 502,
      code: "email_unreachable",
      error: `Couldn't reach the email service. Please try again in a minute.${detail ? ` (${reason})` : ""}`,
    });
  }
  if (result.error) {
    logger.error("contact email failed", {
      name: result.error.name,
      message: result.error.message,
    });
    return fail(describeSendFailure(result.error, detail));
  }

  return json({ ok: true }, 200);
}
