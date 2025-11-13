import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { Agent, run, OutputGuardrailTripwireTriggered } from "@openai/agents";
import { z } from "zod";

//guardrails agents
const sqlGuardrailAgent = new Agent({
  name: "SQL Guardrail Agent",
  model: "gpt-4.1-mini",
  instructions: `Check if query is safe to execute. The query should be strictly read only and do not modify , delete or drop  any table.`,
  outputType: z.object({
    isSafe: z.boolean().describe("if the query is a safe to execute"),
    reason: z.string().optional().describe("reason if the query is unsafe "),
  }),
});

//guardrail object
const sqlGuardrail = {
  name: "SQL Guardrail",
  execute: async ({ agentOutput }) => {
    const result = await run(sqlGuardrailAgent, agentOutput.sqlQuery);
    return {
      outputInfo: result.finalOutput.reason,
      tripwireTriggered: !result.finalOutput.isSafe,
    };
  },
};

const sqlAgent = new Agent({
  name: "SQL Agent",
  model: "gpt-4.1-mini",
  instructions: `You are an expert SQL agent that is specialized in generating SQL queries as per user request 
  Postgres Schema:
  -- Create the users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create the comments table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    comment_text TEXT, NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
  
);
  `,
  outputType: z.object({
    sqlQuery: z.string().optional().describe("SQL query"),
  }),
  outputGuardrails: [sqlGuardrail],
});

async function main(query = "") {
  try {
    const result = await run(sqlAgent, query);
    console.log(`SQL Query:`, result.finalOutput.sqlQuery);
  } catch (e) {
    if (e instanceof OutputGuardrailTripwireTriggered) {
      console.log(`Invalid Output: Rejected because ${e.message}`);
    }
  }
}

main("update comment set comment_text = 'hello' where id = 1");
