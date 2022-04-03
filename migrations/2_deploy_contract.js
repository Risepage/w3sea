const Marketplace = artifacts.require('Marketplace');
const NFT = artifacts.require('NFT');

module.exports = async (deployer) => {
  await deployer.deploy(Marketplace);

  const market = await Marketplace.deployed();
  const marketAddr = await market.address;
  await deployer.deploy(NFT, marketAddr);
};
