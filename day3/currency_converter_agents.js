import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import axios from "axios";

// 1Define structured output schema
const CurrencyResultSchema = z.object({
  from: z.string().describe("Base currency code, e.g. USD"),
  to: z.string().describe("Target currency code, e.g. EUR"),
  rate: z.number().describe("Exchange rate from base to target"),
  amount: z.number().describe("Amount to convert"),
  converted: z.number().describe("Converted amount"),
});

//tools
const currencyConverter = tool({
  name: "currency_converter",
  description: "Returns the current exchange rate between two currencies",
  parameters: z.object({
    from: z.string().describe("Currency code to convert from, e.g. USD"),
    to: z.string().describe("Currency code to convert to, e.g. AUD"),
    amount: z.number().describe("Amount of money to convert"),
  }),
  execute: async function ({ from, to, amount }) {
    const url = `https://open.er-api.com/v6/latest/${from.toUpperCase()}`;
    const response = await axios.get(url);

    const data = response.data;

    if (data.result === "error") {
      throw new Error(`Failed to fetch exchange rates for ${from}`);
    }

    const rate = data.rates[to.toUpperCase()];
    if (!rate) {
      throw new Error(`Unsupported currency code: ${to}`);
    }

    const converted = amount * rate;
    return `The exchange rate from ${from} to ${to} is ${rate}. ${amount} ${from} = ${converted.toFixed(
      2
    )} ${to}.`;
  },
});
// Agent
const agent = new Agent({
  name: "Currency_Converter_Agent",
  nodel: "gpt-4.1-mini",
  instructions:
    "You are an AI agent who is expert in currency conversion using live rates comming form API. Always give current conversion rate as well even though user did not ask  .",
  tools: [currencyConverter],
  outputType: CurrencyResultSchema,
});

// Run
async function main(query = "") {
  const result = await run(agent, query);
  console.log(result.finalOutput);
}

main("Convert 100 AUD to Nepali Rupees");
