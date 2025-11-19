import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import { OpenAI } from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4.1-mini",
});

//create conversation to open ai's server
// client.conversations.create({}).then((e) => {
//   console.log(`conversation thread created = ${e.id}`);
// });

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
  const result = await run(sqlAgent, query, {
    conversationId: "conv_691db95e5398819383a97600bf87173c064955b4606a65f4",
  });

  console.log(`SQL Query:`, result.finalOutput);
}

main(" hey, what is my name ");
