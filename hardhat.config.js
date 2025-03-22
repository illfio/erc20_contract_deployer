require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY =
  process.env.PRIVATE_KEY ||
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const ARBITRUM_SEPOLIA_RPC_URL =
  process.env.ARBITRUM_SEPOLIA_RPC_URL ||
  "https://sepolia-rollup.arbitrum.io/rpc";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    arbitrumSepolia: {
      url: ARBITRUM_SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
  },
  paths: {
    artifacts: "./artifacts",
  },
};
