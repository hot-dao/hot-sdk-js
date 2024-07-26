import { FC, useMemo, useCallback } from "react";
import { WalletNotConnectedError, WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useConnection, useWallet, ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

// ALL MAGIC THERE!!
import { HotWalletAdapter } from "../../src/adapter/solana";

export const ExampleSolana: FC = () => {
  const network = WalletAdapterNetwork.Mainnet;
  const wallets = useMemo(() => [new HotWalletAdapter()], [network]);
  const solanaRPC = "https://solana-mainnet.rpc.extrnode.com/2fccd8d8-c4d6-4a88-abf9-69977700cb44";

  return (
    <ConnectionProvider endpoint={solanaRPC}>
      <WalletProvider wallets={wallets} autoConnect>
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
  const { publicKey, sendTransaction } = useWallet();

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
    <button onClick={onClick} disabled={!publicKey}>
      Send SOL to a random address!
    </button>
  );
};
