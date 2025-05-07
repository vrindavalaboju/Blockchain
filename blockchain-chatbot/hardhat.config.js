require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.19",
  networks: {
    development: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      accounts: ["0x65816e26f51c74dcf1f70f2709810955378f0e8537b56ca20c0591efddd1d946"]
    }
  }
};