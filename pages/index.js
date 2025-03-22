import { useState } from "react";
import Head from "next/head";
import WalletConnect from "../components/WalletConnect";
import TokenForm from "../components/TokenForm";
import DeploymentStatus from "../components/DeploymentStatus";
import TradingInterface from "../components/TradingInterface";

export default function Home() {
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState("");
  const [deployStatus, setDeployStatus] = useState("idle"); // idle, pending, success, error
  const [tokenData, setTokenData] = useState(null);

  const handleWalletConnect = (signerObj, accountAddress) => {
    setSigner(signerObj);
    setAccount(accountAddress);
  };

  const handleDeployStart = () => {
    setDeployStatus("pending");
  };

  const handleDeploySuccess = (data) => {
    setTokenData(data);
    setDeployStatus("success");
  };

  const handleDeployError = (errorMsg) => {
    setTokenData(errorMsg);
    setDeployStatus("error");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>ERC-20 Token Creator | Arbitrum Sepolia</title>
        <meta
          name="description"
          content="Create and deploy ERC-20 tokens on Arbitrum Sepolia testnet"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            ERC-20 Token Creator | Arbitrum Sepolia
          </h1>

          <WalletConnect onConnect={handleWalletConnect} />

          {signer ? (
            <>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Token Details
              </h2>
              <TokenForm
                signer={signer}
                account={account}
                onDeployStart={handleDeployStart}
                onDeploySuccess={handleDeploySuccess}
                onDeployError={handleDeployError}
              />
            </>
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-md">
              <p className="text-gray-600">
                Please connect your wallet to create a token
              </p>
            </div>
          )}

          <DeploymentStatus status={deployStatus} tokenData={tokenData} />
        </div>

        {deployStatus === "success" && tokenData && (
          <div className="mt-8">
            <TradingInterface
              signer={signer}
              tokenAddress={tokenData.address}
              tokenDecimals={tokenData.decimals}
            />
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            About This App
          </h2>
          <p className="text-gray-600 mb-4">
            This application allows you to easily create and deploy your own
            ERC-20 tokens on the Arbitrum Sepolia testnet. The created tokens
            follow the standard ERC-20 specification and are compatible with all
            ERC-20 supporting wallets and applications.
          </p>
          <p className="text-gray-600">
            To get started, connect your wallet, fill in your token's details,
            and click "Create Token". Make sure you have some testnet ETH to pay
            for the transaction.
          </p>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-6 mt-8 text-center text-gray-500">
        <p>Built with Next.js and Ethers.js</p>
      </footer>
    </div>
  );
}
