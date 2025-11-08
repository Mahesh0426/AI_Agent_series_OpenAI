# AI Agents Series (JS) — using @openai/agents

This repository demonstrates small example agents built with the `@openai/agents` SDK in JavaScript. Each example is self-contained and shows a different pattern: a simple hello agent, a dynamic-instruction agent, and a tool-enabled agent.

## Files / key symbols

- [day1/hello_world.js](day1/hello_world.js) — simple hello agent using [`helloAgent`](day1/hello_world.js).
- [day1/Dynamic_instruction.js](day1/Dynamic_instruction.js) — agent with runtime instructions using [`helloAgent`](day1/Dynamic_instruction.js).
- [day2/Tool_calling.js](day2/Tool_calling.js) — tool-enabled agent demonstrating:
  - [`getWeather`](day2/Tool_calling.js) tool (HTTP lookup)
  - [`sendEmailTool`](day2/Tool_calling.js) tool (smtp via nodemailer)
  - [`agent`](day2/Tool_calling.js) agent configuration
  - [`main`](day2/Tool_calling.js) runner
- [day3/structured_output.js](day3/structured_output.js) — agent that demonstrates producing validated structured output (JSON) and schema-driven responses. Shows how to instruct the model to emit JSON, validate/parse the output (e.g., with `zod`), and handle parsing errors.

- [package.json](package.json) — project metadata and dependencies.
- [.env](.env) — environment variables (API keys, email creds). Do NOT commit secrets.

## Quick start

1. Install dependencies:

```sh
npm install
npm i @openai/agents zod
npm i dotenv
```

2. Run the agent:

```sh
node day2/Tool_calling.js
```
