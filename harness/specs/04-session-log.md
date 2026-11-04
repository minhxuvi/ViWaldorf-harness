# 04 — Session Log Contract

> Governed by [DAO.md](../../DAO.md).

## 1. Core Contract

**"Model-Visible ⟺ Logged"**:
Every input, system instruction, tool declaration, tool call, and tool result visible to any model must be deterministically logged to JSON Lines (`.jsonl`) session files.

## 2. Privacy Guarantees

- Secrets, environment variable values, and API keys are redacted before writing to session logs.
- Real student personal data is never recorded.
- Session logs are stored locally by default.
