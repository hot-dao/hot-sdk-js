import { InjectedHOT } from "./interactor";

if (InjectedHOT.isInjected) {
  // @ts-ignore
  window.hot = {
    tonconnect: {
      deviceInfo: {
        appName: "hot",
        appVersion: "1",
        maxProtocolVersion: 2,
        platform: "ios",
        features: ["SendTransaction", { name: "SendTransaction", maxMessages: 4 }],
      },

      walletInfo: {
        name: "HOT",
        image: "https://storage.herewallet.app/logo.png",
        about_url: "https://hotdao.ai",
      },

      protocolVersion: 2,
      isWalletBrowser: true,

      connect: (_: number, request: any) => {
        return InjectedHOT.request("ton:connect", request);
      },

      restoreConnection: () => {
        return InjectedHOT.request("ton:restoreConnection", {});
      },

      disconnect: () => {
        return InjectedHOT.request("ton:disconnect", {});
      },

      send: async (request: any) => {
        return InjectedHOT.request("ton:send", request);
      },

      listen: () => {
        return function () {};
      },
    },
  };
}
