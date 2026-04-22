import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { RelivioApiClient } from "./client/relivio-api.js";
import {
  getVerdictOutputSchema,
  toGetVerdictStructuredContent,
} from "./tools/get-verdict-contract.js";
import { createGetVerdictTool } from "./tools/get-verdict.js";
import {
  listRecentDeploymentsOutputSchema,
  toListRecentDeploymentsStructuredContent,
} from "./tools/list-recent-deployments-contract.js";
import { createListRecentDeploymentsTool } from "./tools/list-recent-deployments.js";

export function buildMcpServer(client: RelivioApiClient): McpServer {
  const server = new McpServer({
    name: "relivio-mcp",
    version: "0.2.0",
  });

  const getVerdictTool = createGetVerdictTool(client);
  const listRecentDeploymentsTool = createListRecentDeploymentsTool(client);

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

  server.registerTool(
    listRecentDeploymentsTool.name,
    {
      description: listRecentDeploymentsTool.description,
      inputSchema: listRecentDeploymentsTool.inputSchema,
      outputSchema: listRecentDeploymentsOutputSchema,
      annotations: listRecentDeploymentsTool.annotations,
    },
    async (input) => {
      const result = await listRecentDeploymentsTool.handler(input);
      const structuredContent = toListRecentDeploymentsStructuredContent(result);
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
