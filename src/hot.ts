import uuid4 from "uuid4";
import { baseEncode } from "@near-js/utils";
import type { InjectedState, HotRequest, HotResponse } from "./helpers/types";
import { createRequest, getResponse } from "./helpers/proxy";

declare global {
  interface Window {
    hotExtension?: {
      autoRun: boolean;
      request: (method: string, args: any) => any;
      subscribe: (event: string, args: any) => () => void;
      evm: any;
    };
  }
}

export const wait = (timeout: number) => {
  return new Promise<void>((resolve) => setTimeout(resolve, timeout));
};

export class RequestFailed extends Error {
  name = "RequestFailed";
  constructor(readonly payload: any) {
    super();
  }
}

export const getExtension = () => {
  if (typeof window === "undefined") return null;
  return window.hotExtension;
};

let connector: HTMLDivElement | undefined;
if (typeof window !== "undefined") {
  window.addEventListener("message", (e: any) => {
    if (e.data === "hot-close") {
      connector?.remove();
      connector = undefined;
    }
  });
}

const createIframe = (widget: string) => {
  connector?.remove();
  connector = document.createElement("div");

  const iframe = document.createElement("iframe");
  connector?.appendChild(iframe);

  iframe.src = widget;
  iframe.allow = "usb";
  iframe.style.border = "none";
  iframe.style.borderRadius = "16px";
  iframe.style.background = "#fff";
  iframe.style.overflow = "hidden";
  iframe.style.background = "#1D1F20";
  iframe.style.border = "1px solid #2C3034";
  iframe.style.width = "375px";
  iframe.style.height = "560px";
  iframe.onclick = (e) => e.stopPropagation();

  connector.style.padding = "16px";
  connector.style.zIndex = "100000000000000";
  connector.style.position = "fixed";
  connector.style.display = "flex";
  connector.style.justifyContent = "center";
  connector.style.alignItems = "center";
  connector.style.top = "0";
  connector.style.left = "0";
  connector.style.width = "100%";
  connector.style.height = "100%";
  connector.style.background = "rgba(0, 0, 0, 0.1)";
  connector.style.backdropFilter = "blur(24px)";
  connector.onclick = () => {
    connector?.remove();
    connector = undefined;
  };

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
    if (window.hotExtension != null) return window.hotExtension.autoRun;
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

  subscribe(event: string, cb: (e: any) => void) {
    if (!window.hotExtension) return () => {};
    return window.hotExtension.subscribe(event, cb);
  }

  async request<T extends keyof HotResponse>(method: T, request: HotRequest[T]): Promise<HotResponse[T]> {
    if (window.hotExtension != null) return window.hotExtension.request(method, request);
    if (this.isInjected) return this.injectedRequest(method, request);

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
