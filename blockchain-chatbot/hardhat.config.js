require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.19",
  networks: {
    development: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      accounts: ["0x7948f94207e883f228ddb0f46162a4365c45e79014ee76b873f2dc706a4b51d3"]
    }
  }
};