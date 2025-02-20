import { HOT } from "..";

export const HOTWALLET_ID = "hot-wallet";

class HotWalletModule {
  moduleType: "HOT_WALLET";
  productId: string;
  productName: string;
  productUrl: string;
  productIcon: string;

  constructor() {
    this.moduleType = "HOT_WALLET";
    this.productId = HOTWALLET_ID;
    this.productName = "HOT Wallet";
    this.productUrl = "https://hot-labs.org/wallet";
    this.productIcon = "https://storage.herewallet.app/logo.png";
  }

  isAvailable(): Promise<boolean> {
    return Promise.resolve(true);
  }

  async getAddress() {
    return await HOT.request("stellar:getAddress", {});
  }

  async signTransaction(xdr: string, opts?: { address?: string }) {
    return await HOT.request("stellar:signTransaction", { xdr, accountToSign: opts?.address });
  }

  async signAuthEntry(authEntry: string, opts?: { address?: string }) {
    return await HOT.request("stellar:signAuthEntry", { authEntry, accountToSign: opts?.address });
  }

  async signMessage(message: string, opts?: { address?: string }) {
    return await HOT.request("stellar:signMessage", { message, accountToSign: opts?.address });
  }

  async getNetwork() {
    return { network: "mainnet", networkPassphrase: "Public Global Stellar Network ; September 2015" };
  }
}

export default HotWalletModule;
