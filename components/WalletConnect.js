import { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function WalletConnect({ onConnect }) {
  const [account, setAccount] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();

        // Check if on Arbitrum Sepolia (chainId: 421614)
        if (network.chainId !== 421614) {
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x66eee" }], // 421614 in hex
            });
          } catch (switchError) {
            // This error code indicates the chain hasn't been added to MetaMask
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0x66eee", // 421614 in hex
                    chainName: "Arbitrum Sepolia",
                    nativeCurrency: {
                      name: "ETH",
                      symbol: "ETH",
                      decimals: 18,
                    },
                    rpcUrls: ["https://sepolia-rollup.arbitrum.io/rpc"],
                    blockExplorerUrls: ["https://sepolia.arbiscan.io/"],
                  },
                ],
              });
            } else {
              throw switchError;
            }
          }
        }

        const signer = provider.getSigner();
        setAccount(accounts[0]);
        setIsConnected(true);
        onConnect(signer, accounts[0]);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("Please install MetaMask or another Ethereum wallet");
    }
  };

  // Handle account and chain changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", connectWallet);
      window.ethereum.on("chainChanged", () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", connectWallet);
        window.ethereum.removeListener("chainChanged", () =>
          window.location.reload()
        );
      }
    };
  }, []);

  return (
    <div className="mb-6">
      {!isConnected ? (
        <button
          onClick={connectWallet}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <p className="text-gray-700">
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </p>
        </div>
      )}
    </div>
  );
}
