import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// MCPサーバー構築
const server = new McpServer({
  name: "thinking-mcp",
  version: "1.0.3",
});

// Think Toolの定義
server.tool(
  "think",
  "このツールは、考えを整理したり、複雑な問題を分解する際に使用します。外部情報の取得やデータの変更は行わず、受け取った思考内容をログとして記録します。",
  {
    thought: z.string().describe("思考内容（整理・記録したい考え）"),
  },
  async ({ thought }) => {
    return {
      content: [
        {
          type: "text",
          text: thought,
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP思考ツールサーバーが起動しました");
}

main().catch((error) => {
  console.error("エラーがmain()で発生しました。", error);
  process.exit(1);
});
