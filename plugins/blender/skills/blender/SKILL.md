---
name: blender
description: 用户要看、改、渲染 Blender 场景（.blend）时怎么用 blender 的工具
---

# Blender 插件

用户提到 ".blend / Blender 场景 / 改材质 / 摆相机 / 渲染一张图" 时按这个流程。

## 能力分层

| 层        | 条件                                                                                            | 能做什么                                                                                       |
| --------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| full      | `ensure_engine` 返回 `tier: "full"`（用户配置路径、已安装的 Blender、或插件下载的便携版 5.2.1） | 打开、检视、修改、渲染、保存，全部工具可用                                                     |
| gltf-only | `tier: "gltf-only"`：没有引擎                                                                   | 需要引擎的工具都返回 `[engine_missing]`。告诉用户可以让插件下载便携版（约 330–360 MB），或在插件设置里填 Blender 路径 |

不确定状态时先调 `ensure_engine`（不带参数：找不到引擎时会询问用户是否下载；用户明确说"下载"再带 `download: true`）。下载期间工具会持续上报进度，最长等 15 分钟。

## 编辑闭环：inspect → 带 expectedRevision 改 → render_preview

1. `open_scene(path)`：路径必须在工作区里，不要猜路径，不确定就问用户。**没有现成 `.blend`、用户要"从零建一个"时用 `new_scene(path)`**：默认 `basic` 模板带一台相机和一盏太阳光，`empty` 什么都没有；已存在的文件不会被覆盖（要覆盖显式传 `overwrite: true`，先问用户）。新建后 revision 为 0。
   - 往场景里加东西用 `add_object(type, …)`：`cube / sphere / plane / cylinder / cone / torus / light / camera / empty`。mesh 可直接给 `size` 与 `baseColor`；灯给 `light: { type: POINT|SUN|SPOT|AREA, energy, color }`；相机给 `lens`，场景没相机时自动成为渲染相机。它也是变更工具，同样带 `expectedRevision`，每加一个 revision +1。名字重复会自动变成 `Cube.001`，以返回结果里的 `object.name` 为准。
   - 典型"建一个方块场景"：`new_scene("scenes/cube.blend")` → `add_object(cube, location [0,0,1], baseColor …, expectedRevision 0)` → `add_object(plane, size 20, expectedRevision 1)` → `set_camera(lookAt "Cube")` → `render_preview`。不要用 Bash 去跑 Blender 命令行写脚本，这些工具就够了；结构化工具做不到的再看 `run_python`。
2. **每次修改前先 `inspect_scene`**，拿到对象名和 `state.revision`。对象名区分大小写，不要凭记忆写名字。需要单个物体的细节用 `inspect_object(name)`。
3. 修改：`set_transform`、`set_material`、`set_camera`、`set_visibility`、`add_object`。**每个都传上一步看到的 `expectedRevision`**；返回 `[revision_conflict]` 说明场景在你 inspect 之后被改过，结果里 `state.revision` 是当前值——重新 `inspect_scene` 再改，不要盲目重试，也不要直接拿 `state.revision` 当 `expectedRevision` 跳过 inspect（场景内容可能也变了）。
   - 连续多次修改：每次成功结果的 `state.revision` 就是下一次的 `expectedRevision`，不必每次都 inspect。
   - `set_material` 只覆盖 Principled BSDF 的 baseColor / metallic / roughness / emission；"磨砂金属" = metallic 1、roughness 0.6 左右。
   - `set_camera` 优先用 `lookAt` 对准物体而不是手算旋转。
   - 旋转单位是角度，颜色是 0..1。
4. **改完就 `render_preview`** 让用户看到效果。默认 640×480、16 采样；用户要成图再加大。`engine` 不传时用插件设置的默认值：EEVEE 快但是近似，Cycles 更接近成图（CPU 渲染要一两分钟，先说一句，可给 `samples: 128` 左右）。结果里的 `blender://render/<id>.png` 是渲染图资源，文字里给一句结论即可，不要复述参数。EEVEE 失败会自动退到 Cycles CPU，结果 `fallback: true` 时提一句。
5. 用户满意后 `save_scene`。不带 path 是原地保存；覆盖已有文件时要等用户确认，不要替用户决定。另存用工作区内的新路径。

## run_python

只有插件设置 `allowPython` 打开时才有这个工具（工具列表里没有它就是没开，需要时告诉用户去插件设置里打开"允许 run_python"，不要用 Bash 绕过去跑 Blender）。它是逃生口：只在结构化工具做不到（加修改器、布尔运算、批量操作、动画）时用；脚本里 `bpy` 已注入，`print` 会回到结果。禁止导入 os / subprocess / socket / shutil / importlib / ctypes，也不能写文件。它同样接受 `expectedRevision`，每次运行都会让 revision +1，之后重新 `inspect_scene`。被拒绝就换结构化工具或说明做不到。

## 不要做

- 不要在没有 `inspect_scene` 的情况下按记忆修改。
- 不要把 `.blend` 文件当文本读；一切场景信息来自工具。
