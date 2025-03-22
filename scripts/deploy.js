// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Sample token parameters - these won't be used from frontend
  const name = "Test Token";
  const symbol = "TTK";
  const initialSupply = 1000000;
  const decimals = 18;

  const Token = await hre.ethers.getContractFactory("Token");
  const token = await Token.deploy(
    name,
    symbol,
    initialSupply,
    decimals,
    deployer.address
  );

  await token.deployed();

  console.log("Token deployed to:", token.address);
  console.log({
    name: await token.name(),
    symbol: await token.symbol(),
    totalSupply: (await token.totalSupply()).toString(),
    decimals: await token.decimals(),
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
