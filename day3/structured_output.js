//Structured output with Zod

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { Agent, run, tool } from "@openai/agents";

//structure result schema into zod object
const GetWeatherResultSchema = z.object({
  city: z.string().describe("name of city"),
  degree_c: z.number().describe("the degree celcius of the temperature"),
  condition: z.string().describe("condition of the weather"),
});
// Tools
const getWeather = tool({
  name: "get_weather",
  description: "returns the current weather for a given  city ",
  parameters: z.object({ city: z.string().describe("name of city") }),
  execute: async function ({ city }) {
    const url = `https://wttr.in/${city.toLowerCase()}?format=%C+%t`;
    const response = await axios.get(url, { responseType: "text" });
    return `The current weather of ${city} is ${response.data}`;
  },
});

const agent = new Agent({
  name: "Weather_Agent",
  model: "gpt-4.1-mini",
  instructions: `You are an expert weather agent that can get weather info .`,
  tools: [getWeather],
  outputType: GetWeatherResultSchema,
});

//
async function main(query = "") {
  const result = await run(agent, query);
  console.log(result.finalOutput);

  // it became object ans we can destructure it  | GetWeatherResultSchema
  console.log(result.finalOutput.degree_c);
  console.log(result.finalOutput.city);
  console.log(result.finalOutput.condition);
}
main("what is the weather of Sydney Australia ?");
