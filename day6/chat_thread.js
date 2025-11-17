import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";

let thread = [];

//tools
const executeSQL = tool({
  name: "executeSQL",
  description: "This execute the SQL query",
  parameters: z.object({
    sqlQuery: z.string().describe("SQL query"),
  }),
  execute: async function ({ sqlQuery }) {
    console.log(`[SQL]: execute ${sqlQuery}`);
    return `done`;
  },
});

const sqlAgent = new Agent({
  name: "SQL Agent",
  model: "gpt-4.1-mini",
  tools: [executeSQL],
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
});

async function main(query = "") {
  // store the msg in db (History)
  thread.push({ role: "user", content: query });
  const result = await run(sqlAgent, thread);
  // Update the thread with the latest history from the run
  thread = result.history;
  console.log(`SQL Query:`, result.finalOutput);
}

main("my name is mahesh ").then(() => {
  main("get me all the use with my name ");
});
