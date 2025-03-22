import { useState, useEffect } from "react";
import { ethers } from "ethers";
import IUniswapV2Router02ABI from "../abis/IUniswapV2Router02.json";
import IERC20ABI from "../abis/IERC20.json";
import {
  DEX_ROUTER_ADDRESS,
  WETH_ADDRESS,
  getDeadlineTimestamp,
  ERROR_MESSAGES,
  SLIPPAGE_OPTIONS,
  DEFAULT_SLIPPAGE,
} from "../utils/constants";

export default function TokenSwap({
  signer,
  tokenAddress,
  tokenDecimals = 18,
}) {
  const [amount, setAmount] = useState("");
  const [swapType, setSwapType] = useState("tokenToEth"); // 'tokenToEth' or 'ethToToken'
  const [isSwapping, setIsSwapping] = useState(false);
  const [tokenBalance, setTokenBalance] = useState("0");
  const [ethBalance, setEthBalance] = useState("0");
  const [isApproved, setIsApproved] = useState(false);
  const [isCheckingApproval, setIsCheckingApproval] = useState(false);
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE);
  const [errorMessage, setErrorMessage] = useState("");

  // Get balances
  useEffect(() => {
    if (!signer || !tokenAddress) return;

    const getBalances = async () => {
      try {
        // Get ETH balance
        const address = await signer.getAddress();
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

        // Check if router is approved to spend tokens
        checkAllowance();
      } catch (error) {
        console.error("Error fetching balances:", error);
      }
    };

    getBalances();
    // Set up an interval to refresh balances
    const interval = setInterval(getBalances, 10000);
    return () => clearInterval(interval);
  }, [signer, tokenAddress, tokenDecimals]);

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

  const swapTokensForEth = async () => {
    if (!signer || !tokenAddress || !amount) return;

    try {
      setIsSwapping(true);
      setErrorMessage("");

      const amountIn = ethers.utils.parseUnits(amount, tokenDecimals);
      const router = new ethers.Contract(
        DEX_ROUTER_ADDRESS,
        IUniswapV2Router02ABI,
        signer
      );

      // Calculate minimum output based on slippage
      const path = [tokenAddress, WETH_ADDRESS];
      const deadline = getDeadlineTimestamp();
      const userAddress = await signer.getAddress();

      // Calculate minAmountOut with slippage tolerance
      // In production, you'd want to query the current price and apply slippage
      const minAmountOut = 0; // This is simplified - in a real app you'd calculate this

      const tx = await router.swapExactTokensForETH(
        amountIn,
        minAmountOut,
        path,
        userAddress,
        deadline
      );

      await tx.wait();
      setAmount("");

      // Update balances
      const ethBal = await signer.provider.getBalance(userAddress);
      setEthBalance(ethers.utils.formatEther(ethBal));

      const tokenContract = new ethers.Contract(
        tokenAddress,
        IERC20ABI,
        signer
      );
      const tokenBal = await tokenContract.balanceOf(userAddress);
      setTokenBalance(ethers.utils.formatUnits(tokenBal, tokenDecimals));
    } catch (error) {
      console.error("Error swapping tokens for ETH:", error);
      setErrorMessage(ERROR_MESSAGES.TX_FAILED);
    } finally {
      setIsSwapping(false);
    }
  };

  const swapEthForTokens = async () => {
    if (!signer || !tokenAddress || !amount) return;

    try {
      setIsSwapping(true);
      setErrorMessage("");

      const amountIn = ethers.utils.parseEther(amount);
      const router = new ethers.Contract(
        DEX_ROUTER_ADDRESS,
        IUniswapV2Router02ABI,
        signer
      );

      const path = [WETH_ADDRESS, tokenAddress];
      const deadline = getDeadlineTimestamp();
      const userAddress = await signer.getAddress();

      // Calculate minAmountOut with slippage tolerance (simplified)
      const minAmountOut = 0; // This is simplified - in a real app you'd calculate this

      const tx = await router.swapExactETHForTokens(
        minAmountOut,
        path,
        userAddress,
        deadline,
        { value: amountIn }
      );

      await tx.wait();
      setAmount("");

      // Update balances
      const ethBal = await signer.provider.getBalance(userAddress);
      setEthBalance(ethers.utils.formatEther(ethBal));

      const tokenContract = new ethers.Contract(
        tokenAddress,
        IERC20ABI,
        signer
      );
      const tokenBal = await tokenContract.balanceOf(userAddress);
      setTokenBalance(ethers.utils.formatUnits(tokenBal, tokenDecimals));
    } catch (error) {
      console.error("Error swapping ETH for tokens:", error);
      setErrorMessage(ERROR_MESSAGES.TX_FAILED);
    } finally {
      setIsSwapping(false);
    }
  };

  const handleSwap = async () => {
    if (swapType === "tokenToEth") {
      await swapTokensForEth();
    } else {
      await swapEthForTokens();
    }
  };

  const toggleSwapType = () => {
    setSwapType(swapType === "tokenToEth" ? "ethToToken" : "tokenToEth");
    setAmount("");
    setErrorMessage("");
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Swap Tokens</h2>

      <div className="flex justify-between mb-4">
        <div className="font-medium">
          {swapType === "tokenToEth" ? "Token Balance:" : "ETH Balance:"}
        </div>
        <div>
          {swapType === "tokenToEth"
            ? `${parseFloat(tokenBalance).toFixed(4)}`
            : `${parseFloat(ethBalance).toFixed(4)} ETH`}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Amount</label>
        <div className="flex">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Enter ${
              swapType === "tokenToEth" ? "token" : "ETH"
            } amount`}
            className="flex-grow px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() =>
              setAmount(swapType === "tokenToEth" ? tokenBalance : ethBalance)
            }
            className="bg-gray-200 px-2 py-1 rounded-r-md border-t border-r border-b border-gray-300"
          >
            MAX
          </button>
        </div>
      </div>

      <div className="flex justify-center mb-4">
        <button
          onClick={toggleSwapType}
          className="bg-gray-200 p-2 rounded-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
            />
          </svg>
        </button>
      </div>

      <div className="flex justify-between mb-4">
        <div className="font-medium">
          {swapType === "tokenToEth" ? "ETH to Receive:" : "Tokens to Receive:"}
        </div>
        <div>
          {/* This would be calculated based on price in a real app */}
          {amount ? "Calculating..." : "0"}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Slippage Tolerance</label>
        <div className="flex space-x-2">
          {SLIPPAGE_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => setSlippage(option)}
              className={`px-3 py-1 rounded ${
                slippage === option ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {option}%
            </button>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="text-red-500 mb-4 p-2 bg-red-50 rounded">
          {errorMessage}
        </div>
      )}

      {swapType === "tokenToEth" && !isApproved ? (
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
          onClick={handleSwap}
          disabled={
            isSwapping || !amount || (swapType === "tokenToEth" && !isApproved)
          }
          className={`w-full py-2 px-4 rounded-md ${
            isSwapping || !amount || (swapType === "tokenToEth" && !isApproved)
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isSwapping
            ? "Swapping..."
            : `Swap ${
                swapType === "tokenToEth" ? "Tokens for ETH" : "ETH for Tokens"
              }`}
        </button>
      )}
    </div>
  );
}
