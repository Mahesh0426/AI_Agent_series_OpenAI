import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import axios from "axios";
import nodemailer from "nodemailer";
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

const sendEmailTool = tool({
  name: "send_email",
  description: " This is tool that sends an email",
  parameters: z.object({
    toEmail: z.string().describe("email to send to"),
    subject: z.string().describe("subject of email"),
    body: z.string().describe("body of email"),
  }),
  execute: async function ({ toEmail, subject, body }) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: toEmail,
      subject,
      text: body,
    };

    await transporter.sendMail(mailOptions);
    return `Email sent successfully to ${toEmail}`;
  },
});

// Agent
const agent = new Agent({
  name: "Weather_Agent",
  model: "gpt-4.1-mini",
  instructions: `You are an expert weather agent that can get weather info and send it via email.`,
  tools: [getWeather, sendEmailTool],
});

//
async function main(query = "") {
  const result = await run(agent, query);
  console.log(result.finalOutput);
}
main(
  "Can you send the weather report for katmandu city of nepal  in mail address kunwarmahesh29@gmail.com"
);
