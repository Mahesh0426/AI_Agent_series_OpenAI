import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import axios from "axios";
import nodemailer from "nodemailer";
import readline from "node:readline/promises";

// Tools
const getWeatherTool = tool({
  name: "get_weather",
  description: "returns the current weather for a given  city ",
  parameters: z.object({ city: z.string().describe("name of city") }),
  execute: async function ({ city }) {
    const url = `https://wttr.in/${city.toLowerCase()}?format=%C+%t`;
    const response = await axios.get(url, { responseType: "text" });
    return `The current weather of ${city} is ${response.data}`;
  },
});

const sentEmailTool = tool({
  name: "send_email",
  description: "sends an email",
  parameters: z.object({
    to: z.string().describe("to email address"),
    subject: z.string().describe("subject of the email"),
    html: z.string().describe("html body for the email"),
  }),
  needsApproval: true, //enable need approval
  execute: async function ({ to, subject, html }) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: to,
      subject,
      html: html,
    };

    await transporter.sendMail(mailOptions);
    return `Email sent successfully to ${to}`;
  },
});

//user confirmation function
async function askForUserToConform(question: string) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = await rl.question(`${question} (y/n): `);
  rl.close();
  return answer.toLowerCase() === "y" || answer.toLowerCase() === "yes";
}

///agent
const agent = new Agent({
  name: "Weather Email Agent",
  instructions: `You are an export agent in getting weather info and sendting it using email`,
  tools: [getWeatherTool, sentEmailTool],
});

async function main(q: string) {
  let result = await run(agent, q);
  let hasInteruptions = result.interruptions.length > 0;
  while (hasInteruptions) {
    //store current state
    const currentState = result.state;
    for (const interrupt of result.interruptions) {
      if (interrupt.type === "tool_approval_item") {
        const isAllowed = await askForUserToConform(
          `Agent ${interrupt.agent.name} isasking for calling for the tool ${interrupt.rawItem.name} with args ${interrupt.rawItem.arguments}`
        );
        if (isAllowed) {
          currentState.approve(interrupt);
        } else {
          currentState.reject(interrupt);
        }

        //resume execution of the current state
        result = await run(agent, currentState);
        hasInteruptions = result.interruptions.length > 0;
      }
    }
  }
}

main(
  `what is the weather of sydney and Darwin in Australia and me on kunwarmahesh29@gmail.com about it`
);
