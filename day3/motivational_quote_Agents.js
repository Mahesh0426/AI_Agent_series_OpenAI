import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import axios from "axios";

// 1Define structured output schema
const MotivationResultSchema = z.object({
  quote: z.string().describe("motivational quote"),
  author: z.string().describe("author of motivational quote"),
});

//tools
const getQuote = tool({
  name: "get_quote",
  description: "returns  random motivational quote",
  parameters: z.object({
    quote: z.string().describe("motivational quote"),
    author: z.string().describe("author of motivational quote"),
  }),
  execute: async function () {
    const url = "https://zenquotes.io/api/random";

    try {
      const response = await axios.get(url);
      const data = response.data;

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("No quote found from API");
      }

      const quote = data[0].q;
      const author = data[0].a;

      return `💡 "${quote}" — ${author}`;
    } catch (error) {
      console.error("Error fetching quote:", error.message);
      throw new Error("Failed to fetch quote. Try again later.");
    }
  },
});

//agent
const agent = new Agent({
  name: "Motivational_Quote_Agent",
  model: "gpt-4.1-mini",
  instructions: `You are an expert motivational quote agent that give motivitational quote to user¡`,
  tools: [getQuote],
  outputType: MotivationResultSchema,
});

async function main(query = "") {
  const result = await run(agent, query);
  console.log(result.finalOutput);
}

main("give me powerful motivation quote");
