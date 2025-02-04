import "./adapter/ton";

export type { HotRequest, HotResponse, InjectedState } from "./helpers/types";
export { default as HOT, RequestFailed } from "./hot";
export { HotWalletAdapter } from "./adapter/solana";
export { hotProvider } from "./adapter/evm";
export { setupHotWallet } from "./adapter/near";
export {
  verifySignature,
  AuthPayload,
  authPayloadSchema,
  SignMessageOptionsNEP0413,
  SignedMessageNEP0413,
} from "./helpers/nep0314";
