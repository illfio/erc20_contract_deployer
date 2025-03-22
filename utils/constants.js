import { ethers } from "ethers";
export const DEX_ROUTER_ADDRESS = "0xd7f655e006f1ae864bdababc8fc978c3e5b38b7e";
export const DEX_FACTORY_ADDRESS = "0xad4c763bc17f9893fdd0baa2ce5e4f20d3b89d3f";
export const WETH_ADDRESS = "0xc336c7309d8a2b0431edc0f5d40a5e529437fe5a";

export const CHAIN_ID = 421614; // Arbitrum Sepolia
export const EXPLORER_URL = "https://sepolia.arbiscan.io";

// Helper function to create deadline timestamp
export const getDeadlineTimestamp = (minutes = 20) => {
  return Math.floor(Date.now() / 1000) + 60 * minutes;
};

// Error messages
export const ERROR_MESSAGES = {
  INSUFFICIENT_BALANCE: "Insufficient balance",
  SLIPPAGE_TOO_HIGH: "Slippage too high",
  NO_LIQUIDITY: "No liquidity available",
  TX_FAILED: "Transaction failed",
  APPROVAL_FAILED: "Approval failed",
  WALLET_CONNECTION: "Unable to connect wallet",
  WRONG_NETWORK: "Please switch to Arbitrum Sepolia",
};

// UI Constants
export const SLIPPAGE_OPTIONS = [0.5, 1, 2, 5];
export const DEFAULT_SLIPPAGE = 0.5;
