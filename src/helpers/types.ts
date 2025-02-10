import type { SendOptions } from "@solana/web3.js";
import { Optional, Transaction } from "@near-wallet-selector/core";
import { SignedMessageNEP0413, SignMessageOptionsNEP0413 } from "./nep0314";

export type InjectedState = {
  telegramId: number;
  solana: { address: string; publicKey: string };
  ton: { address: string; publicKey: string };
  near: { address: string; publicKey: string };
  evm: { address: string; publicKey: string };
};

export interface HotRequest {
  initialized: {};

  "solana:connect": {};
  "solana:signMessage": { message: string };
  "solana:signTransactions": { transactions: string[] };
  "solana:signAndSendTransaction": {
    sendOptions: SendOptions;
    transaction: string;
  };

  "ton:connect": {};
  "ton:restoreConnection": {};
  "ton:disconnect": {};
  "ton:send": {};

  "near:signMessage": SignMessageOptionsNEP0413;
  "near:signAndSendTransactions": { transactions: Array<Optional<Transaction, "signerId">> };
  "near:signIn": {};
  "near:signOut": {};

  ethereum: {
    account?: { chain: number; address: string | null };
    method: string;
    params: any[];
  };
}

export interface HotResponse {
  "solana:signTransactions": { transactions: string[] };
  "solana:signAndSendTransaction": { signature: string };
  "solana:signMessage": { signature: string };
  "solana:connect": { publicKey: string };

  "ton:connect": {};
  "ton:disconnect": {};
  "ton:restoreConnection": {};
  "ton:send": {};

  "near:signMessage": SignedMessageNEP0413;
  "near:signAndSendTransactions": { transactions: any[] };
  "near:signIn": { accountId: string; publicKey: string };
  "near:signOut": {};

  initialized: InjectedState;
  ethereum: any;
}
