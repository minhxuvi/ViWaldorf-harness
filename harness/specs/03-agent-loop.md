# 03 — Agent Loop and Tool Execution

> Governed by [DAO.md](../../DAO.md).

## 1. Agent Loop Concept

The agent loop executes multi-step tasks by cycling through reasoning, tool invocation, result distillation, and final response generation.

```mermaid
sequenceDiagram
    participant User
    participant Orchestrator as Orchestrator (muse-wonder-1.0)
    participant Worker as Worker (muse-spark-1.3)
    participant Tools as Sandboxed Tools

    User->>Orchestrator: User Prompt
    Orchestrator->>Orchestrator: Plan & Decompose
    Orchestrator->>Worker: Delegate Subtask
    Worker->>Tools: Invoke Tool (e.g. xuvi_garden_update)
    Tools-->>Worker: Tool Result
    Worker-->>Orchestrator: Distilled Synthesis
    Orchestrator-->>User: Final User-Facing Response
```

## 2. Invariants

1. **Context Distillation**: Workers execute subtasks in separate conversation contexts and deliver only distilled summaries to the parent context to keep context windows clean.
2. **Audit Logging**: Every tool call and response is recorded in transparent session logs.
3. **Fail-Closed Security**: Any tool operation violating workspace boundaries is immediately rejected.
