#!/usr/bin/env node
// 零依赖的最小 MCP stdio 服务：按行读取 JSON-RPC 请求，演示插件如何自带 MCP 工具。
import { createInterface } from "node:readline";

const GREETING = process.env.SHOWCASE_GREETING || "你好，ucode";

const TOOLS = [
  {
    name: "showcase_info",
    description: "返回插件信息与当前的问候语（来自 userConfig）。",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "showcase_echo",
    description: "原样返回传入的文本，用于验证工具调用链路。",
    inputSchema: {
      type: "object",
      properties: { text: { type: "string", description: "要回显的文本" } },
      required: ["text"],
    },
  },
];

const send = (message) => process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", ...message })}\n`);
const text = (value) => ({ content: [{ type: "text", text: value }] });

const callTool = (name, args = {}) => {
  if (name === "showcase_info") {
    return text(
      JSON.stringify(
        {
          plugin: "showcase",
          greeting: GREETING,
          pluginRoot: process.env.UCODE_PLUGIN_ROOT ?? null,
          node: process.version,
        },
        null,
        2,
      ),
    );
  }
  if (name === "showcase_echo") return text(String(args.text ?? ""));
  return { isError: true, ...text(`未知工具：${name}`) };
};

const handle = (request) => {
  const { id, method, params } = request;
  if (id === undefined) return; // 通知无需响应
  switch (method) {
    case "initialize":
      return send({
        id,
        result: {
          protocolVersion: params?.protocolVersion ?? "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "showcase", version: "1.0.0" },
        },
      });
    case "ping":
      return send({ id, result: {} });
    case "tools/list":
      return send({ id, result: { tools: TOOLS } });
    case "tools/call":
      return send({ id, result: callTool(params?.name, params?.arguments) });
    default:
      return send({ id, error: { code: -32601, message: `未实现的方法：${method}` } });
  }
};

createInterface({ input: process.stdin }).on("line", (line) => {
  if (!line.trim()) return;
  try {
    handle(JSON.parse(line));
  } catch (error) {
    send({ id: null, error: { code: -32700, message: String(error) } });
  }
});
