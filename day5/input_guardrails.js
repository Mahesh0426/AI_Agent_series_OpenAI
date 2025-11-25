import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import {
  Agent,
  run,
  tool,
  InputGuardrailTripwireTriggered,
} from "@openai/agents";
import { z } from "zod";

//math input agent
const mathQueryChecker = new Agent({
  name: "Math Query Checker",
  model: "gpt-4.1-mini",
  instructions: `You are an input guardrail agent that checks if the input is a maths question or not.

    Rules:
    - The question has to be strictly a maths equation only.
    - Reject any other kind of request even if it is not related to maths.
    `,
  outputType: z.object({
    isValidMathQuestion: z
      .boolean()
      .describe("if the question is a maths question"),
    reason: z.string().optional().describe("reason for rejection"),
  }),
});

//input guardrails
const mathInputGuardrail = {
  name: "Math Homework Guardrail",
  execute: async ({ input }) => {
    const result = await run(mathQueryChecker, input);
    return {
      outputInfo: result.finalOutput.reason,
      tripwireTriggered: !result.finalOutput.isValidMathQuestion, // <-- This value decides if we have to trigger
    };
  },
};

//math agent
const mathAgent = new Agent({
  name: "Math Agent",
  model: "gpt-4.1-mini",
  instructions: "You are an expert maths AI agent",
  inputGuardrails: [mathInputGuardrail],
});

async function main(query = "") {
  try {
    const result = await run(mathAgent, query);
    console.log(result.finalOutput);
  } catch (e) {
    if (e instanceof InputGuardrailTripwireTriggered) {
      console.log(`Invalid Input: Rejected because ${e.message}`);
    }
  }
}

main("what is the square root of 144 ?");
