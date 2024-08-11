import {
  http,
  createConfig,
  WagmiProvider,
  useConnect,
  useAccount,
  useSendTransaction,
  useSwitchChain,
  useReconnect,
} from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { injected } from "wagmi/connectors";
import { base, bsc } from "wagmi/chains";
import { useEffect } from "react";
import { parseEther } from "viem";

// ALL MAGIC THERE!!
import "@hot-wallet/sdk/adapter/evm";

export const config = createConfig({
  chains: [base, bsc],
  connectors: [injected()], // IN IFRAME MODE HOT available in window.ethereum
  transports: {
    [base.id]: http(),
    [bsc.id]: http(),
  },
});

const ConnectWallet = () => {
  const { connect } = useConnect();
  const { address, chainId, isConnected } = useAccount();
  const { sendTransaction } = useSendTransaction();
  const { switchChain } = useSwitchChain();
  const { reconnect } = useReconnect();

  useEffect(() => {
    reconnect();
  }, []);

  if (isConnected)
    return (
      <>
        <button style={{ width: 300, textOverflow: "ellipsis", overflow: "hidden" }}>
          {chainId}:{address}
        </button>
        <button onClick={() => sendTransaction({ to: address, value: parseEther("0.000001") })}>
          Send transaction
        </button>

        <button onClick={() => switchChain({ chainId: 56 })}>Change network</button>
      </>
    );

  return <button onClick={() => connect({ connector: injected() })}>Connect EVM wallet</button>;
};

const queryClient = new QueryClient();
export const ExampleEVM = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="view">
          <p>EVM Example</p>
          <ConnectWallet />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
