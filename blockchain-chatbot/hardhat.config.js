require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.19",
  networks: {
    development: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      accounts: ["0x7f93199e58143eabc8ced3f06b0f051b8ecc8145a3879277ec44af072d202d3c"]
    }
  }
};