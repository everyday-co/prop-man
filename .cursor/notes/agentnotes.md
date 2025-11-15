# Agent Notes

## User Preferences
- Use absolute paths for tool arguments whenever possible.
- Maintain `.cursor` structure with `rules`, `tools`, `docs`, and `notes`.
- Keep `project_checklist.md`, `notebook.md`, and `agentnotes.md` continuously updated.
- Before starting work, review `.cursor` contents and summarize previous context.
- Document reasoning behind architectural decisions in this folder.

## Workflow Expectations
- Plan methodically; confirm intent with the user for significant work.
- Create technical specs for major efforts and reflect them in the project checklist.
- Run sequential thinking / deep-planning steps before implementation when applicable.
- Prefer composition, small focused files (<500 LOC), and strict SRP.
- Maintain rigorous testing strategy (unit, integration, feature) and document status.

## Session Context (2025-11-15)
- Initialized `.cursor/tools` and `.cursor/notes` from `Entropicsky/mycursorrules` repo.
- Need to assist user with PostgreSQL role verification via `psql` on macOS.
- Ensure Postgres instructions account for Homebrew setup (role named after macOS user by default).
