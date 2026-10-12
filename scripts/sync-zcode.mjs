#!/usr/bin/env node
/**
 * 从 ZCode 官方市场同步插件到本仓库。
 *
 * 流程：拉 marketplace.json → 逐个下载 zip → 校验 sha256 → 解包到 plugins/<name>/
 *       → 生成 .ucode-plugin/marketplace.json（来源改为相对路径）。
 *
 * ucode 兼容识别 `.zcode-plugin/plugin.json`，所以插件目录原样保留，不改写清单。
 *
 * 用法：
 *   node scripts/sync-zcode.mjs                  # 同步全部（跳过超过 --max-mb 的包）
 *   node scripts/sync-zcode.mjs --only github,gitlab
 *   node scripts/sync-zcode.mjs --max-mb 50      # 放宽体积上限
 *   node scripts/sync-zcode.mjs --dry-run        # 只列出计划，不下载
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MARKET_URL = "https://cdn-zcode.z.ai/zcode/official-plugin/marketplace.json";
const MARKET_FILE = join(ROOT, ".ucode-plugin", "marketplace.json");
const LOCK_FILE = join(ROOT, ".ucode-plugin", "zcode-sync.json");

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const only = opt("--only")?.split(",").map((s) => s.trim()).filter(Boolean);
const maxBytes = Number(opt("--max-mb") ?? 5) * 1024 * 1024;
const dryRun = flag("--dry-run");

/** 手写的本地插件：同步时保留，不被 zcode 条目覆盖 */
const localEntries = (() => {
  if (!existsSync(MARKET_FILE)) return [];
  const prev = JSON.parse(readFileSync(MARKET_FILE, "utf8"));
  const synced = new Set(existsSync(LOCK_FILE) ? JSON.parse(readFileSync(LOCK_FILE, "utf8")).plugins : []);
  return (prev.plugins ?? []).filter((p) => !synced.has(p.name));
})();

const fetchJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.json();
};

const download = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
};

const market = await fetchJson(MARKET_URL);
const entries = market.plugins.filter((p) => !only || only.includes(p.name));

const synced = [];
const skipped = [];
const failed = [];
const outEntries = [];
const remote = [];

for (const p of entries) {
  const size = p._artifact?.size ?? 0;
  if (size > maxBytes) {
    skipped.push(`${p.name}@${p.version} (${(size / 1048576).toFixed(1)}MB)`);
    // 大包不入库：条目保留，来源指向上游远程 zip（ucode 的 url 来源，安装时再拉取）
    if (!dryRun) {
      const { source: _s2, _artifact: _a2, ...meta2 } = p;
      outEntries.push({
        ...meta2,
        source: { source: "url", url: p.source.url },
      });
      remote.push(p.name);
    }
    continue;
  }
  if (dryRun) {
    console.log(`plan: ${p.name}@${p.version} ${size}B`);
    continue;
  }
  const work = mkdtempSync(join(tmpdir(), "zc-sync-"));
  try {
    const buf = await download(p.source.url);
    const sha = createHash("sha256").update(buf).digest("hex");
    if (sha !== p.source.sha256) throw new Error(`sha256 不匹配：期望 ${p.source.sha256}，实际 ${sha}`);
    const zip = join(work, "plugin.zip");
    writeFileSync(zip, buf);
    execFileSync("unzip", ["-q", zip, "-d", join(work, "x")]);
    const inner = join(work, "x", p.source.path ?? p.name);
    if (!existsSync(inner)) throw new Error(`包内缺少目录 ${p.source.path}`);
    const dest = join(ROOT, "plugins", p.name);
    rmSync(dest, { recursive: true, force: true });
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(inner, dest, { recursive: true });

    const { source: _s, _artifact: _a, ...meta } = p;
    outEntries.push({ ...meta, source: `./plugins/${p.name}` });
    synced.push(p.name);
    console.log(`ok: ${p.name}@${p.version}`);
  } catch (err) {
    failed.push(`${p.name}: ${err.message}`);
    console.error(`fail: ${p.name}: ${err.message}`);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

if (!dryRun) {
  const merged = {
    name: "ucode-plugins-official",
    description: "ucode 官方插件目录",
    plugins: [...localEntries, ...outEntries],
  };
  writeFileSync(MARKET_FILE, `${JSON.stringify(merged, null, 2)}\n`);
  writeFileSync(
    LOCK_FILE,
    `${JSON.stringify({ upstream: MARKET_URL, plugins: [...synced, ...remote], remote, skipped }, null, 2)}\n`,
  );
}

console.log(`\n同步 ${synced.length}，跳过 ${skipped.length}，失败 ${failed.length}`);
if (skipped.length) console.log(`跳过（超过 ${maxBytes / 1048576}MB）：\n  ${skipped.join("\n  ")}`);
if (failed.length) {
  console.error(`失败：\n  ${failed.join("\n  ")}`);
  process.exit(1);
}
