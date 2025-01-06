import uuid4 from "uuid4";
import { baseEncode } from "@near-js/utils";
import { InjectedState, HotRequest, HotResponse } from "./helpers/types";
import { createRequest, getResponse } from "./helpers/proxy";

export const wait = (timeout: number) => {
  return new Promise<void>((resolve) => setTimeout(resolve, timeout));
};

export class RequestFailed extends Error {
  name = "RequestFailed";
  constructor(readonly payload: any) {
    super();
  }
}

let connector: HTMLIFrameElement | undefined;
window.addEventListener("message", (e: any) => {
  if (e.data === "hot-close") {
    connector?.remove();
    connector = undefined;
  }
});

const createIframe = (widget: string) => {
  connector?.remove();
  connector = document.createElement("iframe");
  connector.src = widget;
  connector.allow = "usb";
  connector.style.border = "none";
  connector.style.zIndex = "10000";
  connector.style.position = "fixed";
  connector.style.display = "block";
  connector.style.top = "0";
  connector.style.left = "0";
  connector.style.width = "100%";
  connector.style.height = "100%";
  document.body.appendChild(connector);
  return connector;
};

class HOT {
  walletId = "https://t.me/herewalletbot/app";
  ancestorOrigins = [
    "http://localhost:1234",
    "https://my.herewallet.app",
    "https://tgapp-dev.herewallet.app",
    "https://tgapp.herewallet.app",
    "https://beta.herewallet.app",
  ];

  readonly connection = new Promise<InjectedState | null>((resolve) => {
    if (typeof window === "undefined") return resolve(null);
    if (window?.self === window?.top) return resolve(null);
    this.injectedRequest("initialized", {})
      .then(resolve)
      .catch(() => resolve(null));
  });

  get isInjected() {
    if (typeof window === "undefined") return false;
    return this.ancestorOrigins.includes(window.location.ancestorOrigins?.[0]);
  }

  openInHotBrowserUrl: string | null = null;
  toggleOpenInHotBrowser(url: string | null) {
    this.openInHotBrowserUrl = url;
  }

  customProvider?: (data: any, chain: number, address?: string | null) => Promise<any>;
  setupEthProvider(provider?: (data: any, chain: number, address?: string | null) => Promise<any>) {
    this.customProvider = provider;
  }

  async injectedRequest<T extends keyof HotResponse>(method: T, request: HotRequest[T]): Promise<HotResponse[T]> {
    const id = uuid4();
    return new Promise<HotResponse[T]>((resolve, reject) => {
      const handler = (e: any) => {
        if (e.data.id !== id) return;
        window?.removeEventListener("message", handler);
        if (e.data.success) return resolve(e.data.payload);
        else return reject(e.data.payload);
      };

      window?.parent.postMessage({ $hot: true, method, request, id }, "*");
      window?.addEventListener("message", handler);
    });
  }

  async request<T extends keyof HotResponse>(method: T, request: HotRequest[T]): Promise<HotResponse[T]> {
    if (this.isInjected) {
      return this.injectedRequest(method, request);
    }

    const id = uuid4();
    const WebApp: any = (window as any)?.Telegram?.WebApp;

    const requestId = await createRequest({
      inside: !!this.openInHotBrowserUrl || (method === "ethereum" && this.customProvider == null),
      origin: typeof this.openInHotBrowserUrl === "string" ? this.openInHotBrowserUrl : location.href,
      $hot: true,
      method,
      request,
      id,
    });

    const link = `${this.walletId}?startapp=hotconnect-${baseEncode(requestId)}`;
    if (WebApp) WebApp?.openTelegramLink(link);
    else {
      const origin = `https://hot-labs.org/hot-widget/index.html`;
      createIframe(`${origin}?hotconnect-${baseEncode(requestId)}`);
    }

    const poolResponse = async () => {
      await wait(3000);
      const data: any = await getResponse(requestId).catch(() => null);
      if (data == null) return await poolResponse();
      if (data.success) return data.payload;
      throw new RequestFailed(data.payload);
    };

    const result = await poolResponse();
    connector?.remove();
    return result;
  }
}

export default new HOT();
