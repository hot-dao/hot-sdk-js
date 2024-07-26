import { InjectedHOT } from "./interactor";
import { ethereumProvider } from "./evm";
import { HotWalletAdapter as SolanaHotWalletAdapter } from "./solana";
import "./ton";

export { ethereumProvider, SolanaHotWalletAdapter, InjectedHOT };
