const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("AITimeToken", function () {

    async function deployAITFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const AITimeToken = await ethers.getContractFactory("AITimeToken");
        const ait = await upgrades.deployProxy(AITimeToken, []);

        // const AITimeTokenV2Dummy = await ethers.getContractFactory("AITimeToken");
        // const ait_upgraded = await upgrades.upgradeProxy(await ait.getAddress(), AITimeTokenV2Dummy);

        return { ait, owner, otherAccount };
    }

    async function upgradeAITFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const AITimeToken = await ethers.getContractFactory("AITimeToken");
        const AITimeTokenV2Dummy = await ethers.getContractFactory("AITimeToken");
        const ait_v1 = await upgrades.deployProxy(AITimeToken, []);
        const ait_v2 = await upgrades.upgradeProxy(await ait.getAddress(), AITimeTokenV2Dummy);

        return { ait_v1, ait_v2, owner, otherAccount };
    }

    describe("Deployment", function () {
        it("Should set the right initial supply", async function () {
            const { ait } = await loadFixture(deployAITFixture);
            expect(await ait.totalSupply()).to.equal(0);
        });

        it("Should set the right owner", async function () {
            const { ait, owner } = await loadFixture(deployAITFixture);
            expect(await ait.owner()).to.equal(owner.address);
        });
    });

    describe("Mint", function () {
        it("Should allow owner to mint", async function () {
            const mintAmount = 100;
            const { ait } = await loadFixture(deployAITFixture);
            const mintTx = await ait.mint(mintAmount);
            await mintTx.wait();
            expect(await ait.totalSupply()).to.equal(mintAmount);
        });

        it("Should not allow others to mint", async function () {
            const mintAmount = 100;
            const { ait, otherAccount } = await loadFixture(deployAITFixture);
            await expect(
                ait.connect(otherAccount).mint(mintAmount)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should allow minting to annual cap", async function () {
            const { ait } = await loadFixture(deployAITFixture);
            const mintAmount = await ait.getAnnualMintQuota();
            const mintTX = await ait.mint(mintAmount);
            await mintTX.wait();
        });

        it("Should not allow minting beyond annual cap", async function () {
            const { ait } = await loadFixture(deployAITFixture);
            const mintAmount = await ait.getAnnualMintQuota();
            await expect(
                ait.mint(mintAmount + BigInt(1))
            ).to.be.revertedWithCustomError(ait, "ERC20ExceededAnnualCap");
        });

        it("Should allow minting 4 times in a calendar year", async function () {
            const { ait } = await loadFixture(deployAITFixture);
            const mintAmount = 100;
            // start at (GMT): Sunday, January 1, 2023 12:00:00 AM
            time.increaseTo(1672531200000);
            for (let i = 0; i < 4; i++) {
                expect(await ait.getAnnualRoundsQuota()).to.equal(4 - i);
                const mintTX = await ait.mint(mintAmount);
                await mintTX.wait();
                await time.increase(3600 * 24 * 30);  // advance 30 days
            }
        });

        it("Should not allow minting over 4 times in a calendar year", async function () {
            const { ait } = await loadFixture(deployAITFixture);
            const mintAmount = 100;
            // start at (GMT): Sunday, January 1, 2023 12:00:00 AM
            await time.increaseTo(1672531200000);
            for (let i = 0; i < 4; i++) {
                expect(await ait.getAnnualRoundsQuota()).to.equal(4 - i);
                const mintTX = await ait.mint(mintAmount);
                await mintTX.wait();
                await time.increase(3600 * 24 * 30);  // advance 30 days
            }

            await expect(
                ait.mint(mintAmount)
            ).to.be.revertedWithCustomError(ait, "ERC20ExceededAnnualRoundsCap");
        });
    });
});
