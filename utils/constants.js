// Arbitrum Sepolia addresses - these will need to be updated with real addresses once available
export const DEX_ROUTER_ADDRESS = "0xD7f655E006F1aE864bdababC8fC978C3e5B38b7e"; // Example placeholder
export const DEX_FACTORY_ADDRESS = "0xad4c763Bc17F9893fDd0BAa2Ce5e4F20D3B89d3f"; // Example placeholder
export const WETH_ADDRESS = "0xc336C7309D8a2B0431Edc0f5D40a5E529437FE5a"; // Example placeholder

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
