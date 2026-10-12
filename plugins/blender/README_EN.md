# blender

Let the agent create, inspect, edit and render Blender scenes (`.blend`) from the conversation. The plugin ships a prebuilt MCP server, so there is no build step; Node.js 24+ is required.

## Contents

| Path                        | Purpose                                                                          |
| --------------------------- | -------------------------------------------------------------------------------- |
| `.ucode-plugin/plugin.json` | Plugin manifest: stdio MCP server `blender` and `userConfig`                     |
| `dist/server.mjs`           | Bundled MCP server entry                                                         |
| `blender/bridge.py`         | bpy command loop run inside `blender -b`: revisions, path guard, render fallback |
| `skills/blender/SKILL.md`   | Workflow for the model: inspect → edit with `expectedRevision` → `render_preview` |

## Usage

1. Install and enable the plugin in the ucode plugin manager.
2. Start a new session, e.g. "create a scene with an orange cube and a ground plane, then render it".

## Settings (userConfig)

| Key                 | Default | Description                                                            |
| ------------------- | ------- | ---------------------------------------------------------------------- |
| `blenderPath`       | empty   | Blender executable; auto-detected when empty                           |
| `allowPython`       | `false` | Registers `run_python` only when enabled                               |
| `renderEngine`      | `eevee` | `eevee` / `cycles`; invalid values fall back to eevee                  |
| `engineDownloadDir` | empty   | Where the portable Blender is stored; defaults to `engine/` in plugin data |

## Engine

Lookup order: `blenderPath` → installed Blender (macOS `/Applications/Blender.app`, Windows `Program Files`, `blender` on `PATH`) → the plugin's portable build. With none of these the plugin is in the `gltf-only` tier: tools that need the engine return `[engine_missing]`, and `ensure_engine` can download portable Blender 5.2.1 LTS (about 330–360 MB, sha256-verified) after the user agrees. macOS Intel has no official portable build; install the app or set a path.

## Tools

Every result carries `state: { file, revision, selected, camera, engine }` in `structuredContent`; errors set `isError: true` with text `[code] message`.

| Tool                                                                         | Description                                                    |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `ensure_engine`                                                              | Detect or download the engine                                  |
| `open_scene` / `new_scene` / `save_scene`                                    | Open, create and save a `.blend` inside the workspace          |
| `inspect_scene` / `inspect_object`                                           | Read scene and object information                              |
| `add_object` / `set_transform` / `set_material` / `set_camera` / `set_visibility` | Edit the scene; all take `expectedRevision` and return `[revision_conflict]` on mismatch |
| `render_preview`                                                             | Render a preview, returns `blender://render/<id>.png`          |
| `run_python`                                                                 | Requires `allowPython`; the bridge blocks os / subprocess / socket imports |

## Notes

- This plugin has no UI panel; everything goes through the conversation and MCP tools.
- `export_glb` and `pick_scene_file` target a panel and are unused in ucode.
- The server is a bundled artifact; its source is not part of this repository.

中文：[README.md](./README.md)
