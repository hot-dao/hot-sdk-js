export type Base64 = string;
export interface CreateAccountAction {
  type: "CreateAccount";
}
export interface DeployContractAction {
  type: "DeployContract";
  params: {
    code: Uint8Array;
  };
}
export interface FunctionCallAction {
  type: "FunctionCall";
  params: {
    methodName: string;
    args: object | Base64;
    gas: string | number;
    deposit: string;
  };
}
export interface TransferAction {
  type: "Transfer";
  params: {
    deposit: string;
  };
}
export interface StakeAction {
  type: "Stake";
  params: {
    stake: string;
    publicKey: string;
  };
}
export declare type AddKeyPermission =
  | "FullAccess"
  | {
      receiverId: string;
      allowance?: string;
      methodNames?: Array<string>;
    };

export interface AddKeyAction {
  type: "AddKey";
  params: {
    publicKey: string;
    accessKey: {
      nonce?: number;
      permission: AddKeyPermission;
    };
  };
}
export interface DeleteKeyAction {
  type: "DeleteKey";
  params: {
    publicKey: string;
  };
}
export interface DeleteAccountAction {
  type: "DeleteAccount";
  params: {
    beneficiaryId: string;
  };
}

export declare type Action =
  | CreateAccountAction
  | DeployContractAction
  | FunctionCallAction
  | TransferAction
  | StakeAction
  | AddKeyAction
  | DeleteKeyAction
  | DeleteAccountAction;

export declare type ActionType = Action["type"];

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface Transaction {
  signerId?: string;
  receiverId?: string;
  actions: Array<Action>;
}

export type SignMessageOptionsNEP0413 = {
  message: string; // The message that wants to be transmitted.
  recipient: string; // The recipient to whom the message is destined (e.g. "alice.near" or "myapp.com").
  nonce: number[]; // A nonce that uniquely identifies this instance of the message, denoted as a 32 bytes array (a fixed `Buffer` in JS/TS).
};

export type SignedMessageNEP0413 = {
  signature: string;
  publicKey: string;
  accountId: string;
};
