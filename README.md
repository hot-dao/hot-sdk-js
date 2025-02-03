# HOT Wallet SDK

## Connector for Injected Apps

- Support HOT Extension
- Support Telegram/Mobile App via Iframe Widget

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
await HOT.request("solana:connect", {});
await HOT.request("solana:signMessage", { ... });
await HOT.request("solana:signTransactions", { ... });
await HOT.request("solana:signAndSendTransaction", { ... });
```

### NEAR Connect

```ts
import { setupHotWallet } from "@hot-wallet/adapter/near";
// Setup near-wallet-selector with setupHotWallet()

// Or use low level api
import { HOT } from "@hot-wallet/sdk";
await HOT.request("near:signIn", {});
await HOT.request("near:signMessage", { ... });
await HOT.request("near:signAndSendTransaction", { ... });
```

### TON Connect

```ts
import "@hot-wallet/sdk/adapter/ton";
// After this you can use @tonconnect/sdk as you want

// Or use low lvel api
import { HOT } from "@hot-wallet/sdk";
await HOT.request("ton:connect", {});
await HOT.request("ton:send", { ... });
```

### EVM Connect

If the application is opened inside HOT, then your wallet-selector (web3modal or rainbowkit) will automatically see the HOT wallet:

```ts
import "@hot-wallet/sdk";
```

If you integrate HOT on a website or a separate Telegram miniapp, you need to call the method:

```ts
import { HOT } from "@hot-wallet/sdk";
HOT.setupEthProvider((request, chain, address) => {
  // use rpc for connected chain and address
  return yourPublicRpcProvider[chain]?.request(request);
});
```

`hotProvider` implements methods that require a private key signature. All other methods that need to be sent to the network you must implement yourself.
You can use your own rpc for this in conjunction with etherjs or web3 library.

```ts
// Or use low lvel api
import { HOT } from "@hot-wallet/sdk";
await HOT.request("ethereum", { ... });
```

## Debug Injected App

Default example app with chains connector:

1. Open https://t.me/herewalletbot/app?startapp=browser
2. Enter https://hot-example-connect.surge.sh inside HOT Wallet

You can replace hot-example-connect.surge.sh with your own domain (or localhost:PORT) to debug app!

**Happy hacking**
