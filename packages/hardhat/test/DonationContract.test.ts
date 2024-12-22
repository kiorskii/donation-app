const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TEST", function () {
  let donationContract;
  let owner;

  beforeEach(async function () {
    const DonationContract = await ethers.getContractFactory("DonationContract");

    donationContract = await DonationContract.deploy("0x0000000000000000000000000000000000000000");
    [owner] = await ethers.getSigners();
  });

  it("should create a donation", async function () {
    const tx = await donationContract.createDonation("Test Donation", owner.address);

    await tx.wait();

    const donation = await donationContract.donations(0);
    expect(donation.description).to.equal("Test Donation");
    expect(donation.recipient).to.equal(owner.address);
    expect(donation.totalDonations).to.equal(0);
  });
});
