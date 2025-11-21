import { createOpenAI } from "@ai-sdk/openai";


export const openai = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: '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',
})

