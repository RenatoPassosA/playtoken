import { expect } from "chai";
import hre from "hardhat";

const { ethers } = await hre.network.create();

describe("PlayToken", function () {
  async function deployToken() {
    const signers = await ethers.getSigners();
    const [owner, alice, bob] = signers;

    const Token = await ethers.getContractFactory("PlayToken");
    const token = await Token.deploy(ethers.parseUnits("1000000", 18));

    return { token, owner, alice, bob };
  }

  describe("deployment", function () {
    it("deve atribuir o supply inicial ao owner", async function () {
      const { token, owner } = await deployToken();

      const totalSupply = ethers.parseUnits("1000000", 18);

      expect(await token.totalSupply()).to.equal(totalSupply);
      expect(await token.balanceOf(owner.address)).to.equal(totalSupply);
    });
  });

  describe("transfer", function () {
    it("deve transferir tokens corretamente", async function () {
      const { token, alice } = await deployToken();

      await token.transfer(alice.address, ethers.parseUnits("100", 18));

      expect(await token.balanceOf(alice.address)).to.equal(
        ethers.parseUnits("100", 18)
      );
    });
  });

  describe("allowance", function () {
    it("deve respeitar approve e transferFrom", async function () {
      const { token, owner, alice, bob } = await deployToken();

      await token.approve(alice.address, ethers.parseUnits("50", 18));

      await token
        .connect(alice)
        //@ts-ignore
        .transferFrom(owner.address, bob.address, ethers.parseUnits("50", 18));

      expect(await token.balanceOf(bob.address)).to.equal(
        ethers.parseUnits("50", 18)
      );
    });
  });

  describe("pause", function () {
    it("deve bloquear transferências quando pausado", async function () {
      const { token, alice } = await deployToken();

      await token.pause();

      await expect(
        token.transfer(alice.address, ethers.parseUnits("1", 18))
      ).to.be.revertedWithCustomError(token, "EnforcedPause");
    });
  });

  describe("mint", function () {
    it("apenas o owner pode mintar", async function () {
      const { token, alice } = await deployToken();

      await expect(
        //@ts-ignore
        token.connect(alice).mint(alice.address, ethers.parseUnits("10", 18))
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("deve falhar ao mintar para endereço zero", async function () {
      const { token } = await deployToken();

      await expect(
        token.mint(ethers.ZeroAddress, ethers.parseUnits("10", 18))
      ).to.be.revertedWithCustomError(token, "ZeroAddress");
    });
  });

  describe("events", function () {
    describe("transfer", function () {
      it("deve emitir evento Transfer ao transferir tokens", async function () {
        const { token, owner, alice } = await deployToken();
        const amount = ethers.parseUnits("100", 18);

        await expect(token.transfer(alice.address, amount))
          .to.emit(token, "Transfer")
          .withArgs(owner.address, alice.address, amount);
      });
    });

    describe("allowance", function () {
      it("deve emitir evento Approval ao aprovar allowance", async function () {
        const { token, owner, alice } = await deployToken();
        const amount = ethers.parseUnits("50", 18);

        await expect(token.approve(alice.address, amount))
          .to.emit(token, "Approval")
          .withArgs(owner.address, alice.address, amount);
      });

      it("deve emitir evento Transfer ao executar transferFrom", async function () {
        const { token, owner, alice, bob } = await deployToken();
        const amount = ethers.parseUnits("50", 18);

        await token.approve(alice.address, amount);

        await expect(
          //@ts-ignore
          token.connect(alice).transferFrom(owner.address, bob.address, amount)
        )
          .to.emit(token, "Transfer")
          .withArgs(owner.address, bob.address, amount);
      });
    });

    describe("mint", function () {
      it("deve emitir evento Transfer ao mintar", async function () {
        const { token, alice } = await deployToken();
        const amount = ethers.parseUnits("10", 18);

        await expect(token.mint(alice.address, amount))
          .to.emit(token, "Transfer")
          .withArgs(ethers.ZeroAddress, alice.address, amount);
      });
    });
  });
});