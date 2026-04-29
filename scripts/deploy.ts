
import { network } from "hardhat";

const { ethers } = await network.create();

async function main() {
  const initialSupply = ethers.parseUnits("1000000", 18);

  const token = await ethers.deployContract("PlayToken", [initialSupply]);
  await token.waitForDeployment();

  console.log("PlayToken deployed to:", await token.getAddress());
  console.log("Initial supply:", (await token.totalSupply()).toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});