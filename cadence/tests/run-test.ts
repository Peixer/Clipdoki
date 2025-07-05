import { executeMint } from './nft-test';

async function main(): Promise<void> {
  console.log('🧪 Starting stake transaction test...');

  try {
    await executeMint();
  } catch (error: unknown) {
    console.error('❌ Test failed:', error);
  }
}

main();
