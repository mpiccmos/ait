const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("AITimeToken", function () {

    async function deployAITFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();
        const tokenURI = "https://raw.githubusercontent.com/mpiccmos/ait/main/metadata.json";

        const AITimeToken = await ethers.getContractFactory("AITimeToken");
        const ait = await upgrades.deployProxy(AITimeToken, []);

        return { ait, owner, otherAccount, tokenURI };
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
            expect(await ait.totalSupply()).to.equal(mintAmount);
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

    describe("ERC-1046 tokenURI", function () {
        it("Should not set a tokenURI by default", async function () {
            const { ait } = await loadFixture(deployAITFixture);
            expect(await ait.tokenURI()).to.equal("");
        });

        it("Should let the owner set tokenURI", async function () {
            const { ait, tokenURI } = await loadFixture(deployAITFixture);
            await ait.setTokenURI(tokenURI);
            expect(await ait.tokenURI()).to.equal(tokenURI);
        });

        it("Should not let non-owner set tokenURI", async function () {
            const { ait, otherAccount, tokenURI } = await loadFixture(deployAITFixture);
            await ait.setTokenURI(tokenURI);
            await expect(
                ait.connect(otherAccount).setTokenURI(tokenURI)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Unit conversions", function () {
        it("Should correctly convert to/from minutes", async function () {
            const { ait } = await loadFixture(deployAITFixture);
            const m = 123;
            const s = m * 60;
            expect(await ait.toMinutes(s)).to.equal(m);

            const ss = 91742;
            const mm = Math.floor(ss / 60);
            const sss = mm * 60
            expect(await ait.fromMinutes(mm)).to.equal(sss);
        });

        it("Should correctly convert to/from hours", async function () {
            const { ait } = await loadFixture(deployAITFixture);
            const m = 123;
            const s = m * 3600;
            expect(await ait.toHours(s)).to.equal(m);

            const ss = 91742;
            const mm = Math.floor(ss / 3600);
            const sss = mm * 3600
            expect(await ait.fromHours(mm)).to.equal(sss);
        });

        it("Should correctly convert to/from days", async function () {
            const { ait } = await loadFixture(deployAITFixture);
            const m = 123;
            const s = m * 86400;
            expect(await ait.toDays(s)).to.equal(m);

            const ss = 91742;
            const mm = Math.floor(ss / 86400);
            const sss = mm * 86400
            expect(await ait.fromDays(mm)).to.equal(sss);
        });

        it("Should correctly convert to/from years", async function () {
            const { ait } = await loadFixture(deployAITFixture);
            const m = 123;
            const s = m * 31536000;
            expect(await ait.toYears(s)).to.equal(m);

            const ss = 9174234234;
            const mm = Math.floor(ss / 31536000);
            const sss = mm * 31536000
            expect(await ait.fromYears(mm)).to.equal(sss);
        });

        it("Should correctly convert to/from decades", async function () {
            const { ait } = await loadFixture(deployAITFixture);
            const m = 123;
            const s = m * 315360000;
            expect(await ait.toDecades(s)).to.equal(m);

            const ss = 9174234234;
            const mm = Math.floor(ss / 315360000);
            const sss = mm * 315360000
            expect(await ait.fromDecades(mm)).to.equal(sss);
        });

        it("Should correctly convert to/from centuries", async function () {
            const { ait } = await loadFixture(deployAITFixture);
            const m = 123;
            const s = m * 3153600000;
            expect(await ait.toCenturies(s)).to.equal(m);

            const ss = 9174234232134;
            const mm = Math.floor(ss / 3153600000);
            const sss = mm * 3153600000
            expect(await ait.fromCenturies(mm)).to.equal(sss);
        });
    });

    describe("Ethers", function () {
        it("Should be able to receive ethers", async function () {
            const { ait, otherAccount } = await loadFixture(deployAITFixture);
            const ait_addr = await ait.getAddress();
            const txHash = await otherAccount.sendTransaction({
                to: ait_addr,
                value: ethers.toQuantity(ethers.parseEther("1")), // 1 ether,
            });
            expect(await ethers.provider.getBalance(ait_addr)).to.equal(ethers.parseEther("1"));
        });

        it("Should be able to receive ethers via fallback()", async function () {
            const { ait, otherAccount } = await loadFixture(deployAITFixture);
            const ait_addr = await ait.getAddress();
            const txHash = await otherAccount.sendTransaction({
                to: ait_addr,
                value: ethers.toQuantity(ethers.parseEther("1")), // 1 ether,
                data: "0x00"
            });
            expect(await ethers.provider.getBalance(ait_addr)).to.equal(ethers.parseEther("1"));
        });

        it("Should let owner withdraw ethers to specified address", async function () {
            const { ait, owner, otherAccount } = await loadFixture(deployAITFixture);
            const ait_addr = await ait.getAddress();
            await otherAccount.sendTransaction({
                to: ait_addr,
                value: ethers.toQuantity(ethers.parseEther("1")), // 1 ether,
            });
            expect(await ethers.provider.getBalance(ait_addr)).to.equal(ethers.parseEther("1"));
            const owner_bal = await ethers.provider.getBalance(owner);
            const withdrawTxHash = (await ait.withdraw(owner, ethers.parseEther("1"))).hash;
            const withdrawTxReceipt = await ethers.provider.getTransactionReceipt(withdrawTxHash);
            expect(await ethers.provider.getBalance(ait_addr)).to.equal(0);
            expect(await ethers.provider.getBalance(owner)).to.equal(
                owner_bal + ethers.parseEther("1") - withdrawTxReceipt.gasUsed * withdrawTxReceipt.gasPrice);
        });

        it("Should not let non-owner withdraw ethers", async function () {
            const { ait, otherAccount } = await loadFixture(deployAITFixture);
            const ait_addr = await ait.getAddress();
            await otherAccount.sendTransaction({
                to: ait_addr,
                value: ethers.toQuantity(ethers.parseEther("1")), // 1 ether,
            });
            expect(await ethers.provider.getBalance(ait_addr)).to.equal(ethers.parseEther("1"));
            await expect(
                ait.connect(otherAccount).withdraw(otherAccount, ethers.parseEther("1"))
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Management", function () {
        it("Should start unpaused", async function () {
            const { ait } = await loadFixture(deployAITFixture);
            expect(await ait.paused()).to.equal(false);
        });

        it("Should let owner to pause transfers", async function () {
            const { ait } = await loadFixture(deployAITFixture);
            const pauseTx = await ait.pause();
            await pauseTx.wait();
            expect(await ait.paused()).to.equal(true);
        });

        it("Should not let non-owner to pause transfers", async function () {
            const { ait, otherAccount } = await loadFixture(deployAITFixture);
            await expect(
                ait.connect(otherAccount).pause()
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should let owner to unpause transfers", async function () {
            const { ait } = await loadFixture(deployAITFixture);
            const pauseTx = await ait.pause();
            await pauseTx.wait();
            expect(await ait.paused()).to.equal(true);
            const unpauseTx = await ait.unpause();
            await unpauseTx.wait();
            expect(await ait.paused()).to.equal(false);
        });

        it("Should not let non-owner to unpause transfers", async function () {
            const { ait, otherAccount } = await loadFixture(deployAITFixture);
            const pauseTx = await ait.pause();
            await pauseTx.wait();
            expect(await ait.paused()).to.equal(true);
            await expect(
                ait.connect(otherAccount).unpause()
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should allow transfers when not paused", async function () {
            const { ait, owner, otherAccount } = await loadFixture(deployAITFixture);
            const mintAmount = 100;
            const mintTx = await ait.mint(mintAmount);
            await mintTx.wait();
            expect(await ait.balanceOf(owner)).to.equal(mintAmount);
            expect(await ait.balanceOf(otherAccount)).to.equal(0);
            expect(await ait.paused()).to.equal(false);
            const transferTx = await ait.transfer(otherAccount, mintAmount);
            await transferTx.wait();
            expect(await ait.balanceOf(owner)).to.equal(0);
            expect(await ait.balanceOf(otherAccount)).to.equal(mintAmount);
        });

        it("Should not allow transfers when paused", async function () {
            const { ait, owner, otherAccount } = await loadFixture(deployAITFixture);
            const mintAmount = 100;
            const mintTx = await ait.mint(mintAmount);
            await mintTx.wait();
            const pauseTx = await ait.pause();
            await pauseTx.wait();
            expect(await ait.balanceOf(owner)).to.equal(mintAmount);
            expect(await ait.balanceOf(otherAccount)).to.equal(0);
            expect(await ait.paused()).to.equal(true);
            await expect(
                ait.transfer(otherAccount, mintAmount)
            ).to.be.revertedWith("Pausable: paused");
        });
    });
});
