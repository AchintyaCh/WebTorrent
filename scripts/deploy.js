//deploy.js
//deploy.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Correct balance check for ethers v6
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Deployer balance: ${hre.ethers.formatEther(balance)} ETH`);

  const P2PFileMarketplace = await hre.ethers.getContractFactory(
    "P2PFileMarketplace"
  );
  const p2PFileMarketplace = await P2PFileMarketplace.deploy();

  await p2PFileMarketplace.waitForDeployment();

  const contractAddress = await p2PFileMarketplace.getAddress();
  console.log("P2PFileMarketplace deployed to:", contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
