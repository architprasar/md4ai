import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListPromptsRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = join(__dirname, "docs");

const server = new Server(
  {
    name: "md4ai-docs",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      prompts: {},
      tools: {},
    },
  }
);

/**
 * RESOURCES: All documentation files
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const files = readdirSync(DOCS_DIR).filter(f => f.endsWith(".md"));
  return {
    resources: [
      {
        uri: "file:///README.md",
        name: "md4ai Overview",
        mimeType: "text/markdown",
        description: "General overview and getting started guide for md4ai"
      },
      ...files.map(f => ({
        uri: `file:///docs/${f}`,
        name: `md4ai: ${f.replace(".md", "")}`,
        mimeType: "text/markdown",
        description: `Documentation for ${f.replace(".md", "")} component/feature`
      }))
    ]
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = new URL(request.params.uri);
  const path = uri.pathname;
  const fullPath = join(__dirname, path);

  try {
    const content = readFileSync(fullPath, "utf-8");
    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: "text/markdown",
          text: content,
        },
      ],
    };
  } catch (error) {
    throw new Error(`Resource not found: ${request.params.uri}`);
  }
});

/**
 * PROMPTS: System instructions for agents
 */
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "md4ai-instructions",
        description: "Full system instructions for an agent to generate valid md4ai rich markdown",
      }
    ]
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  if (request.params.name === "md4ai-instructions") {
    // We would normally import getPrompt from ./src/prompt.ts 
    // but for the MCP server we'll provide the high-quality version
    const instructions = `
Write standard markdown by default. When richer presentation clearly improves the answer, you may use md4ai markdown extensions instead of JSON or JSX.

Use @kpi["label", "value", change: "...", period: "..."] for headline metrics.
Use \`\`\`chart blocks with JSON config for bar, line, pie, doughnut, or radar charts.
Use \`\`\`steps or \`\`\`timeline blocks with statuses like done, active, planned, or blocked.
Use GitHub-style callouts for emphasis: > [!NOTE], > [!TIP], > [!WARNING], > [!DANGER], or > [!INFO].
Use @button["label", href: "...", variant: "primary|secondary|default"] for actions.
Use \`\`\`layout columns=2 blocks with --- separators for multi-column content.
`;
    return {
      description: "md4ai System Instructions",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: instructions.trim()
          }
        }
      ]
    };
  }
  throw new Error("Prompt not found");
});

/**
 * TOOLS: Utilities for agents
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_syntax_example",
        description: "Get a copy-pasteable example of md4ai syntax for a specific component",
        inputSchema: {
          type: "object",
          properties: {
            component: {
              type: "string",
              enum: ["kpi", "chart", "steps", "callout", "button", "layout"],
              description: "The component to get an example for"
            }
          },
          required: ["component"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_syntax_example") {
    const component = request.params.arguments?.component;
    const examples = {
      kpi: '@kpi["Revenue", "$1.2M", change: "+14%", period: "Q2"]',
      chart: '```chart\n{\n  "type": "bar",\n  "labels": ["Jan", "Feb"],\n  "datasets": [{ "label": "Sales", "data": [400, 600] }]\n}\n```',
      steps: '```steps\n- [done] Draft\n- [active] Review\n- [planned] Publish\n```',
      callout: '> [!TIP]\n> Use @kpi for top-level stats.',
      button: '@button["View Details", href: "/details", variant: "primary"]',
      layout: '```layout columns=2\nLeft side\n---\nRight side\n```'
    };

    return {
      content: [
        {
          type: "text",
          text: examples[component] || "No example found"
        }
      ]
    };
  }
  throw new Error("Tool not found");
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("md4ai MCP Server running on stdio");
}

main();
