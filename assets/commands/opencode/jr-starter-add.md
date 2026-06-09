---
description: "Apply a JR Stack starter to the current project (thin wrapper over jr-stack starter add)."
---

Run the following bash command to apply the requested starter to the current project:

```bash
jr-stack starter add $ARGUMENTS
```

This command delegates entirely to the `jr-stack` binary on your PATH. It does not reimplement any starter resolution or install logic — it is a thin wrapper over the `jr-stack starter add` CLI subcommand introduced in C-29.

**Arguments**: pass the starter id and any optional flags (e.g. `--project <root>`, `--dry-run`) directly. They are forwarded verbatim via `$ARGUMENTS`.

If the binary is not found, confirm that `jr-stack` was installed via `jr-stack install` and that your PATH is configured correctly.
