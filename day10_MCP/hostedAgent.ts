import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { Agent, run, tool, hostedMcpTool } from "@openai/agents";

const agent = new Agent({
  name: "MCP Assistant",
  model: "gpt-4.1-mini",
  instructions: "You must always use the MCP tools to answer questions.",
  tools: [
    hostedMcpTool({
      serverLabel: "gitmcp",
      serverUrl: "https://gitmcp.io/openai/codex",
    }),
  ],
});

async function main(q: string) {
  const result = await run(agent, q);
  console.log(result.finalOutput);
}

main("What is this repo about ?");
