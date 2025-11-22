import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { Agent, run, tool, RunContext } from "@openai/agents";
import { z } from "zod";

const agent = new Agent({
  name: "Storyteller",
  instructions:
    "You are a storyteller. You will be given a topic and you will tell a story about it.",
});

//generator function
async function* streamOutput(q: string) {
  const result = await run(agent, q, { stream: true });
  const stream = result.toTextStream();
  for await (const val of stream) {
    yield { isCompleted: false, value: val };
  }
  yield { isCompleted: true, value: result.finalOutput };
}

async function main(q: string) {
  //this is specially uses in frontend to show streaming
  for await (const o of streamOutput(q)) {
    console.log(o);
  }

  //   const result = await run(agent, q, { stream: true });
  //   console.log("Result", result.finalOutput);

  //streaming | 1 way
  //   const stream = result.toTextStream();
  //   for await (const chunk of stream) console.log(chunk);

  //streaming | 2 way
  //   result.toTextStream({ compatibleWithNodeStreams: true }).pipe(process.stdout);
}
main("In 100 words tell me story about iphone ?");
