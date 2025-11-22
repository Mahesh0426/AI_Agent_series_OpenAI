# AI Agents Series (JS) — using @openai/agents

This repository demonstrates small example agents built with the `@openai/agents` SDK in JavaScript. Each example is self-contained and shows a different pattern: a simple hello agent, a dynamic-instruction agent, tool-enabled agents, structured output, agent handoffs, and multi-agent orchestration.

## ✨ Features and Patterns

This series explores the following agent development patterns:

- **Simple Agent:** Basic agent creation and execution.
- **Dynamic Instructions:** Modifying agent behavior at runtime.
- **Tool Calling:** Agents interacting with external services (HTTP, email).
- **Structured Output:** Generating validated JSON responses based on a schema.
- **Agent Handoff:** Routing user requests to specialized agents.
- **Multi-Agent Orchestration:** Agents calling other agents as tools.
- **Guardrails:** Controlling agent input and output for safety and validation.
- **Conversation Management:** Handling stateful, multi-turn chat history.
- **Streaming:** Delivering responses incrementally for better user experience.
- **Runtime Context:** Injecting request-specific data into agent runs.

## Files / key symbols

- [day1/hello_world.js](day1/hello_world.js) — simple hello agent using [`helloAgent`](day1/hello_world.js).
- [day1/Dynamic_instruction.js](day1/Dynamic_instruction.js) — agent with runtime instructions using [`helloAgent`](day1/Dynamic_instruction.js).
- [day2/Tool_calling.js](day2/Tool_calling.js) — tool-enabled agent demonstrating:
  - [`getWeather`](day2/Tool_calling.js) tool (HTTP lookup)
  - [`sendEmailTool`](day2/Tool_calling.js) tool (smtp via nodemailer)
  - [`agent`](day2/Tool_calling.js) agent configuration
  - [`main`](day2/Tool_calling.js) runner
- [day3/structured_output.js](day3/structured_output.js) — agent that demonstrates producing validated structured output (JSON) and schema-driven responses. Shows how to instruct the model to emit JSON, validate/parse the output (e.g., with `zod`), and handle parsing errors.
- [day4/handoff-Agent.js](day4/handoff-Agent.js) — demonstrates agent handoff pattern where a reception agent routes customers to specialized agents (sales or refund) based on their needs. Shows:
  - [`receptionAgent`](day4/handoff-Agent.js) with handoff configuration
  - [`salesAgent`](day4/handoff-Agent.js) and [`refundAgent`](day4/handoff-Agent.js) as handoff targets
  - [`RECOMMENDED_PROMPT_PREFIX`](day4/handoff-Agent.js) for handoff instructions
  - [`handoffDescription`](day4/handoff-Agent.js) for routing logic
- [day4/multi-agent.js](day4/multi-agent.js) — demonstrates orchestrating multiple agents where agents can call other agents as tools. Shows:

  - [`agent`](day4/multi-agent.js) (sales agent) that orchestrates multiple specialized agents
  - [`refundAgent`](day4/multi-agent.js) and [`SupportAgent`](day4/multi-agent.js) called via [`asTool()`](day4/multi-agent.js)
  - Agent-to-agent collaboration patterns

- [day5/input_guardrails.js](day5/input_guardrails.js) — demonstrates agent guardrails to control agent behavior.

  - `input_guardrails.js` shows how to use an `inputGuardrail` to validate user input before the main agent runs.
  - `output_guardrails.js` shows how to use an `outputGuardrail` to validate the agent's output before it's returned (e.g., to prevent unsafe SQL queries).

- [day6/chat_thread.js and day6/server_mgnt_conv.js](day6/chat_thread.js) — demonstrates two ways to manage conversation history for stateful agents.
  - `chat_thread.js` shows how to maintain conversation state in-memory by passing the full message history array to the agent on each turn.
  - `server_mgnt_conv.js` shows how to persist conversation state on the server by using a `conversationId`, allowing for stateful interactions without re-sending the entire history.
- [day7/runtime_local-context_mgnt.ts](day7/runtime_local-context_mgnt.ts) — demonstrates how to pass request-specific context to an agent at runtime. Shows how to define a context interface, pass it via `run({ context: ... })`, and access it within a tool's `execute` function to use data and dependencies (like a database fetcher) that are only available at request time.
- [day8/streaming.ts](day8/streaming.ts) — demonstrates how to stream responses from an agent. Shows how to use `{ stream: true }` with `run()`, consume the stream with `result.toTextStream()`, and wrap it in an async generator for use in applications.
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

3. Install typescript

```
sudo npm i -g tsx
```
