const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1', // Localhost (default: none)
      port: 8545, // Standard Ethereum port (default: none)
      network_id: '*', // Any network (default: none)
    },
    matic: {
      provider: () =>
        new HDWalletProvider(
          [process.env.PRIVATE_KEY],
          `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
        ),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      gasPrice: 30000000000,
    },
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: '0.8.0',
    },
  },
};
