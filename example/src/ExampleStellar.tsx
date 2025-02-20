import { FC, useState } from "react";
import { StellarWalletsKit, WalletNetwork, allowAllModules, ISupportedWallet } from "@creit.tech/stellar-wallets-kit";
import HotWalletModule, { HOTWALLET_ID } from "@hot-wallet/sdk/adapter/stellar";

const kit: StellarWalletsKit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: HOTWALLET_ID,
  modules: [new HotWalletModule(), ...allowAllModules()],
});

export const ExampleStellar: FC = () => {
  const [walletId, setWalletId] = useState<string | null>(null);

  const connect = async () => {
    await kit.openModal({
      onWalletSelected: async (option: ISupportedWallet) => {
        kit.setWallet(option.id);
        const { address } = await kit.getAddress();
        setWalletId(address);
      },
    });
  };

  const singMessage = async () => {
    const { signerAddress } = await kit.signMessage("Hello, world!");
    setWalletId(signerAddress!);
  };

  const signTransaction = async () => {
    const { signerAddress } = await kit.signTransaction(
      "AAAAAgAAAAATX1ItLRsygXYd0CK+8a98b9/aRhS2xNrR0LwtieQVTQAAAGQDU8XkAAAAAQAAAAEAAAAAAAAAAAAAAABnt22tAAAAAAAAAAEAAAAAAAAADwAAAACO5ORuH5/s9EMbb3rfJ+AcNdM2QzMl3k8xvU2l6gQhtQAAAAAAAAAA"
    );

    setWalletId(signerAddress!);
  };

  return (
    <div className="view">
      <p>Stellar Example</p>
      <button onClick={() => connect()}>
        {walletId ? walletId.slice(0, 5) + ".." + walletId.slice(-5) : "Connect"}
      </button>
      <button onClick={() => singMessage()}>Sign message</button>
      <button onClick={() => signTransaction()}>Send tx</button>
    </div>
  );
};
