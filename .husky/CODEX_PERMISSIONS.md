# Reducing Codex Approval Prompts

Use these three complementary methods to give Codex more discretion while
retaining approval gates for destructive or scope-expanding actions.

## 1. Configure a permission profile

Set personal defaults in `~/.codex/config.toml`:

```toml
approval_policy = "on-request"
default_permissions = "developer"

[permissions.developer]
description = "Normal development inside the active workspace"
extends = ":workspace"

[permissions.developer.network]
enabled = true

[permissions.developer.network.domains]
"**.github.com" = "allow"
"**.githubusercontent.com" = "allow"
"registry.npmjs.org" = "allow"
"developers.openai.com" = "allow"
"magnet.crowdcafe.com" = "allow"
"o.mkpie.me" = "allow"
```

This permits normal work inside active workspace roots and access to the listed
network destinations. Keep `approval_policy = "on-request"` so Codex still
asks before actions outside the granted profile.

Do not combine permission profiles with the older `sandbox_mode` or
`sandbox_workspace_write` settings. If the machine has managed Codex policy,
that policy may restrict or override personal configuration.

## 2. Allow recurring read-only commands

Create `~/.codex/rules/default.rules`:

```python
prefix_rule(
    pattern = ["git", ["status", "diff", "log", "show"]],
    decision = "allow",
    justification = "Read-only Git inspection",
)

prefix_rule(
    pattern = ["git", "branch", "--show-current"],
    decision = "allow",
)

prefix_rule(
    pattern = ["git", "remote", "-v"],
    decision = "allow",
)

prefix_rule(
    pattern = [["pwd", "ls", "stat", "file", "wc", "cmp", "ps"]],
    decision = "allow",
    justification = "Read-only local inspection",
)

prefix_rule(
    pattern = ["gh", "auth", "status"],
    decision = "allow",
)

prefix_rule(
    pattern = ["gh", "pr", ["view", "checks", "diff"]],
    decision = "allow",
)

prefix_rule(
    pattern = ["gh", "repo", "view"],
    decision = "allow",
)
```

Rules match command prefixes rather than intent. Avoid broad rules such as
`["git"]`, `["gh"]`, `["bash"]`, or `["sed"]`, because those commands can
also modify state.

## 3. Record repository-level authorization

Add this policy to the repository's `AGENTS.md`:

```markdown
## Approval and Autonomy

- Read-only inspection commands are always authorized.
- For requested implementation work, workspace edits, formatting, linting,
  builds, tests, temporary development servers, and cleanup of agent-created
  temporary files are authorized without additional confirmation.
- When the request explicitly includes publishing, fetching, branch creation,
  commits, pushes, and draft PR creation are authorized.
- Always request approval for destructive operations, force pushes, merges,
  hard resets, deleting user-owned files, writes outside the workspace,
  persistent system installations, secret access, or unrelated external
  communication.
```

`AGENTS.md` communicates durable intent to the agent, but it does not override
the technical sandbox or administrator-managed policy.

## Apply the changes

Restart Codex after changing `config.toml` or rule files. If harmless commands
still fail with an error such as `bwrap: loopback: Failed RTM_NEWADDR`, the
problem is in the sandbox/runtime environment and must be fixed there; adding
more approval rules will not repair Bubblewrap initialization.

References:

- https://developers.openai.com/codex/config-basic
- https://developers.openai.com/codex/permissions
- https://developers.openai.com/codex/rules
