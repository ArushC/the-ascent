# AI Workflow Cheat Sheet

## Daily commands

| Step | Command | Cursor mode | Output goes to |
| --- | --- | --- | --- |
| Menu | `npm run ai` | Mixed | Terminal, then paste into Cursor |
| Help | `npm run ai:help` | Mixed | Terminal |
| Product spec | `npm run ai:spec` | Plan | Cursor Plan mode |
| Architecture | `npm run ai:arch` | Plan | Cursor Plan mode |
| Implementation | `npm run ai:impl` | Agent | Cursor Agent mode |
| Code review | `npm run ai:review` | Ask | Cursor Ask mode |
| Debugging | `npm run ai:debug` | Agent | Cursor Agent mode |
| Refactor | `npm run ai:refactor` | Agent | Cursor Agent mode |
| Tests | `npm run ai:test` | Agent | Cursor Agent mode |
| Feature flow | `npm run ai:feature` | Mixed | Params file plus first prompt |

## Common flags

| Flag | Use |
| --- | --- |
| `--params agents/params/_example.json` | Load placeholder values from JSON |
| `--out docs/ARCHITECTURE.md` | Write the rendered prompt to a file |
| `--copy` | Copy the rendered prompt to the macOS clipboard |
| `--help` | Show available commands |

## Full feature flow

Start here:

```bash
npm run ai:feature -- --copy
```

That command asks for the feature name and requirements, creates `agents/params/<feature-slug>.json`, renders the architecture prompt, and copies it to your clipboard.

Paste the copied prompt into a new Cursor chat in Plan mode. After you approve the architecture, paste the approved architecture into the `ARCHITECTURE` field in `agents/params/<feature-slug>.json`.

Then run:

```bash
npm run ai:impl -- --params agents/params/<feature-slug>.json --copy
```

Paste that prompt into Cursor Agent mode.

After implementation:

```bash
npm run ai:review -- --copy
npm run ai:test -- --params agents/params/<feature-slug>.json --copy
```

Paste review prompts into Cursor Ask mode. Paste test prompts into Cursor Agent mode.

## Params files

Start from:

```bash
cp agents/params/_example.json agents/params/my-feature.json
```

Most of the time, prefer `npm run ai:feature -- --copy`; it creates the params file for you.

Each prompt only needs the params listed in `agents/manifest.json`. Extra keys are fine and can be reused across steps.

## Troubleshooting

- If a command asks for a missing value, either type it in the terminal or add it to your params JSON.
- If `ai:review` renders an empty diff, make sure you have unstaged or staged local changes.
- If `--copy` fails, rerun without it and copy the terminal output manually.
