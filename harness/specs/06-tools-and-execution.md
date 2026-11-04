# 06 — Tools and Execution Environment

> Governed by [DAO.md](../../DAO.md).

## 1. Tool Isolation

All automated mutations must pass through strict sandboxing:
- Path traversal (`../`) and symlink escapes outside the repository root are strictly prevented.
- Write operations to `waldorf.json` use atomic staging and maintain a `.bak` backup file for automatic rollback.
- Sockets and external network connections are disallowed unless explicitly triggered by user consent buttons.
