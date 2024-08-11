import {
  useTonConnectUI,
  useTonWallet,
  TonConnect,
  TonConnectButton,
  TonConnectUIProvider,
} from "@tonconnect/ui-react";
import { FC } from "react";

// // ALL MAGIC THERE!
import "@hot-wallet/sdk/adapter/ton";

const connector = new TonConnect({
  walletsListSource: "/wallets-v2.json",
});

export const ExampleTON: FC = () => {
  return (
    <TonConnectUIProvider connector={connector} manifestUrl="/tonconnect-manifest.json">
      <div className="view">
        <p>TON Example</p>
        <TonConnectButton />
        <SendTONToRandomAddress />
      </div>
    </TonConnectUIProvider>
  );
};

const SendTONToRandomAddress = () => {
  const wallet = useTonWallet();

  const [tonConnectUI] = useTonConnectUI();
  const RANDOM_ADDR = "0:412410771DA82CBA306A55FA9E0D43C9D245E38133CB58F1457DFB8D5CD8892F";

  return (
    <button
      disabled={!wallet}
      onClick={() =>
        tonConnectUI.sendTransaction({
          validUntil: Date.now() + 200000,
          messages: [{ address: RANDOM_ADDR, amount: "100" }],
        })
      }
    >
      Send TON to a random address!
    </button>
  );
};
