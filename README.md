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
const result = await HOT.request("solana:connect", {}); // See src/helpers/types (HotRequest)
```

### NEAR Connect

```ts
import { HOT } from "@hot-wallet/sdk";
// low level api
const result = await HOT.request("near:signMessage", { ... }); // See src/helpers/types (HotRequest)
const result = await HOT.request("near:signAndSendTransaction", { ... }); // See src/helpers/types (HotRequest)
```

### TON Connect

```ts
import "@hot-wallet/sdk/adapter/ton";
// After this you can use @tonconnect/sdk as you want
```

### EVM Connect (Injected only)

```ts
import "@hot-wallet/sdk/adapter/evm";
// After this you can use window.ethereum as you want
```

## Debug Injected App

Default example app with chains connector:

1. Open https://t.me/herewalletbot/app?startapp=browser
2. Enter https://hot-example-connect.surge.sh inside HOT Wallet

You can replace hot-example-connect.surge.sh with your own domain (or localhost:PORT) to debug app!

**Happy hacking**
