import type { WalletModuleFactory, InjectedWallet } from "@near-wallet-selector/core";
import { HOT, verifySignature } from "..";

declare global {
  interface Window {
    hotNear: any;
  }
}

export function setupHotWallet(): WalletModuleFactory<InjectedWallet> {
  return async () => {
    const connection = await HOT.connection;

    const injectedAccounts = (() => {
      if (!connection?.near) return null;
      const { address, publicKey } = connection.near;
      return [{ accountId: address, publicKey }];
    })();

    return {
      id: "hot-wallet",
      type: "injected",
      metadata: {
        name: "HOT Wallet",
        description: "Multichain wallet under HOT Protocol",
        downloadUrl: "https://www.hotdao.ai/wallet",
        iconUrl: "https://storage.herewallet.app/logo.png",
        topLevelInjected: connection != null,
        useUrlAccountImport: false,
        deprecated: false,
        available: true,
      },

      init: async (config) => {
        if (window.hotNear) {
          window.hotNear.on("accountsChanged", (e: any) => config.emitter.emit("accountsChanged", e));
          window.hotNear.on("signedOut", (e: any) => config.emitter.emit("signedOut", e));
          window.hotNear.on("signedIn", (e: any) => config.emitter.emit("signedIn", e));
        }

        return {
          async getAccounts() {
            if (window.hotNear) return window.hotNear.getAccounts();
            if (injectedAccounts) return injectedAccounts;
            try {
              return JSON.parse(localStorage.getItem("hot:near-account") || "");
            } catch {
              return [];
            }
          },

          async signIn(data) {
            if (injectedAccounts) {
              config.emitter.emit("signedIn", {
                contractId: data.contractId,
                methodNames: data.methodNames ?? [],
                accounts: injectedAccounts,
              });

              return injectedAccounts;
            }

            const nonce = new Uint8Array(32);
            const request: any = {
              recipient: window.location.hostname,
              nonce: window.crypto.getRandomValues(nonce),
              message: "Auth",
            };

            if (window.hotNear) {
              const result = await window.hotNear.signIn(request);
              if (!verifySignature(request, result)) throw "Signature invalid";

              const accounts = [{ accountId: result.accountId, publicKey: result.publicKey }];
              config.emitter.emit("signedIn", {
                contractId: data.contractId,
                methodNames: data.methodNames ?? [],
                accounts,
              });

              return accounts;
            }

            const result = await HOT.request("near:signMessage", request);
            if (!verifySignature(request, result)) throw "Signature invalid";

            const accounts = [{ accountId: result.accountId, publicKey: result.publicKey }];
            localStorage.setItem("hot:near-account", JSON.stringify(accounts));

            config.emitter.emit("signedIn", {
              contractId: data.contractId,
              methodNames: data.methodNames ?? [],
              accounts,
            });

            return accounts;
          },

          async signOut() {
            if (window.hotNear) {
              await window.hotNear.signOut();
              config.emitter.emit("signedOut", null);
              return;
            }

            config.emitter.emit("signedOut", null);
            localStorage.setItem("hot:near-account", "[]");
          },

          async signMessage(params) {
            const request = {
              message: params.message,
              nonce: Array.from(new Uint8Array(params.nonce)),
              recipient: params.recipient,
            };

            const result = window.hotNear
              ? await window.hotNear.signMessage(params)
              : await HOT.request("near:signMessage", request);

            if (!verifySignature(request, result)) throw "Signature invalid";
            return result;
          },

          async signAndSendTransaction(params) {
            const { transaction } = window.hotNear
              ? await window.hotNear.signAndSendTransaction(params)
              : HOT.request("near:signAndSendTransaction", params);
            return transaction as any;
          },

          async signAndSendTransactions(params) {
            const results: string[] = [];
            for (const tx of params.transactions) {
              const { transaction } = window.hotNear
                ? await window.hotNear.signAndSendTransaction(tx)
                : HOT.request("near:signAndSendTransaction", tx);
              results.push(transaction);
            }

            return results as any[];
          },

          async verifyOwner() {
            throw Error("HOT:verifyOwner is deprecated, use signMessage method with implementation NEP0413 Standard");
          },
        };
      },
    };
  };
}
