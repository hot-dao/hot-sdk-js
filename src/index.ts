import { ethereumProvider } from "./adapter/evm";
import { HotWalletAdapter as SolanaHotWalletAdapter } from "./adapter/solana";
import "./adapter/ton";

export { AuthPayload, authPayloadSchema, verifySignature } from "./helpers/nep0314";
export { SolanaHotWalletAdapter, ethereumProvider };

export type { HotRequest, HotResponse, InjectedState } from "./helpers/types";
export { default as HOT, RequestFailed } from "./hot";
