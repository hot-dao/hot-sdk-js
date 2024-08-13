import { FC, useCallback, useMemo } from "react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet, ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

// ALL MAGIC THERE!!
import { HotWalletAdapter } from "@hot-wallet/sdk/adapter/solana";

export const ExampleSolana: FC = () => {
  const wallets = useMemo(() => [new HotWalletAdapter()], []);
  const solanaRPC = "https://api.mainnet-beta.solana.com";

  return (
    <ConnectionProvider endpoint={solanaRPC}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>
          <div className="view">
            <p>Solana Example</p>
            <WalletMultiButton style={{ width: "100%" }} />
            <SendSOLToRandomAddress />
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export const SendSOLToRandomAddress: FC = () => {
  const { connection } = useConnection();
  const { publicKey, signMessage, sendTransaction } = useWallet();

  const onClick = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError();
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: Keypair.generate().publicKey,
        lamports: Math.round(0.001 * LAMPORTS_PER_SOL),
      })
    );

    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext();

    const signature = await sendTransaction(transaction, connection, { minContextSlot });
    await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
  }, [publicKey, sendTransaction, connection]);

  return (
    <>
      <button onClick={onClick} disabled={!publicKey}>
        Send SOL to a random address!
      </button>
      <button
        disabled={!publicKey}
        onClick={async () => {
          const sig = await signMessage?.(Buffer.from("Hello world", "utf8"));
          if (sig) alert(Buffer.from(sig).toString("hex"));
        }}
      >
        Sign message
      </button>
    </>
  );
};
