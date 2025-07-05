import fcl from '@onflow/fcl';
import EC from 'elliptic';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ec = new EC.ec('secp256k1');

// Configure FCL for emulator
fcl.config({
  'accessNode.api': 'http://localhost:8888',
  'discovery.wallet': 'http://localhost:8888/fcl/authn',
  'fcl.accountProof.resolver': 'http://localhost:8888/fcl/account-proof',
  '0xHackathonNFTCollection': '0xf8d6e0586b0a20c7',
});

// Emulator account configuration
const EMULATOR_ACCOUNT = {
  address: 'f8d6e0586b0a20c7',
  privateKey: '39dbc807732235567e28598c64a402af177c0136031caf54f31c7fabd502b04b',
  keyIndex: 0,
};

// Configure FCL for emulator
// fcl.config({
//   "flow.network": "testnet",
//   "accessNode.api": "https://rest-testnet.onflow.org",
//   "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
//   "fcl.accountProof.resolver": "http://localhost:8888/fcl/account-proof",
//   "0xStakingContract": "0xacdf784e6e2a83f0",
//   "0xBattleContract": "0xacdf784e6e2a83f0",
//   "0xFungibleToken": "0x9a0766d93b6608b7",
//   "0xFlowToken": "0x7e60df042a9c0868",
// });

// // Emulator account configuration
// const TESTNET_ACCOUNT = {
//   address: "0x7e57a6a684f820cb",
//   privateKey:
//     "",
//   keyIndex: 0,
// };

// Type definitions
interface FlowAccount {
  address: string;
  keys: Array<{
    index: number;
    publicKey: string;
    signAlgo: number;
    hashAlgo: number;
    weight: number;
    sequenceNumber: number;
    revoked: boolean;
  }>;
  balance: number;
  code: string;
  contracts: Record<string, string>;
}

interface Signable {
  message: string;
  keyId: number;
  addr: string;
  roles: {
    proposer: boolean;
    authorizer: boolean;
    payer: boolean;
    param: boolean;
  };
  cadence: string;
  args: any[];
  data: Record<string, any>;
}

interface AuthorizationResult {
  tempId: string;
  addr: string;
  keyId: number;
  kind: string;
  sequenceNum: number;
  signature: string | null;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  signingFunction: (signable: Signable) => {
    addr: string;
    keyId: number;
    signature: string;
  };
}

async function authorizeMinter(
  addr: string, 
  flowKey: number, 
  privateKey: string
): Promise<(account?: any) => AuthorizationResult> {
  const user = await getAccount(addr);
  const key = user.keys[flowKey];
  const sign = signWithKey;
  const pk = privateKey;

  return (account = {}) => ({
    ...account,
    tempId: `${user.address}-${key.index}`,
    addr: fcl.sansPrefix(user.address),
    keyId: Number(key.index),
    signingFunction: (signable: Signable) => ({
      addr: fcl.withPrefix(user.address),
      keyId: Number(key.index),
      signature: sign(pk, signable.message),
    }),
  });
}

async function getAccount(addr: string): Promise<FlowAccount> {
  const { account } = await fcl.send([fcl.getAccount(addr)]);
  return account;
}

function signWithKey(privateKey: string, msg: string): string {
  const key = ec.keyFromPrivate(Buffer.from(privateKey, 'hex'));
  const sig = key.sign(hashMsg(msg));
  const n = 32;
  const r = sig.r.toArrayLike(Buffer, 'be', n);
  const s = sig.s.toArrayLike(Buffer, 'be', n);
  return Buffer.concat([r, s]).toString('hex');
}

function hashMsg(msg: string): Buffer {
  return crypto.createHash('sha256').update(Buffer.from(msg, 'hex')).digest();
}

// Alternative function to load transaction from file
export async function executeMint(): Promise<void> {
  try {
    // Create authorization function for emulator
    const authz = await authorizeMinter(
      EMULATOR_ACCOUNT.address,
      EMULATOR_ACCOUNT.keyIndex,
      EMULATOR_ACCOUNT.privateKey,
    ); 

    // Load transaction from file
    const transactionCode = fs.readFileSync(path.join(__dirname, '../transactions/mint.cdc'), 'utf8');

    console.log('🚀 Starting stake transaction from file...'); 

    const args = [
      fcl.arg('MINT NFT', fcl.t.String),  
    ]; 

    const transactionId = await fcl.send([
      fcl.transaction(transactionCode),
      fcl.args(args),
      fcl.proposer(authz as any),
      fcl.authorizations([authz as any]),
      fcl.payer(authz as any),
      fcl.limit(1000),
    ]);

    console.log('📝 Transaction submitted with ID:', transactionId);

    const transaction = await fcl.tx(transactionId).onceSealed();

    if (transaction.status === 4) {
      console.log('✅ Transaction successful!');
    } else {
      console.log('❌ Transaction failed:', transaction);
    }
  } catch (error) {
    console.error("❌ Error executing stake transaction from file:", error);
  }
}

// Export functions for use in other files
export {
  EMULATOR_ACCOUNT,
};
