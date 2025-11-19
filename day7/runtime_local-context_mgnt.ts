import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { Agent, run, tool, RunContext } from "@openai/agents";
import { z } from "zod";

interface MyContext {
  userId: string;
  userName: string;

  //dependency
  fetchUserInfoFromDb: (userId: string) => Promise<string>;
}
//tools
const getUserInfo = tool({
  name: "get_user_info",
  parameters: z.object({}),
  description: "Get user information",
  execute: async (
    _,
    ctx?: RunContext<MyContext>
  ): Promise<string | undefined> => {
    // return `UserId=${ctx?.context.userId}\nUserName=${ctx?.context.userName}}`;
    const result = await ctx?.context.fetchUserInfoFromDb("");

    return result;
  },
});
const CustomerSupportAgentt = new Agent<MyContext>({
  name: "Customer Support Agent",
  model: "gpt-4.1-mini",
  tools: [getUserInfo],
  instructions: `You are an expert Customer support agent`,
});

async function main(query: string, ctx: MyContext) {
  const result = await run(CustomerSupportAgentt, query, { context: ctx });
  console.log(result.finalOutput);
}

main("what is my name and id", {
  userId: "123",
  userName: "Mahesh",
  fetchUserInfoFromDb: async (id) => `UserId=123,userName=Mahesh`,
});
