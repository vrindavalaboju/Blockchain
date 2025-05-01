require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.19",
  networks: {
    development: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      accounts: ["0x1a3b6527f05c843311323c1c0c46b53b3eecc4a36a59e53b7a63c5561f9125c6"]
    }
  }
};