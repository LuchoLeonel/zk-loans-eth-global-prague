import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    rskMainnet: {
      url: "https://rpc.mainnet.rootstock.io/YOUR_APIKEY",
      chainId: 30,
      gasPrice: 60000000,
      accounts: process.env.ROOTSTOCK_MAINNET_PRIVATE_KEY
        ? [process.env.ROOTSTOCK_MAINNET_PRIVATE_KEY]
        : []
    },
    rskTestnet: {
      url: "https://rpc.testnet.rootstock.io/TnukxR92yfQ6D2xnCa5jcEBkqBRZaK-T",
      chainId: 31,
      gasPrice: 60000000,
      accounts: process.env.ROOTSTOCK_TESTNET_PRIVATE_KEY
        ? [process.env.ROOTSTOCK_TESTNET_PRIVATE_KEY]
        : []
    }
  }
};

export default config;