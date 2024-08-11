import { HOT, verifySignature } from "@hot-wallet/sdk";
import { FC } from "react";

export const ExampleNEAR: FC = () => {
  return (
    <div className="view">
      <p>NEAR Example</p>
      <SignMessage />
    </div>
  );
};

const SignMessage = () => {
  const singMessage = async () => {
    const nonce = new Uint8Array(32);
    const request = {
      nonce: window.crypto.getRandomValues(nonce),
      recipient: "Demo app",
      message: "Hello",
    };

    const result = await HOT.request("near:signMessage", request);
    alert(`Is verfiied: ${verifySignature(request, result)}`);
  };

  const sendTx = async () => {
    const result = await HOT.request("near:signAndSendTransaction", {
      receiverId: "game.hot.tg",
      actions: [{ type: "Transfer", params: { amount: "0" } }],
    });
  };

  return (
    <>
      <button onClick={() => singMessage()}>Sign message</button>
      <button onClick={() => sendTx()}>Send tx</button>
    </>
  );
};
