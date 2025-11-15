# Project Notebook

## 2025-11-15
- Initialized `.cursor` tools/notes from mycursorrules template.
- Need to assist with Homebrew-based PostgreSQL role setup (ensure `postgres` role exists or create it).
- Confirmed `psql` available via `/opt/homebrew/opt/postgresql@16/bin` after exporting PATH.
- Ran `\du` to verify only `adamjudeh` role existed; created `postgres` superuser role manually.
- Re-ran `\du` to confirm both `adamjudeh` and `postgres` roles are present.
- Switched Node via `nvm use` to v24.5.0 (per `.nvmrc` requirement) and reran `yarn`; install completed with expected peer warnings.
