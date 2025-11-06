import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { Agent, run } from "@openai/agents";

const location = "Nepal";

const helloAgent = new Agent({
  name: "Hello Agent",
  model: "gpt-5-nano",
  instructions: function () {
    if (location === "Nepal") {
      return `Always say namaste and then You are an agent that always says hello with user's name`;
    } else {
      return `If you are not in Nepal, you are an agent that always says hello with user's name`;
    }
  },
});

// promise
run(helloAgent, "hey there, My name is Mahesh").then((result) => {
  console.log(result.finalOutput);
});
