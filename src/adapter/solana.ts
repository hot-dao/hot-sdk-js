import {
  WalletName,
  SendTransactionOptions,
  BaseMessageSignerWalletAdapter,
  isVersionedTransaction,
  WalletConnectionError,
  WalletError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletReadyState,
  WalletSendTransactionError,
  WalletSignMessageError,
  WalletSignTransactionError,
} from "@solana/wallet-adapter-base";

import {
  PublicKey,
  Connection,
  Transaction,
  TransactionSignature,
  TransactionVersion,
  VersionedTransaction,
} from "@solana/web3.js";

import { InjectedHOT } from "./interactor";

export const HotWalletName = "HOT" as WalletName<"HOT">;

if (InjectedHOT.isInjected) {
  localStorage.setItem("walletName", `"HOT"`);
}

export class HotWalletAdapter extends BaseMessageSignerWalletAdapter {
  name = HotWalletName;
  url = "https://hotdao.ai";
  icon = "https://storage.herewallet.app/logo.png";
  supportedTransactionVersions: ReadonlySet<TransactionVersion> = new Set(["legacy", 0]);

  private _connecting: boolean;
  private _publicKey: PublicKey | null;
  private _readyState: WalletReadyState =
    typeof window === "undefined" || typeof document === "undefined"
      ? WalletReadyState.Unsupported
      : WalletReadyState.NotDetected;

  private hot = InjectedHOT;

  constructor() {
    super();
    this._publicKey = null;
    this._connecting = false;
    this.hot.connection.then((state) => {
      console.log({ state });
      if (!state) return;
      this._readyState = WalletReadyState.Installed;
      this.emit("readyStateChange", this._readyState);
    });
  }

  get publicKey() {
    return this._publicKey;
  }

  get connecting() {
    return this._connecting;
  }

  get readyState() {
    return this._readyState;
  }

  _parseTransaction(base64: string): Transaction | VersionedTransaction {
    const buf = Buffer.from(base64, "base64");
    try {
      return Transaction.from(buf);
    } catch {
      return VersionedTransaction.deserialize(buf);
    }
  }

  async autoConnect(): Promise<void> {
    if (this.readyState !== WalletReadyState.Installed) return;
    await this.connect();
  }

  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) return;
      if (this.readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();

      this._connecting = true;
      const { publicKey } = await this.hot.request("solana:connect", {});
      if (!publicKey) throw new WalletConnectionError();

      this._publicKey = new PublicKey(publicKey);
      this.emit("connect", this._publicKey);
    } catch (error: any) {
      console.error(error);
      this.emit("error", error);
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    this._publicKey = null;
    this.emit("disconnect");
  }

  async sendTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T,
    connection: Connection,
    options: SendTransactionOptions = {}
  ): Promise<TransactionSignature> {
    try {
      if (!this._publicKey) throw new WalletNotConnectedError();

      try {
        const { signers, ...sendOptions } = options;
        if (isVersionedTransaction(transaction)) {
          signers?.length && transaction.sign(signers);
        } else {
          transaction = (await this.prepareTransaction(transaction, connection, sendOptions)) as T;
          signers?.length && (transaction as Transaction).partialSign(...signers);
        }

        sendOptions.preflightCommitment = sendOptions.preflightCommitment || connection.commitment;
        const { signature } = await this.hot.request("solana:signAndSendTransaction", {
          transaction: transaction.serialize({ requireAllSignatures: false }).toString("base64"),
          sendOptions,
        });

        return signature;
      } catch (error: any) {
        if (error instanceof WalletError) throw error;
        throw new WalletSendTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit("error", error);
      throw error;
    }
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
    try {
      if (!this._publicKey) throw new WalletNotConnectedError();

      try {
        const tx = transaction.serialize().toString("base64");
        const result = await this.hot.request("solana:signTransactions", { transactions: [tx] });
        return this._parseTransaction(result.transactions[0]) as any;
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit("error", error);
      throw error;
    }
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
    try {
      if (!this._publicKey) throw new WalletNotConnectedError();

      try {
        const tx = transactions.map((t) => t.serialize().toString("base64"));
        const response = await this.hot.request("solana:signTransactions", { transactions: tx });
        return response.transactions.map<any>(this._parseTransaction);
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit("error", error);
      throw error;
    }
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    try {
      if (!this._publicKey) throw new WalletNotConnectedError();
      try {
        const { signature } = await this.hot.request("solana:signMessage", {
          message: Buffer.from(message).toString("base64"),
        });

        return Buffer.from(signature, "base64");
      } catch (error: any) {
        throw new WalletSignMessageError(error?.message, error);
      }
    } catch (error: any) {
      this.emit("error", error);
      throw error;
    }
  }
}
