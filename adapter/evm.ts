import { InjectedHOT } from "./interactor";

const ethereumProvider = {
  on() {},
  isHereWallet: true,
  isConnected: () => true,
  request: (data: any): Promise<any> => {
    return InjectedHOT.request("ethereum", data);
  },
};

if (InjectedHOT.isInjected) {
  window.ethereum = undefined;
  window.ethereum = ethereumProvider;
}

async function announceProvider() {
  if (typeof window === "undefined") return;
  const injected = await InjectedHOT.connection;
  if (injected == null) return;

  if (InjectedHOT.isInjected) {
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
          rdns: "ai.hotdao",
          uuid: crypto.randomUUID(),
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
