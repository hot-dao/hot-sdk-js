import "@near-wallet-selector/modal-ui-js/styles.css";

import { setupWalletSelector, Wallet } from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui-js";
import { FC, useEffect, useState } from "react";

// Wallet-selector adapter
import { setupHotWallet } from "@hot-wallet/sdk/adapter/near";
import { HOT, verifySignature } from "@hot-wallet/sdk";

const initSelector = (async () => {
  const selector = await setupWalletSelector({ modules: [setupHotWallet()], network: "mainnet" });
  const modal = setupModal(selector, { contractId: "" });
  return { selector, modal };
})();

export const ExampleNEAR: FC = () => {
  const [wallet, setWallet] = useState<Wallet>();
  const [walletId, setWalletId] = useState<string>();

  useEffect(() => {
    initSelector.then(({ selector }) => {
      selector.wallet().then((wallet) => {
        wallet.getAccounts().then((t) => {
          setWalletId(t[0].accountId);
          setWallet(wallet);
        });
      });

      selector.on("signedIn", async (t) => {
        setWallet(await selector.wallet());
        setWalletId(t.accounts[0].accountId);
      });

      selector.on("signedOut", async () => {
        setWallet(undefined);
        setWalletId(undefined);
      });
    });
  }, []);

  const connect = async () => {
    const { modal } = await initSelector;
    if (wallet) return wallet.signOut();
    modal.show();
  };

  return (
    <div className="view">
      <p>NEAR Example</p>
      <button onClick={() => connect()}>{walletId ? walletId : "Connect"}</button>
      {walletId != null && <SignMessage />}
    </div>
  );
};

const SignMessage = () => {
  const singMessage = async () => {
    const nonce = Array.from(window.crypto.getRandomValues(new Uint8Array(32)));
    const request = { nonce, recipient: "Demo app", message: "Hello" };

    // Low level api or use wallet-selector adapter
    const result = await HOT.request("near:signMessage", request);
    alert(`Is verfiied: ${verifySignature(request, result)}`);
  };

  const sendTx = async () => {
    // Low level api or use wallet-selector adapter
    await HOT.request("near:signAndSendTransaction", {
      actions: [{ type: "Transfer", params: { deposit: "0" } }],
      receiverId: "game.hot.tg",
    });
  };

  return (
    <>
      <button onClick={() => singMessage()}>Sign message</button>
      <button onClick={() => sendTx()}>Send tx</button>
    </>
  );
};
