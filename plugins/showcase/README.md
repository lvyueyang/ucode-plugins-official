# 能力演示（showcase）

ucode 插件能力演示：在一个插件里放齐 ucode 支持的各类组件，既能体验，也能当开发参考。全部为 ucode 原生写法，无构建步骤，运行 MCP 服务需要 Node.js 18+。

## 包含的组件

| 组件 | 文件 | 说明 |
| --- | --- | --- |
| skill | `skills/showcase/SKILL.md` | 导览总览，按能力表逐项带用户体验 |
| 命令 | `commands/hello.md`、`commands/tour.md` | 显示为 `showcase:hello`、`showcase:tour`；后者演示 `$ARGUMENTS` |
| 子角色 | `agents/guide.md` | 只读导览员，演示工具白名单 |
| hook | `hooks/hooks.json` | `SessionStart` 输出启用提示 |
| MCP 服务 | `server/index.mjs` | 零依赖 stdio 服务，提供 `showcase_info`、`showcase_echo` |
| 用户配置 | `.ucode-plugin/plugin.json` 的 `userConfig` | “问候语”经 `${user_config.greeting}` 注入 MCP 服务环境变量 |

## 使用

1. 把本仓库作为目录市场登记，安装并启用“能力演示”。
2. 新建会话，输入 `/showcase:tour`，或直接说“演示一下插件能力”。
3. 在插件设置里改“问候语”，新会话中调用 `showcase_info` 观察变化。

## 说明

- hook、MCP 等执行类组件是否注入取决于插件来源是否受信任，未注入时导览会如实说明。
- 本插件不含界面面板，仅演示 ucode 插件平台的声明式组件。

English: [README_EN.md](./README_EN.md)
