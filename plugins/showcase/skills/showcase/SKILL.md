---
name: showcase
description: 当用户想了解或演示 ucode 插件能提供哪些能力（skill、命令、子角色、hook、MCP、用户配置）时使用。
---

# ucode 插件能力演示

本插件在一个包里放了 ucode 支持的各类组件。用户要求“演示插件能力”时，按下面的顺序逐项带用户体验，每项做完说明它对应插件里的哪个文件。

| 能力 | 如何体验 | 对应文件 |
| --- | --- | --- |
| skill | 当前这份说明本身就是一个 skill | `skills/showcase/SKILL.md` |
| 命令 | 输入 `/showcase:hello`、`/showcase:tour` | `commands/*.md` |
| 子角色 | 让模型调用子角色 `showcase-guide` 概述本插件 | `agents/guide.md` |
| MCP 工具 | 调用 `showcase_info`、`showcase_echo` | `server/index.mjs`，在清单 `mcpServers` 中声明 |
| 用户配置 | 修改“问候语”，再次调用 `showcase_info` 观察变化 | 清单 `userConfig` |
| hook | 新会话启动时由 `SessionStart` 输出一行提示（执行类组件需来源受信任才会注入） | `hooks/hooks.json` |

演示时保持简短：先调用 `showcase_info` 确认 MCP 服务可用，再逐项展开；某项不可用（例如 hook 因来源未受信任而未注入）时如实说明，不要编造结果。
