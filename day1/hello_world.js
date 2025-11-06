import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { Agent, run } from "@openai/agents";

const helloAgent = new Agent({
  name: "Hello Agent",
  model: "gpt-5-nano",
  instructions:
    "You are an agent that always says hello world with user's name ",
});

// promise
run(helloAgent, "hey there, My name is Mahesh").then((result) => {
  console.log(result.finalOutput);
});

// async/await
// const result = await run(helloAgent, "hey there, My name is Mahesh");
// console.log(result.finalOutput);
