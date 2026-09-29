const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("A3Treasury", function () {
  async function deploy() {
    const [owner, executor, payer, recipient, outsider] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("A3Treasury");
    const treasury = await Factory.deploy(owner.address, executor.address, 5000);
    return { treasury, owner, executor, payer, recipient, outsider };
  }

  it("starts with zero receipts and zero spend", async function () {
    const { treasury } = await deploy();
    expect(await treasury.cumulativeReceipts()).to.equal(0);
    expect(await treasury.cumulativeSpend()).to.equal(0);
  });

  it("records native-asset receipts", async function () {
    const { treasury, payer } = await deploy();
    await payer.sendTransaction({ to: await treasury.getAddress(), value: ethers.parseEther("1") });
    expect(await treasury.cumulativeReceipts()).to.equal(ethers.parseEther("1"));
  });

  it("caps spending at 50% of cumulative receipts", async function () {
    const { treasury, owner, executor, payer, recipient } = await deploy();
    await payer.sendTransaction({ to: await treasury.getAddress(), value: ethers.parseEther("1") });
    await treasury.connect(owner).setRecipient(recipient.address, true);

    await expect(
      treasury.connect(executor).spend(recipient.address, ethers.parseEther("0.6"))
    ).to.be.revertedWithCustomError(treasury, "SpendLimitExceeded");

    await treasury.connect(executor).spend(recipient.address, ethers.parseEther("0.5"));
    expect(await treasury.cumulativeSpend()).to.equal(ethers.parseEther("0.5"));
  });

  it("blocks non-allowlisted recipients", async function () {
    const { treasury, executor, payer, outsider } = await deploy();
    await payer.sendTransaction({ to: await treasury.getAddress(), value: ethers.parseEther("1") });

    await expect(
      treasury.connect(executor).spend(outsider.address, ethers.parseEther("0.1"))
    ).to.be.revertedWithCustomError(treasury, "RecipientNotAllowlisted");
  });

  it("pause blocks outbound spend", async function () {
    const { treasury, owner, executor, payer, recipient } = await deploy();
    await payer.sendTransaction({ to: await treasury.getAddress(), value: ethers.parseEther("1") });
    await treasury.connect(owner).setRecipient(recipient.address, true);
    await treasury.connect(owner).pause();

    await expect(
      treasury.connect(executor).spend(recipient.address, ethers.parseEther("0.1"))
    ).to.be.revertedWithCustomError(treasury, "TreasuryPaused");
  });
});
