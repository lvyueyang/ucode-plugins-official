# ucode-plugins-official

[ucode](../ucode) 的官方插件目录，结构参照 [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official)。

## 结构

```
.ucode-plugin/marketplace.json   # 市场清单，登记所有插件
plugins/<name>/                  # 官方自研插件
external_plugins/<name>/         # 第三方 / 社区插件
scripts/validate.mjs             # 清单校验
```

每个插件的包格式见 ucode 仓库的 `plans/plugins.md`，清单统一放在 `.ucode-plugin/plugin.json`。

## 新增插件

1. 复制 `plugins/example-plugin` 并改名
2. 修改其 `.ucode-plugin/plugin.json`
3. 在 `.ucode-plugin/marketplace.json` 的 `plugins` 中添加条目
4. 运行 `pnpm validate`（或 `node scripts/validate.mjs`）

## 在 ucode 中使用

把本仓库作为本地目录市场登记（`directory` 来源，指向仓库根），即可安装其中的插件。
