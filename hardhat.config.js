require("@openzeppelin/hardhat-upgrades");
require("@nomicfoundation/hardhat-toolbox");
require("solidity-docgen");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("dotenv").config({ path: ".env" });

const SEPOLIA_ALCHEMY_API_KEY_URL = process.env.SEPOLIA_ALCHEMY_API_KEY_URL;
const GOERLI_ALCHEMY_API_KEY_URL = process.env.SEPOLIA_ALCHEMY_API_KEY_URL;
const MAINNET_ALCHEMY_API_KEY_URL = process.env.SEPOLIA_ALCHEMY_API_KEY_URL;
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

module.exports = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 300
            }
        }
    },
    networks: {
        sepolia: {
            url: SEPOLIA_ALCHEMY_API_KEY_URL,
            accounts: [WALLET_PRIVATE_KEY],
        },
        goerli: {
            url: GOERLI_ALCHEMY_API_KEY_URL,
            accounts: [WALLET_PRIVATE_KEY],
        },
        mainnet: {
            url: MAINNET_ALCHEMY_API_KEY_URL,
            accounts: [WALLET_PRIVATE_KEY],
        }
    },
    etherscan: {
        apiKey: {
            sepolia: ETHERSCAN_API_KEY,
        }
    },
    gasReporter: {
        outputFile: "gas-report.txt",
        enabled: process.env.REPORT_GAS !== undefined,
        currency: "USD",
        noColors: true,
        coinmarketcap: process.env.COIN_MARKETCAP_API_KEY || "",
        token: "ETH"
    },
    docgen: {
        sourceDir: "contracts",
        outputDir: "docs",
        pages: "items",
    },
};
