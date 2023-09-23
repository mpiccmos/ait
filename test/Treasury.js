const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Treasury", function () {

    async function deployTreasuryFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const AITimeToken = await ethers.getContractFactory("AITimeToken");
        const ait = await upgrades.deployProxy(AITimeToken, []);
        const ait_addr = await ait.getAddress();

        const treasuryContract = await ethers.getContractFactory("Treasury");
        const treasury = await treasuryContract.deploy(owner, ait_addr);
        const treasury_addr = await treasury.getAddress();

        const MINT_AMOUNT = 424242;
        await ait.mint(MINT_AMOUNT);
        await ait.transfer(treasury_addr, MINT_AMOUNT);

        return { ait, treasury, owner, otherAccount };
    }

    describe("Deployment", function () {
        it("Should set the right beneficiary", async function () {
            const { treasury, owner } = await loadFixture(deployTreasuryFixture);
            expect(await treasury.beneficiary()).to.equal(owner.address);
        });

        it("Should set the unlock to be 366 days later", async function () {
            const { treasury } = await loadFixture(deployTreasuryFixture);
        });
    });

});
