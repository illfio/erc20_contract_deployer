import { useState, useEffect } from "react";
import { ethers } from "ethers";
import IUniswapV2Router02ABI from "../abis/IUniswapV2Router02.json";
import IUniswapV2FactoryABI from "../abis/IUniswapV2Factory.json";
import IERC20ABI from "../abis/IERC20.json";
import {
  DEX_ROUTER_ADDRESS,
  DEX_FACTORY_ADDRESS,
  WETH_ADDRESS,
  getDeadlineTimestamp,
  ERROR_MESSAGES,
} from "../utils/constants";

export default function LiquidityProvider({
  signer,
  tokenAddress,
  tokenDecimals = 18,
}) {
  const [tokenAmount, setTokenAmount] = useState("");
  const [ethAmount, setEthAmount] = useState("");
  const [isAddingLiquidity, setIsAddingLiquidity] = useState(false);
  const [isCreatingPair, setIsCreatingPair] = useState(false);
  const [tokenBalance, setTokenBalance] = useState("0");
  const [ethBalance, setEthBalance] = useState("0");
  const [isApproved, setIsApproved] = useState(false);
  const [isCheckingApproval, setIsCheckingApproval] = useState(false);
  const [pairExists, setPairExists] = useState(false);
  const [isCheckingPair, setIsCheckingPair] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Check if pair exists and get balances
  useEffect(() => {
    if (!signer || !tokenAddress) return;

    const initialize = async () => {
      try {
        await checkPairExists();
        await getBalances();
        await checkAllowance();
      } catch (error) {
        console.error("Error initializing:", error);
      }
    };

    initialize();
  }, [signer, tokenAddress]);

  const getBalances = async () => {
    try {
      const address = await signer.getAddress();

      // Get ETH balance
      const ethBal = await signer.provider.getBalance(address);
      setEthBalance(ethers.utils.formatEther(ethBal));

      // Get token balance
      const tokenContract = new ethers.Contract(
        tokenAddress,
        IERC20ABI,
        signer
      );
      const tokenBal = await tokenContract.balanceOf(address);
      setTokenBalance(ethers.utils.formatUnits(tokenBal, tokenDecimals));
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };

  const checkPairExists = async () => {
    if (!signer || !tokenAddress) return;

    try {
      setIsCheckingPair(true);
      const factory = new ethers.Contract(
        DEX_FACTORY_ADDRESS,
        IUniswapV2FactoryABI,
        signer
      );
      const validTokenAddress = ethers.utils.getAddress(tokenAddress);
      const validWETHAddress = ethers.utils.getAddress(WETH_ADDRESS);
      const pairAddress = await factory.getPair(
        validTokenAddress,
        validWETHAddress
      );

      // Zero address means pair doesn't exist
      setPairExists(pairAddress !== ethers.constants.AddressZero);
    } catch (error) {
      console.error("Error checking if pair exists:", error);
      setPairExists(false);
    } finally {
      setIsCheckingPair(false);
    }
  };

  const createPair = async () => {
    if (!signer || !tokenAddress) return;

    try {
      setIsCreatingPair(true);
      setErrorMessage("");

      console.log(
        "Creating pair between token and WETH:",
        tokenAddress,
        WETH_ADDRESS
      );
      console.log("Using factory at:", DEX_FACTORY_ADDRESS);

      const factory = new ethers.Contract(
        DEX_FACTORY_ADDRESS,
        IUniswapV2FactoryABI,
        signer
      );

      // Skip gas estimation and use a fixed gas limit
      const tx = await factory.createPair(tokenAddress, WETH_ADDRESS, {
        gasLimit: 3000000, // Higher fixed gas limit for pair creation
      });

      console.log("Create pair transaction sent:", tx.hash);
      alert("Transaction sent to wallet. Please confirm in MetaMask.");

      const receipt = await tx.wait();
      console.log("Pair created in block:", receipt.blockNumber);

      setPairExists(true);
    } catch (error) {
      console.error("Error creating pair:", error);
      setErrorMessage(
        "Failed to create pair: " +
          (error.reason || error.message || error).toString().slice(0, 100)
      );

      // Check if pair already exists (common error)
      if (error.message?.includes("PAIR_EXISTS")) {
        setErrorMessage(
          "Pair already exists! You can proceed with adding liquidity."
        );
        setPairExists(true);
      }
    } finally {
      setIsCreatingPair(false);
    }
  };

  const checkAllowance = async () => {
    if (!signer || !tokenAddress) return;

    try {
      setIsCheckingApproval(true);
      const address = await signer.getAddress();
      const tokenContract = new ethers.Contract(
        tokenAddress,
        IERC20ABI,
        signer
      );
      const allowance = await tokenContract.allowance(
        address,
        DEX_ROUTER_ADDRESS
      );

      // Check if allowance is greater than the amount we want to add
      setIsApproved(allowance.gt(0));
    } catch (error) {
      console.error("Error checking allowance:", error);
    } finally {
      setIsCheckingApproval(false);
    }
  };

  const approveRouter = async () => {
    if (!signer || !tokenAddress) return;

    try {
      setIsCheckingApproval(true);
      setErrorMessage("");

      console.log("Approving router at:", DEX_ROUTER_ADDRESS);
      const tokenContract = new ethers.Contract(
        tokenAddress,
        IERC20ABI,
        signer
      );

      // Skip gas estimation and use a fixed gas limit
      const tx = await tokenContract.approve(
        DEX_ROUTER_ADDRESS,
        ethers.constants.MaxUint256,
        {
          gasLimit: 100000, // Fixed gas limit that should be sufficient
        }
      );

      console.log("Approval transaction sent:", tx.hash);
      alert("Transaction sent to wallet. Please confirm in MetaMask.");

      const receipt = await tx.wait();
      console.log("Approval confirmed in block:", receipt.blockNumber);

      setIsApproved(true);
    } catch (error) {
      console.error("Error approving router:", error);
      setErrorMessage(
        "Approval failed: " +
          (error.reason || error.message || error).toString().slice(0, 100)
      );

      // If transaction doesn't appear in wallet, suggest manual approval
      if (error.code === "TIMEOUT" || error.message?.includes("timeout")) {
        setErrorMessage(
          "Transaction was not confirmed in time. Try adding the token to MetaMask first, then approve."
        );
      }
    } finally {
      setIsCheckingApproval(false);
    }
  };

  const addLiquidity = async () => {
    if (!signer || !tokenAddress || !tokenAmount || !ethAmount) return;

    try {
      setIsAddingLiquidity(true);
      setErrorMessage("");

      const router = new ethers.Contract(
        DEX_ROUTER_ADDRESS,
        IUniswapV2Router02ABI,
        signer
      );
      const userAddress = await signer.getAddress();

      // Parse amounts
      const parsedTokenAmount = ethers.utils.parseUnits(
        tokenAmount,
        tokenDecimals
      );
      const parsedEthAmount = ethers.utils.parseEther(ethAmount);

      // Set slippage tolerance to 5%
      const minTokenAmount = parsedTokenAmount.mul(95).div(100);
      const minEthAmount = parsedEthAmount.mul(95).div(100);

      const deadline = getDeadlineTimestamp();

      const tx = await router.addLiquidityETH(
        tokenAddress,
        parsedTokenAmount,
        minTokenAmount,
        minEthAmount,
        userAddress,
        deadline,
        { value: parsedEthAmount }
      );

      await tx.wait();

      // Reset form and refresh balances
      setTokenAmount("");
      setEthAmount("");
      getBalances();
    } catch (error) {
      console.error("Error adding liquidity:", error);
      setErrorMessage("Failed to add liquidity. " + error.message);
    } finally {
      setIsAddingLiquidity(false);
    }
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Add Liquidity</h2>

      {!pairExists && !isCheckingPair && (
        <div className="mb-4 p-3 bg-yellow-50 rounded-md">
          <p className="text-yellow-700">
            Trading pair does not exist yet. Create it first to enable trading.
          </p>
          <button
            onClick={createPair}
            disabled={isCreatingPair}
            className={`mt-2 py-2 px-4 rounded-md ${
              isCreatingPair
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-yellow-600 hover:bg-yellow-700 text-white"
            }`}
          >
            {isCreatingPair ? "Creating Pair..." : "Create Trading Pair"}
          </button>
        </div>
      )}

      {isCheckingPair && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-gray-700">Checking if trading pair exists...</p>
        </div>
      )}

      {pairExists && (
        <>
          <div className="flex justify-between mb-4">
            <div className="font-medium">Token Balance:</div>
            <div>{parseFloat(tokenBalance).toFixed(4)}</div>
          </div>

          <div className="flex justify-between mb-4">
            <div className="font-medium">ETH Balance:</div>
            <div>{parseFloat(ethBalance).toFixed(4)} ETH</div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Token Amount</label>
            <div className="flex">
              <input
                type="number"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                placeholder="Enter token amount"
                className="flex-grow px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setTokenAmount(tokenBalance)}
                className="bg-gray-200 px-2 py-1 rounded-r-md border-t border-r border-b border-gray-300"
              >
                MAX
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">ETH Amount</label>
            <div className="flex">
              <input
                type="number"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                placeholder="Enter ETH amount"
                className="flex-grow px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setEthAmount(ethBalance)}
                className="bg-gray-200 px-2 py-1 rounded-r-md border-t border-r border-b border-gray-300"
              >
                MAX
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="text-red-500 mb-4 p-2 bg-red-50 rounded">
              {errorMessage}
            </div>
          )}

          {!isApproved ? (
            <button
              onClick={approveRouter}
              disabled={isCheckingApproval}
              className={`w-full py-2 px-4 rounded-md ${
                isCheckingApproval
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {isCheckingApproval ? "Approving..." : "Approve Token Spending"}
            </button>
          ) : (
            <button
              onClick={addLiquidity}
              disabled={
                isAddingLiquidity || !tokenAmount || !ethAmount || !isApproved
              }
              className={`w-full py-2 px-4 rounded-md ${
                isAddingLiquidity || !tokenAmount || !ethAmount || !isApproved
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isAddingLiquidity ? "Adding Liquidity..." : "Add Liquidity"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
