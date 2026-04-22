import hre from "hardhat";

const { ethers } = await hre.network.connect("localhost");

async function main() {
  const initialSupply = ethers.parseUnits("1000000", 18);

  const Token = await ethers.getContractFactory("PlayToken");
  const token = await Token.deploy(initialSupply);
  await token.waitForDeployment();

  console.log("PlayToken deployed to:", await token.getAddress());
  console.log("Initial supply:", (await token.totalSupply()).toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});