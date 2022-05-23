require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

module.exports = {
  solidity: "0.7.6",
  networks: {
    hardhat: {
      forking: {
        url: process.env.MAINNET_RPC,
        blockNumber: 13909440,
      }
    },
  },
};