import { describe, expect, it } from "vitest";
import { contactSchema } from "./contact";

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
