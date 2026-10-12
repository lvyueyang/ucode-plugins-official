# blender

让 Agent 在对话中创建、检视、修改并渲染 Blender 场景（`.blend`）。插件自带编译好的 MCP 服务，无需构建；运行需要 Node.js 24+。

## 组成

| 路径                        | 作用                                                                   |
| --------------------------- | ---------------------------------------------------------------------- |
| `.ucode-plugin/plugin.json` | 插件清单：stdio MCP 服务 `blender` 与 `userConfig`                     |
| `dist/server.mjs`           | 编译后的 MCP 服务入口                                                  |
| `blender/bridge.py`         | 跑在 `blender -b` 里的 bpy 命令循环：revision、路径守卫、渲染回退等    |
| `skills/blender/SKILL.md`   | 教模型的工作流：inspect → 带 `expectedRevision` 修改 → `render_preview` |

## 使用

1. 在 ucode 插件管理器安装并启用本插件。
2. 新建会话，例如输入“新建一个场景，放一个橙色方块和一块地面，渲染看看”。

## 设置（userConfig）

| 键                  | 默认    | 说明                                                      |
| ------------------- | ------- | --------------------------------------------------------- |
| `blenderPath`       | 空      | Blender 可执行文件；留空自动探测                          |
| `allowPython`       | `false` | 开启后才注册 `run_python`                                 |
| `renderEngine`      | `eevee` | `eevee` / `cycles`，非法值回落 eevee                      |
| `engineDownloadDir` | 空      | 便携版 Blender 落盘目录，留空用插件数据目录下的 `engine/` |

## 引擎

按 `blenderPath` → 已安装的 Blender（macOS `/Applications/Blender.app`、Windows `Program Files`、`PATH` 上的 `blender`）→ 插件便携版的顺序查找。都没有时处于 `gltf-only` 层，需要引擎的工具返回 `[engine_missing]`，可通过 `ensure_engine` 征得同意后下载便携版 Blender 5.2.1 LTS（约 330–360 MB，校验 sha256）。macOS Intel 没有官方便携包，只能装 App 或填路径。

## 工具

所有结果的 `structuredContent` 都带 `state: { file, revision, selected, camera, engine }`；错误结果 `isError: true`，文本为 `[code] message`。

| 工具                                                                         | 说明                                                  |
| ---------------------------------------------------------------------------- | ----------------------------------------------------- |
| `ensure_engine`                                                              | 探测或下载引擎                                        |
| `open_scene` / `new_scene` / `save_scene`                                    | 打开、新建、保存工作区内的 `.blend`                   |
| `inspect_scene` / `inspect_object`                                           | 读取场景与物体信息                                    |
| `add_object` / `set_transform` / `set_material` / `set_camera` / `set_visibility` | 修改场景，均带 `expectedRevision`，冲突时返回 `[revision_conflict]` |
| `render_preview`                                                             | 渲染预览图，返回 `blender://render/<id>.png`          |
| `run_python`                                                                 | 需开启 `allowPython`；桥内禁止 os / subprocess / socket 等导入 |

## 说明

- 本插件不提供界面面板，全部交互通过对话和 MCP 工具完成。
- `export_glb`、`pick_scene_file` 是面向面板的工具，在 ucode 中不使用。
- 服务端为打包产物，源码不在本仓库。

English: [README_EN.md](./README_EN.md)
