const { ethers, upgrades } = require("hardhat");
require("dotenv").config({ path: ".env" });

async function main() {
    const network = ethers.provider._networkName;
    console.log("Deploying on:", network);

    let SAFE_ADDRESS = "";

    if (network === "sepolia") {
        SAFE_ADDRESS = process.env.SEPOLIA_SAFE_ADDRESS;
    } else if (network === "goerli") {
        SAFE_ADDRESS = process.env.GOERLI_SAFE_ADDRESS;
    } else if (network === "mainnet") {
        SAFE_ADDRESS = process.env.MAINNET_SAFE_ADDRESS;
    }
    console.log("Using safe address:", SAFE_ADDRESS);

    const aITimeCoinContract = await ethers.getContractFactory("AITimeCoin");
    const deployedAITimeCoinContract = await upgrades.deployProxy(
        aITimeCoinContract, [], {
            initializer: "initialize",
            kind: "transparent",
        });
    await deployedAITimeCoinContract.waitForDeployment();
    const aitAddr = await deployedAITimeCoinContract.getAddress();
    console.log("AI Time Coin Contract Address:", aitAddr);

    const treasuryContract = await ethers.getContractFactory("Treasury");
    const deployedTreasuryContract = await treasuryContract.deploy(
        SAFE_ADDRESS,
        aitAddr
    );
    console.log(
        "Treasury Contract Address:",
        deployedTreasuryContract.target)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
