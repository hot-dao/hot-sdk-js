import { HotInteractor, InjectedState, HotRequest, HotResponse } from "./types";

export const InjectedHOT: HotInteractor = {
  connection: new Promise<InjectedState | null>(() => {}),

  get isInjected() {
    const domains = ["http://localhost:1234", "https://my.herewallet.app", "https://beta.herewallet.app"];
    return (
      new URLSearchParams(window.location.search).has("$hot") || domains.includes(window.location.ancestorOrigins[0])
    );
  },

  request<T extends keyof HotResponse>(method: T, request: HotRequest[T]): Promise<HotResponse[T]> {
    return new Promise<HotResponse[T]>((resolve, reject) => {
      const id = crypto.randomUUID();
      const handler = (e: any) => {
        if (e.data.id !== id) return;
        window?.removeEventListener("message", handler);
        if (e.data.success) return resolve(e.data.payload);
        else return reject(e.data.payload);
      };

      console.log("IFRAME", { hot: true, method, request, id });
      window?.parent.postMessage({ $hot: true, method, request, id }, "*");
      window?.addEventListener("message", handler);
    });
  },
};

InjectedHOT.connection = new Promise<InjectedState | null>((resolve) => {
  if (typeof window === "undefined") return resolve(null);
  if (window?.self === window?.top) return resolve(null);
  InjectedHOT.request("initialized", {})
    .then(resolve)
    .catch(() => resolve(null));
});
