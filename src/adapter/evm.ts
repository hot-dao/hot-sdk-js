import uuid4 from "uuid4";
import HOT from "../hot";

declare global {
  interface Window {
    ethereum: any;
  }
}

const ethereumProvider = {
  on() {},
  isHereWallet: true,
  isConnected: () => true,
  request: (data: any): Promise<any> => {
    return HOT.request("ethereum", data);
  },
};

if (HOT.isInjected) {
  window.ethereum = undefined;
  window.ethereum = ethereumProvider;
}

async function announceProvider() {
  if (typeof window === "undefined") return;
  if (HOT.isInjected) {
    window.ethereum = undefined;
    window.ethereum = ethereumProvider;
  }

  window?.dispatchEvent(
    new CustomEvent("eip6963:announceProvider", {
      detail: Object.freeze({
        provider: ethereumProvider,
        info: {
          name: "HOT",
          icon: "https://storage.herewallet.app/logo.png",
          rdns: "org.hot-labs",
          uuid: uuid4(),
        },
      }),
    })
  );
}

if (typeof window !== "undefined") {
  window?.addEventListener("eip6963:requestProvider", () => announceProvider());
  announceProvider();
}

export { ethereumProvider };
