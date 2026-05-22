# FarmPulse — project guidance for Claude / OMC

FarmPulse is a 3-person submission to the **Google Cloud Rapid Agent Hackathon (MongoDB track)**,
deadline **June 11, 2026**. An AI agent (Gemini on Vertex AI, via Google ADK) reasons over MongoDB
Atlas data through the MongoDB MCP server to produce farm-field action plans.

## Reference docs (local only — `docs/` is gitignored, not in the public repo)

- `docs/PROJECT_PLAN.md` — the 26-day week-by-week plan, roles, gates, cut list.
- `docs/HACKATHON_BRIEFING.md` — the rules, submission requirements, and judging criteria.
- `docs/ARCHITECTURE_DECISIONS.md` — the four signed ADRs (Vertex AI+ADK, MongoDB MCP only,
  Cloud Run+Firebase, Vector Search+Voyage AI differentiator).
- `docs/SYSTEM_PROMPT.md` — the agent's system prompt and output contract.

These are synced from Drive (`FarmPulse/Project files`) and can drift. If a doc looks stale,
say so rather than trusting it blindly.

## How to use the plan — follow it, but think critically

The plan is a **strong default, not the one true source of truth.** Two levels of authority:

1. **Hackathon guidelines (`HACKATHON_BRIEFING.md`) are the higher authority** — they define what
   we're judged on (Technological Implementation, Design, Potential Impact, Quality of the Idea,
   each weighted equally) and the hard rules we cannot break.
2. **The project plan and ADRs are our chosen path** to score well against those guidelines.

So, before implementing a planned item:

- **Sanity-check it against the guidelines and the current state of the code.** If a plan step seems
  misaligned with the judging criteria, suboptimal, stale, or contradicted by what's actually in the
  repo, **say so and propose an alternative before building it** — don't silently follow, and don't
  silently deviate.
- **Respect the signed ADRs.** They were deliberately decided to resolve plan-vs-rules conflicts.
  Don't re-litigate them casually; if you think one should change, flag it as a proposed ADR-005+
  with reasoning (the ADR doc explains the supersede process).
- **Honour the cut list** (`PROJECT_PLAN.md` §6). Scope blowout is risk #1. Anything on the cut list
  is auto-deferred to Future Extensions unless explicitly reopened.
- **Weigh decisions by judging leverage and the 26-day timeline**, not just "is it cool." Prefer the
  demo-critical, rule-compliant path.

When the plan and the guidelines genuinely conflict, the guidelines win — and that conflict is worth
surfacing explicitly.

## Team & lanes

Three people, primary owners per lane (everyone reviews everything):

- **FE** — React/Vite/Tailwind frontend, map, agent-progress UI, Firebase Hosting.
- **BE-1** — the agent: Google ADK, Vertex AI Gemini, system prompt, tools, the Vector Search
  differentiator, MongoDB MCP lifecycle.
- **BE-2** — *this repo's primary author* — data model, API surface, schemas, seed data, Dockerfile,
  Cloud Run deploy, Secret Manager, auth middleware.

Default to **BE-2 (Data & Infra)** work. When a task drifts into BE-1's agent/AI lane or FE's
frontend lane, **flag it** — it may belong to a teammate or need coordination at standup.

## Hard rules that must never be violated (from the briefing)

- **Google Cloud AI only** — Gemini on Vertex AI / Agent Platform. No third-party AI providers.
- **Partner integration via MCP** — MongoDB access from the agent goes through the official MongoDB
  MCP server, not direct PyMongo. (PyMongo/Motor allowed only for non-agent admin paths, e.g. seeding.)
- **No services that compete with Google Cloud or MongoDB** — no Railway/Heroku/AWS/Azure; no Vercel
  for the backend; no swapping MongoDB for another DB. Backend = Cloud Run, frontend = Firebase Hosting.
- **Original work, public repo, OSI license, ~3-min video, hosted URL** that matches the demo.
- Keep no secrets in the repo; nothing in `docs/` ships publicly.
