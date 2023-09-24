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

        return { ait, treasury, MINT_AMOUNT, owner, otherAccount };
    }

    describe("Deployment", function () {
        it("Should set the right beneficiary", async function () {
            const { treasury, owner } = await loadFixture(deployTreasuryFixture);
            expect(await treasury.beneficiary()).to.equal(owner.address);
        });

        it("Should set the right timelock", async function () {
            const { treasury, owner } = await loadFixture(deployTreasuryFixture);
            expect(await treasury.beneficiary()).to.equal(owner.address);
        });

        it("Should lock the funds until 366 days", async function () {
            const { treasury } = await loadFixture(deployTreasuryFixture);
            expect(await treasury.releasableAIT()).to.equal(0);

            await time.increase(3600 * 24 * 366 - 60);  // advance to just before 366 days
            expect(await treasury.releasableAIT()).to.equal(0);
        });

        it("Should unlock the funds after 366 days", async function () {
            const { treasury, MINT_AMOUNT } = await loadFixture(deployTreasuryFixture);
            expect(await treasury.releasableAIT()).to.equal(0);

            await time.increase(3600 * 24 * 366 + 60);  // advance to just after 366 days
            expect(await treasury.releasableAIT()).to.equal(MINT_AMOUNT);
        });
    });

    describe("Release", function () {

        it("Should release the funds if owner calls releaseAIT() after 366 days", async function () {
            const { ait, owner, treasury, MINT_AMOUNT } = await loadFixture(deployTreasuryFixture);
            await time.increase(3600 * 24 * 366 + 60);  // advance to just after 366 days
            expect(await ait.balanceOf(owner.address)).to.equal(0);
            await treasury.releaseAIT();
            expect(await ait.balanceOf(owner.address)).to.equal(MINT_AMOUNT);
        });

        it("Should release the funds to beneficiary if non-owner calls releaseAIT() after 366 days", async function () {
            const { ait, owner, treasury, otherAccount, MINT_AMOUNT } = await loadFixture(deployTreasuryFixture);
            await time.increase(3600 * 24 * 366 + 60);  // advance to just after 366 days
            expect(await ait.balanceOf(owner.address)).to.equal(0);
            await treasury.connect(otherAccount).releaseAIT();
            expect(await ait.balanceOf(owner.address)).to.equal(MINT_AMOUNT);
        });

    });

});
