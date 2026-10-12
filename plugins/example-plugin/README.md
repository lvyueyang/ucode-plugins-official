# example-plugin

官方插件模板。复制本目录改名即可开始新插件，并在根目录
`.ucode-plugin/marketplace.json` 的 `plugins` 里登记。

```
example-plugin/
├── .ucode-plugin/plugin.json   # 清单（可缺省，缺省时按目录名）
└── skills/hello/SKILL.md
```

可选组件目录：`commands/`、`agents/`、`hooks/hooks.json`、`.mcp.json`、`bin/`、`extensions/`。
