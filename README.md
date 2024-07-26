# HOT Wallet SDK

## Connector for Injected Apps

- Solana Connect
- TON Connect
- EVM Connect
- NEAR Connect (coming soon)

### Solana Connect

`yarn add @solana/wallet-adapter-base @solana/web3.js`

```ts
import "@hot-wallet/sdk/adapter/solana";
```

### TON Connect

```ts
import "@hot-wallet/sdk/adapter/ton";
```

### EVM Connect

```ts
import "@hot-wallet/sdk/adapter/evm";
```

## Debug Injected App

Default example app with chains connector:

https://beta.herewallet.app/hot/browser/hot-example-connect.surge.sh

You can replace hot-example-connect.surge.sh with your own domain (or localhost:PORT) to debug app!

**Happy hacking**
