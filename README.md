# HOT Wallet SDK

## Connector for Injected Apps

- Solana Connect
- TON Connect
- EVM Connect
- NEAR Connect

### Solana Connect

```ts
import { HOT } from "@hot-wallet/sdk";
import { HotWalletAdapter } from "@hot-wallet/sdk/adapter/solana";

// for @solana/wallet-adapter-base
const adapter = new HotWalletAdapter();

// Or low level api
const result = await HOT.request("solana:connect", {});
const result = await HOT.request("solana:signMessage", { ... });
const result = await HOT.request("solana:signTransactions", { ... });
const result = await HOT.request("solana:signAndSendTransaction", { ... });
```

### NEAR Connect

```ts
import { setupHotWallet } from "@hot-wallet/adapter/near";
// Setup near-wallet-selector with setupHotWallet()

// Or use low level api
import { HOT } from "@hot-wallet/sdk";
const result = await HOT.request("near:signMessage", { ... });
const result = await HOT.request("near:signAndSendTransaction", { ... });
```

### TON Connect

```ts
import "@hot-wallet/sdk/adapter/ton";
// After this you can use @tonconnect/sdk as you want
```

### EVM Connect (Injected only)

```ts
import { ethereumProvider } from "@hot-wallet/sdk/adapter/evm";
// After this you can use window.ethereum as you want
// Or use web3 or etherjs with ethereumProvider like eip6963 standart
```

## Debug Injected App

Default example app with chains connector:

1. Open https://t.me/herewalletbot/app?startapp=browser
2. Enter https://hot-example-connect.surge.sh inside HOT Wallet

You can replace hot-example-connect.surge.sh with your own domain (or localhost:PORT) to debug app!

**Happy hacking**
