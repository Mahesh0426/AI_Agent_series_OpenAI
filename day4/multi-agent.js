// Orchestrating multiple agents

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import fs from "node:fs/promises";

// Tools | plan tools
const FetchAvailablePlan = tool({
  name: "fetch_available_plan",
  description: "fetches the available plans for the internet",
  parameters: z.object({}),
  execute: async function () {
    return [
      {
        plan_id: "1",
        plan_aud: 39,
        speed: "30mbps",
      },
      {
        plan_id: "2",
        plan_aud: 59,
        speed: "70mbps",
      },
      {
        plan_id: "3",
        plan_aud: 89,
        speed: "100mbps",
      },
    ];
  },
});

// Refund tools
const processRefund = tool({
  name: "process_refund",
  description: `This tool processes the refund for a customer`,
  parameters: z.object({
    customerId: z.string().describe("id of the customer"),
    reason: z.string().describe("reason for refund"),
  }),
  execute: async function ({ customerId, reason }) {
    await fs.appendFile(
      "./refunds.txt",
      `Refund for Customer having ID ${customerId} for ${reason}`,
      "utf-8"
    );
    return { refundIssued: true };
  },
});

//support tools
const SupportTool = tool({
  name: "support_inquiry",
  description: "Handles customer complaints or technical issues",
  parameters: z.object({
    issue: z.string().describe("description of the issue"),
  }),
  execute: async ({ issue }) => {
    return `Support ticket created for: ${issue}. A technician will contact you soon.`;
  },
});

// Refund Agent
const refundAgent = new Agent({
  name: "Refund Agent",
  model: "gpt-4.1-mini",
  instructions:
    "You are an expert in issuing refunds to the customers. Talk to the customer and Help them process refunds.",
  tools: [processRefund],
});

//technical support agent
const SupportAgent = new Agent({
  name: "Support Agent",
  model: "gpt-4.1-mini",
  instructions:
    "You are an expert in providing technical support to the customers. Talk to the customer and Help them with their technical issues.",
  tools: [SupportTool],
});

// Sales Agent
const agent = new Agent({
  name: "Sales Agent",
  model: "gpt-4.1-mini",
  instructions:
    "You are an expert sales  for an internet broadband company. Talk to the user and help then with what they need.",
  tools: [
    FetchAvailablePlan,
    refundAgent.asTool({
      toolName: "refund_expert",
      toolDescription: "Handles refund questions and requests.",
    }),
    SupportAgent.asTool({
      toolName: "support_expert",
      toolDescription: "Handles support questions and requests.",
    }),
  ],
});

async function main(query = "") {
  const result = await run(agent, query);
  console.log(result.finalOutput);
}

main(`My Interternet is very slow can you help me `);
