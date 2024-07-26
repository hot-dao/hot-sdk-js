import { SendOptions } from "@solana/web3.js";

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
  "solana:signTransaction": { transaction: string };
  "solana:signAllTransactions": { transactions: string[] };
  "solana:signAndSendTransaction": {
    sendOptions: SendOptions;
    transaction: string;
  };

  "ton:connect": {};
  "ton:restoreConnection": {};
  "ton:disconnect": {};
  "ton:send": {};

  ethereum: {
    method: string;
    params: any[];
  };
}

export interface HotResponse {
  "solana:signTransaction": { transaction: string };
  "solana:signAllTransactions": { transactions: string[] };
  "solana:signAndSendTransaction": { signature: string };
  "solana:signMessage": { signature: string };
  "solana:connect": { publicKey: string };

  "ton:connect": {};
  "ton:disconnect": {};
  "ton:restoreConnection": {};
  "ton:send": {};

  ethereum: any;

  initialized: InjectedState;
}

export type HotInteractor = {
  isInjected: boolean;
  request<T extends keyof HotResponse>(method: T, request: HotRequest[T]): Promise<HotResponse[T]>;
  connection: Promise<InjectedState | null>;
};
