import { prisma } from './prisma';
import { v4 as uuidv4 } from 'uuid';
/**
 * Function to generate a new API key
 */
export async function generateApiKey(): Promise<string> {
  const key = uuidv4();

  await prisma.apiKey.create({
    data: {
      key,
      createdAt: new Date(),
    },
  });

  return key;
}

/**
 * Function to retrieve API key based on model
 */
export function getModelApiKey(model: string): string | undefined {
  const modelApiKeys: { [key: string]: string | undefined } = {
    OpenAI: process.env.OPENAI_API_KEY,
    AzureAI: process.env.AZURE_AAI_API_KEY,
    AnthropicClaude: process.env.ANTHROPIC_API_KEY,
    GoogleGemini: process.env.GOOGLE_GEMINI_API_KEY,
    Mistral: process.env.MISTRAL_API_KEY,
    Llama: process.env.LLAMA_API_KEY,
    Grok: process.env.GROK_API_KEY,
  };

  return modelApiKeys[model];
}
