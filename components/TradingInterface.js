import { useState } from "react";
import TokenSwap from "./TokenSwap";
import LiquidityProvider from "./LiquidityProvider";

export default function TradingInterface({
  signer,
  tokenAddress,
  tokenDecimals,
}) {
  const [activeTab, setActiveTab] = useState("swap"); // 'swap' or 'liquidity'

  if (!tokenAddress) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg text-center">
        <p className="text-gray-600">
          Please deploy a token first to access trading features.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Token Trading</h2>

      <div className="flex border-b mb-4">
        <button
          className={`py-2 px-4 ${
            activeTab === "swap"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("swap")}
        >
          Swap
        </button>
        <button
          className={`py-2 px-4 ${
            activeTab === "liquidity"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("liquidity")}
        >
          Liquidity
        </button>
      </div>

      {activeTab === "swap" ? (
        <TokenSwap
          signer={signer}
          tokenAddress={tokenAddress}
          tokenDecimals={tokenDecimals}
        />
      ) : (
        <LiquidityProvider
          signer={signer}
          tokenAddress={tokenAddress}
          tokenDecimals={tokenDecimals}
        />
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-bold text-blue-800 mb-2">Important Note</h3>
        <p className="text-blue-700 text-sm">
          To make your token tradeable, you need to first create a trading pair
          and add liquidity. This establishes the initial price of your token
          relative to ETH and enables others to trade it.
        </p>
      </div>
    </div>
  );
}
