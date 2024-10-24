import { generateApiKey } from '../lib/apiKeys';

async function main() {
  try {
    const key = await generateApiKey();
    console.log(`Generated API Key: ${key}`);
    process.exit(0);
  } catch (error) {
    console.error('Error generating API key:', error);
    process.exit(1);
  }
}

main();
