import { openai } from './src/lib/ai.ts'
import { generateText } from 'ai'

const model = openai('openai/gpt-oss-20b:free')


const result = await generateText({
    model,
    prompt: 'Hello, world!'
})

console.log(result.text)
