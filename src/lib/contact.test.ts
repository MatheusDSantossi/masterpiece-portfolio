import { describe, expect, it } from "vitest";
import { contactSchema, describeMissingConfig, describeSendFailure } from "./contact";

const valid = { name: "Ana", email: "ana@example.com", message: "Hi Matheus, let's talk about a role." };

describe("contactSchema", () => {
  it("accepts a valid message and trims whitespace", () => {
    const result = contactSchema.safeParse({ ...valid, name: "  Ana  ", website: "" });
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe("Ana");
  });

  it("keeps the honeypot value so the route can drop bot submissions", () => {
    expect(contactSchema.safeParse({ ...valid, website: "http://spam.example" }).data?.website).toBe("http://spam.example");
  });

  it.each([
    ["empty name", { ...valid, name: "   " }],
    ["bad email", { ...valid, email: "not-an-email" }],
    ["short message", { ...valid, message: "hey" }],
    ["huge message", { ...valid, message: "x".repeat(5001) }],
  ])("rejects %s", (_, input) => {
    expect(contactSchema.safeParse(input).success).toBe(false);
  });
});

describe("describeSendFailure", () => {
  it.each([
    [{ name: "validation_error", message: "API key is invalid" }, "email_auth", 503],
    [{ name: "missing_api_key", message: "Missing API key in the authorization header." }, "email_auth", 503],
    [{ name: "restricted_api_key", message: "This API key is restricted to only send emails" }, "email_auth", 503],
    [{ name: "validation_error", message: "The matheusdsantosr.com domain is not verified." }, "email_sender", 503],
    [{ name: "invalid_from_address", message: "Invalid `from` field." }, "email_sender", 503],
    [{ name: "rate_limit_exceeded", message: "Too many requests." }, "email_rate_limited", 429],
    [{ name: "daily_quota_exceeded", message: "You have reached your daily email sending quota." }, "email_rate_limited", 429],
    [{ name: "validation_error", message: "Invalid `to` field." }, "email_rejected", 502],
    [{ name: "internal_server_error", message: "Unexpected error." }, "email_failed", 502],
  ])("maps %o to %s", (failure, code, status) => {
    expect(describeSendFailure(failure, false)).toMatchObject({ code, status });
  });

  it("never returns the provider's raw text in production", () => {
    const failure = { name: "validation_error", message: "API key is invalid" };
    expect(describeSendFailure(failure, false).error).not.toContain(failure.message);
  });

  it("appends the provider's error in development", () => {
    expect(describeSendFailure({ name: "validation_error", message: "API key is invalid" }, true).error).toContain(
      "(validation_error: API key is invalid)",
    );
  });
});

describe("describeMissingConfig", () => {
  it("names every missing variable", () => {
    const { error, status } = describeMissingConfig(["RESEND_API_KEY", "CONTACT_FROM_EMAIL"]);
    expect(status).toBe(503);
    expect(error).toContain("RESEND_API_KEY, CONTACT_FROM_EMAIL");
  });
});
