# Capability Demo (showcase)

A ucode plugin capability demo: one plugin that bundles every component type ucode supports, to try out or use as a development reference. Everything is ucode-native with no build step; the MCP server needs Node.js 18+.

## Components

| Component | File | Notes |
| --- | --- | --- |
| skill | `skills/showcase/SKILL.md` | Walkthrough that guides the user through each capability |
| commands | `commands/hello.md`, `commands/tour.md` | Shown as `showcase:hello` and `showcase:tour`; the latter demonstrates `$ARGUMENTS` |
| sub-agent | `agents/guide.md` | Read-only guide, demonstrates a tool allowlist |
| hook | `hooks/hooks.json` | `SessionStart` prints an enabled notice |
| MCP server | `server/index.mjs` | Zero-dependency stdio server exposing `showcase_info` and `showcase_echo` |
| user config | `userConfig` in `.ucode-plugin/plugin.json` | The greeting is injected via `${user_config.greeting}` into the MCP server env |

## Usage

1. Register this repository as a directory marketplace, then install and enable Capability Demo.
2. Start a new session and type `/showcase:tour`, or just ask to see what plugins can do.
3. Change the greeting in the plugin settings, then call `showcase_info` in a new session.

## Notes

- Whether executable components (hooks, MCP) are injected depends on whether the plugin source is trusted; the tour reports honestly when one is not.
- This plugin has no UI panel; it only demonstrates declarative components of the ucode plugin platform.

中文：[README.md](./README.md)
