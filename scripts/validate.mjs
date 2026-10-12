#!/usr/bin/env node
// 校验市场清单：条目名唯一、本地来源目录存在且含清单、清单 name 与条目一致。
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const MANIFEST_DIRS = [".ucode-plugin", ".zcode-plugin", ".claude-plugin"];
const errors = [];

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const marketDir = MANIFEST_DIRS.find((d) => existsSync(join(root, d, "marketplace.json")));
if (!marketDir) {
  console.error("找不到 marketplace.json");
  process.exit(1);
}
const market = readJson(join(root, marketDir, "marketplace.json"));
const seen = new Set();

for (const entry of market.plugins ?? []) {
  if (!entry.name) { errors.push("存在缺少 name 的条目"); continue; }
  if (seen.has(entry.name)) errors.push(`条目重名: ${entry.name}`);
  seen.add(entry.name);
  if (typeof entry.source !== "string") continue; // 显式来源（github/npm/url）此处不校验
  const dir = resolve(root, entry.source);
  if (!dir.startsWith(root) || !existsSync(dir)) {
    errors.push(`${entry.name}: 来源目录不存在或越界 (${entry.source})`);
    continue;
  }
  const dirName = MANIFEST_DIRS.find((d) => existsSync(join(dir, d, "plugin.json")));
  if (!dirName) continue; // 清单可缺省
  const manifest = readJson(join(dir, dirName, "plugin.json"));
  if (manifest.name !== entry.name) errors.push(`${entry.name}: 清单 name 为 ${manifest.name}`);
  if (manifest.version && entry.version && manifest.version !== entry.version) {
    errors.push(`${entry.name}: 版本不一致 (市场 ${entry.version} / 清单 ${manifest.version})`);
  }
}

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join("\n"));
  process.exit(1);
}
console.log(`✓ ${seen.size} 个插件条目校验通过`);
