import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { RelivioApiClient } from "./client/relivio-api.js";
import {
  getVerdictOutputSchema,
  toGetVerdictStructuredContent,
} from "./tools/get-verdict-contract.js";
import { createGetVerdictTool } from "./tools/get-verdict.js";

export function buildMcpServer(client: RelivioApiClient): McpServer {
  const server = new McpServer({
    name: "relivio-mcp",
    version: "0.1.0",
  });

  const getVerdictTool = createGetVerdictTool(client);

  server.registerTool(
    getVerdictTool.name,
    {
      description: getVerdictTool.description,
      inputSchema: getVerdictTool.inputSchema,
      outputSchema: getVerdictOutputSchema,
      annotations: getVerdictTool.annotations,
    },
    async (input) => {
      const result = await getVerdictTool.handler(input);
      const structuredContent = toGetVerdictStructuredContent(result);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(structuredContent),
          },
        ],
        structuredContent,
      };
    },
  );

  return server;
}
