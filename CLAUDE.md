# masterpiece-portfolio

Default mode: deliver

Personal portfolio v3. `Matheus D. Santos Portfolio v2.html` is the visual source of truth: match it exactly.
Design decisions live in `docs/design/0001-portfolio-v3.md`.

Merging: I open the PR; the owner reviews and merges it manually in the GitHub UI. Never merge, and never ask which strategy to use.

## Env files

Never access `.env`, `.env.local`, or any `.env.*` file except `.env.example`: no reading, printing, parsing, grepping, sourcing, or passing their values to a script or API, not even to debug. Keep `.env.example` complete (every variable, what it is, where to get it), with real values only for non-secret local defaults such as `NEXT_PUBLIC_SITE_URL=http://localhost:3000`. The owner copies values into the real files. To debug configuration, ask the owner or rely on the app's error messages.

## Errors

Every error names its real cause. Never replace a specific failure (invalid API key, unverified sender, missing variable, upstream rejection) with a generic "try again" message.

- Always log the full cause server-side with `@/lib/logger`.
- In development, API responses include the provider's error name and message.
- In production, responses say which kind of failure happened (configuration, credentials rejected, rate limited, validation) but never include secret values, raw provider text, or stack traces.
- Example: `describeSendFailure` in `src/lib/contact.ts`.

## Agent skills

### Issue tracker

Issues live in GitHub Issues for `MatheusDSantossi/masterpiece-portfolio`, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root, created lazily. See `docs/agents/domain.md`.
