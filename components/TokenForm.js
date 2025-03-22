import { useState } from "react";
import { ethers } from "ethers";
import TokenABI from "../artifacts/contracts/Token.sol/Token.json";

export default function TokenForm({
  signer,
  account,
  onDeployStart,
  onDeploySuccess,
  onDeployError,
}) {
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenSupply, setTokenSupply] = useState("");
  const [tokenDecimals, setTokenDecimals] = useState("18");
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = async (e) => {
    e.preventDefault();

    if (!tokenName || !tokenSymbol || !tokenSupply) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setIsDeploying(true);
      onDeployStart();

      // Create contract factory
      const factory = new ethers.ContractFactory(
        TokenABI.abi,
        TokenABI.bytecode,
        signer
      );

      // Convert supply to number
      const supply = parseInt(tokenSupply);
      const decimals = parseInt(tokenDecimals);

      // Deploy contract
      const contract = await factory.deploy(
        tokenName,
        tokenSymbol,
        supply,
        decimals,
        account
      );

      // Wait for deployment confirmation
      const receipt = await contract.deployTransaction.wait();

      onDeploySuccess({
        address: contract.address,
        name: tokenName,
        symbol: tokenSymbol,
        supply: tokenSupply,
        decimals: tokenDecimals,
        txHash: receipt.transactionHash,
      });
    } catch (error) {
      console.error("Deployment error:", error);
      onDeployError(error.message || "An error occurred during deployment");
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <form onSubmit={handleDeploy} className="space-y-4 mb-6">
      <div>
        <label className="block text-gray-700 mb-2">Token Name *</label>
        <input
          type="text"
          value={tokenName}
          onChange={(e) => setTokenName(e.target.value)}
          placeholder="e.g., My Token"
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2">Token Symbol *</label>
        <input
          type="text"
          value={tokenSymbol}
          onChange={(e) => setTokenSymbol(e.target.value)}
          placeholder="e.g., MTK"
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2">Initial Supply *</label>
        <input
          type="number"
          value={tokenSupply}
          onChange={(e) => setTokenSupply(e.target.value)}
          placeholder="e.g., 1000000"
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2">Decimals</label>
        <input
          type="number"
          value={tokenDecimals}
          onChange={(e) => setTokenDecimals(e.target.value)}
          min="0"
          max="18"
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">Default: 18 (recommended)</p>
      </div>

      <button
        type="submit"
        disabled={isDeploying || !signer}
        className={`w-full py-2 px-4 rounded-md ${
          isDeploying || !signer
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {isDeploying ? "Deploying..." : "Create Token"}
      </button>
    </form>
  );
}
