require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.19",
  networks: {
    development: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      accounts: ["0x830d10872cee1c0ce33118486a861d13c0c2cbb3cab9e6b9d34d14d3dc95fc59"]
    }
  }
};