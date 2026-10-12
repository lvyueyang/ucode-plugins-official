# ucode-plugins-official

[ucode](../ucode) 的官方插件目录，结构参照 [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official)。

## 结构

```
.ucode-plugin/marketplace.json   # 市场清单，登记所有插件
plugins/<name>/                  # 官方自研插件
external_plugins/<name>/         # 第三方 / 社区插件
scripts/validate.mjs             # 清单校验
```

每个插件的包格式与兼容规则见 ucode 仓库的 `plans/plugins.md`：同时识别
`.ucode-plugin` / `.zcode-plugin` / `.claude-plugin` 三档清单目录。

## 新增插件

1. 复制 `plugins/example-plugin` 并改名
2. 修改其 `.ucode-plugin/plugin.json`
3. 在 `.ucode-plugin/marketplace.json` 的 `plugins` 中添加条目
4. 运行 `pnpm validate`（或 `node scripts/validate.mjs`）

## 在 ucode 中使用

把本仓库作为本地目录市场登记（`directory` 来源，指向仓库根），即可安装其中的插件。

## 从 ZCode 官方市场同步

`plugins/` 下除 `example-plugin` 外的插件来自 ZCode 官方市场
（https://cdn-zcode.z.ai/zcode/official-plugin/marketplace.json），由脚本同步：

```bash
node scripts/sync-zcode.mjs                 # 同步全部（超过 5MB 的包只保留远程 url 来源）
node scripts/sync-zcode.mjs --only github,gitlab
node scripts/sync-zcode.mjs --max-mb 50     # 放宽体积上限
node scripts/sync-zcode.mjs --dry-run       # 只列计划，不下载
npm run validate                            # 校验市场清单与各插件清单
```

- 下载后校验 sha256，再解包到 `plugins/<name>/`，插件目录原样保留（ucode 兼容识别 `.zcode-plugin/plugin.json`）。
- 市场清单 `.ucode-plugin/marketplace.json` 会重新生成：已同步条目改为相对路径来源，手写的本地插件保留。
- 同步记录写入 `.ucode-plugin/zcode-sync.json`（上游地址、已同步与被跳过的插件）。
- 注意：ZCode 专属能力（如 `ui.surfaces` 的 MCP Apps 页面）在 ucode 中只出诊断、不渲染；
  带 hooks / bin 的插件来自第三方市场来源时，执行类组件默认不注入（见 ucode `plans/plugins.md` 第五章）。
