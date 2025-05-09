require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.19",
  networks: {
    development: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      accounts: ["0x726ca47dcd39a872f1c31cd7e20a948e86555b45c41624e1c2507aeff0d2e796"]
    }
  }
};