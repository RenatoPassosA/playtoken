import hre from "hardhat";

const { ethers } = await hre.network.connect("localhost");

async function printReceiptAndLogs(
  label: string,
  receipt: any,
  token: any
) {
  console.log(`\n== ${label} receipt ==`);
  console.log("block:", receipt.blockNumber);
  console.log("gas used:", receipt.gasUsed.toString());
  console.log("status:", receipt.status);

  console.log(`== ${label} logs ==`);
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== (await token.getAddress()).toLowerCase()) {
      continue;
    }

    try {
      const parsed = token.interface.parseLog(log);
      if (!parsed) continue;

      console.log("event:", parsed.name);

      if (parsed.name === "Transfer") {
        console.log("  from:", parsed.args.from);
        console.log("  to:", parsed.args.to);
        console.log("  value:", parsed.args.value.toString());
      }

      if (parsed.name === "Approval") {
        console.log("  owner:", parsed.args.owner);
        console.log("  spender:", parsed.args.spender);
        console.log("  value:", parsed.args.value.toString());
      }
    } catch {
      // ignora logs que não pertençam à interface do token
    }
  }
}

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const [owner, alice, bob] = await ethers.getSigners();

  const token = await ethers.getContractAt("PlayToken", contractAddress);

  console.log("Contract:", contractAddress);
  console.log("Owner:", owner.address);
  console.log("Alice:", alice.address);
  console.log("Bob:", bob.address);

  console.log("\n== Initial State ==");
  console.log("totalSupply:", (await token.totalSupply()).toString());
  console.log("owner balance:", (await token.balanceOf(owner.address)).toString());
  console.log("alice balance:", (await token.balanceOf(alice.address)).toString());
  console.log("bob balance:", (await token.balanceOf(bob.address)).toString());

  console.log("\n== Transfer owner -> alice ==");
  const transferAmount = ethers.parseUnits("100", 18);
  const tx1 = await token.transfer(alice.address, transferAmount);
  const receipt1 = await tx1.wait();

  console.log("tx hash:", tx1.hash);
  await printReceiptAndLogs("transfer", receipt1, token);

  console.log("owner balance:", (await token.balanceOf(owner.address)).toString());
  console.log("alice balance:", (await token.balanceOf(alice.address)).toString());

  console.log("\n== Approve alice ==");
  const approveAmount = ethers.parseUnits("50", 18);
  const tx2 = await token.approve(alice.address, approveAmount);
  const receipt2 = await tx2.wait();

  console.log("tx hash:", tx2.hash);
  await printReceiptAndLogs("approve", receipt2, token);

  console.log(
    "allowance owner -> alice:",
    (await token.allowance(owner.address, alice.address)).toString()
  );

  console.log("\n== Alice transferFrom owner -> bob ==");
  const tx3 = await token
    .connect(alice)
     // @ts-ignore
    .transferFrom(owner.address, bob.address, approveAmount);
  const receipt3 = await tx3.wait();

  console.log("tx hash:", tx3.hash);
  await printReceiptAndLogs("transferFrom", receipt3, token);

  console.log("owner balance:", (await token.balanceOf(owner.address)).toString());
  console.log("alice balance:", (await token.balanceOf(alice.address)).toString());
  console.log("bob balance:", (await token.balanceOf(bob.address)).toString());
  console.log(
    "remaining allowance owner -> alice:",
    (await token.allowance(owner.address, alice.address)).toString()
  );

  console.log("\n== Done ==");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});