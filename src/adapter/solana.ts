import {
  WalletName,
  SendTransactionOptions,
  BaseMessageSignerWalletAdapter,
  isVersionedTransaction,
  WalletConnectionError,
  WalletError,
  WalletNotConnectedError,
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

import HOT, { wait } from "../hot";

export const HotWalletName = "HOT" as WalletName<"HOT">;

if (HOT.isInjected) {
  localStorage.setItem("walletName", `"HOT"`);
}

export class HotWalletAdapter extends BaseMessageSignerWalletAdapter {
  name = HotWalletName;
  url = "https://hot-labs.org";
  icon = "https://storage.herewallet.app/logo.png";
  supportedTransactionVersions: ReadonlySet<TransactionVersion> = new Set(["legacy", 0]);

  private _connecting: boolean;
  private _publicKey: PublicKey | null = null;
  private _readyState = WalletReadyState.NotDetected;

  constructor() {
    super();
    this._publicKey = null;
    this._connecting = false;
    wait(100).then(() => {
      this.emit("readyStateChange", WalletReadyState.Installed);
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

  _getLocalAccount() {
    try {
      const publicKey = localStorage.getItem("hot:solana-account");
      if (publicKey == null) return null;
      return new PublicKey(publicKey);
    } catch {
      return null;
    }
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
    const account = this._getLocalAccount();
    if (account) return await this.connect();
    if (HOT.isInjected) return await this.connect();
  }

  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) return;

      const account = this._getLocalAccount();
      if (account && HOT.isInjected === false) {
        this._publicKey = account;
        this.emit("connect", account);
        return;
      }

      this._connecting = true;
      const { publicKey } = await HOT.request("solana:connect", {});
      if (!publicKey) throw new WalletConnectionError();

      this._publicKey = new PublicKey(publicKey);
      localStorage.setItem("hot:solana-account", this._publicKey.toString());
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
    localStorage.removeItem("hot:solana-account");
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
        const { signature } = await HOT.request("solana:signAndSendTransaction", {
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
        const result = await HOT.request("solana:signTransactions", { transactions: [tx] });
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
        const response = await HOT.request("solana:signTransactions", { transactions: tx });
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
        const { signature } = await HOT.request("solana:signMessage", {
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
