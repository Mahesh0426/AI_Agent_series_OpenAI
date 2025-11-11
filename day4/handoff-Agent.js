import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import fs from "node:fs/promises";
import { RECOMMENDED_PROMPT_PREFIX } from "@openai/agents-core/extensions";

// Tools
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

// refund agents
const refundAgent = new Agent({
  name: "Refund Agent",
  model: "gpt-4.1-mini",
  instructions: "You are an agent expert in issuing refunds to the customers.",
  tools: [processRefund],
});

//sales agent
const salesAgent = new Agent({
  name: "Sales Agent",
  model: "gpt-4.1-mini",
  instructions: `You are an expert sales agent for an internet broadband company. 
    Talk to the user and help then with what they need.`,
  tools: [
    FetchAvailablePlan,
    refundAgent.asTool({
      toolName: "refund_expert",
      toolDescription: "Handles refund questions and requests.",
    }),
  ],
});

//handoff agent
const receptionAgent = new Agent({
  name: "Reception Agent",
  model: "gpt-4.1-mini",
  //   instructions: `
  //   You are the customer facing agent expert in understanding what
  //   customer needs and then route them or handoff them to the right agent.`,
  instructions: `${RECOMMENDED_PROMPT_PREFIX}`,
  handoffDescription: `You have two agent available:    
  - salesAgent: Expert in handling queries like all plans and pricing available. Good for new customers.
  - refundAgent: Expert in handling a user queries for existing customers and issue refund and help them
  `,
  handoffs: [salesAgent, refundAgent],
});

async function main(query = "") {
  const result = await run(receptionAgent, query);
  console.log(result.finalOutput);
  console.log("history", result.history);
}

main(`Hey There! can you tell me which what plan is best for me ?`);
