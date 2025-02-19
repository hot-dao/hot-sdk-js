import HOT, { getExtension } from "../hot";
import { logo } from "../logo";

declare global {
  interface Window {
    ethereum: any;
  }
}

const makeProvider = () => {
  const hotProvider = {
    on(event: string, cb: any) {
      const set = this._events.get(event);
      if (!set) this._events.set(event, new Set([cb]));
      else set.add(cb);
    },

    removeListener(event: string, cb: any) {
      const set = this._events.get(event);
      set?.delete(cb);
    },

    _events: new Map<string, Set<any>>(),
    isMetaMask: HOT.isInjected,
    isHotWallet: true,

    isConnected: () => HOT.isInjected || hotProvider.address != null,

    get account() {
      return { address: this.address, chain: this.chainId };
    },

    get address(): string | null {
      return localStorage.getItem("hot-wallet-evm-account") || null;
    },

    set address(address: string | null) {
      if (address == null) {
        localStorage.removeItem("hot-wallet-evm-account");
        hotProvider._events.get("accountsChanged")?.forEach((cb) => cb([]));
        hotProvider._events.get("disconnect")?.forEach((cb) => cb());
        return;
      }

      if (this.address == null) {
        hotProvider._events.get("connect")?.forEach((cb) => cb({ chainId: `0x${this.chainId.toString(16)}` }));
      }

      localStorage.setItem("hot-wallet-evm-account", address);
      hotProvider._events.get("accountsChanged")?.forEach((cb) => cb([address]));
    },

    set chainId(chain: number | string) {
      const chainId = typeof chain === "string" ? parseInt(chain, 16) : chain;
      localStorage.setItem("hot-wallet-evm-chainId", chainId.toString());
      hotProvider._events.get("chainChanged")?.forEach((cb) => cb(`0x${chainId.toString(16)}`));
    },

    get chainId(): number {
      return parseInt(localStorage.getItem("hot-wallet-evm-chainId") || "1");
    },

    request: async (data: any): Promise<any> => {
      if (HOT.isInjected) return HOT.request("ethereum", data);

      switch (data.method) {
        case "wallet_revokePermissions":
          hotProvider.address = null;
          return null;

        case "wallet_requestPermissions":
          throw "Unsupported method: wallet_requestPermissions";

        case "eth_accounts":
          return hotProvider.address ? [hotProvider.address] : [];

        case "eth_requestAccounts": {
          const acc = await HOT.request("ethereum", { ...data, account: hotProvider.account });
          hotProvider.address = acc[0];
          return acc;
        }

        case "eth_chainId":
          return "0x" + hotProvider.chainId.toString(16);

        case "wallet_switchEthereumChain": {
          hotProvider.chainId = parseInt(data.params[0]?.chainId || data.params[0], 16);
          return null;
        }

        case "personal_sign":
        case "eth_sendTransaction":
        case "eth_signTransaction":
        case "eth_signTypedData":
        case "eth_signTypedData_v3":
        case "eth_signTypedData_v4":
          return HOT.request("ethereum", { ...data, account: hotProvider.account });

        default:
          if (!HOT.customProvider) throw `Method not implemented ${data} for chain ${hotProvider.chainId}`;
          return HOT.customProvider?.(data, hotProvider.chainId, hotProvider.address);
      }
    },
  };

  try {
    window.ethereum = undefined;
    window.ethereum = hotProvider;
  } catch {}

  async function announceProvider() {
    if (typeof window === "undefined") return;
    if (HOT.isInjected) {
      window.ethereum = undefined;
      window.ethereum = hotProvider;
    }

    window?.dispatchEvent(
      new CustomEvent("eip6963:announceProvider", {
        detail: Object.freeze({
          provider: hotProvider,
          info: {
            icon: logo,
            rdns: "org.hot-labs",
            uuid: "cc8e962c-1f42-425c-8845-e8bd2e136fff",
            name: "HOT Wallet",
          },
        }),
      })
    );
  }

  try {
    if (typeof window !== "undefined") {
      window?.addEventListener("eip6963:requestProvider", () => announceProvider());
      announceProvider();
    }
  } catch {}

  return hotProvider;
};

const hotProvider = getExtension()?.evm || makeProvider();

export { hotProvider };
