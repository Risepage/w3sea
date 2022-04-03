const Marketplace = artifacts.require('Marketplace');
const NFT = artifacts.require('NFT');

contract('NFTMarket', function (accounts) {
  it('Should create and execute market sales', async function () {
    /* deploy the marketplace */
    const market = await Marketplace.deployed();

    /* deploy the NFT contract */
    const nft = await NFT.deployed();
    const nftContractAddress = nft.address;

    let listingPrice = await market.getListingPrice();
    listingPrice = listingPrice.toString();

    const auctionPrice = web3.utils.toWei('1', 'ether');

    /* create two tokens */
    await nft.createToken('https://www.mytokenlocation.com');
    await nft.createToken('https://www.mytokenlocation2.com');

    /* put both tokens for sale */
    await market.createMarketItem(nftContractAddress, 1, auctionPrice, {
      value: listingPrice,
    });
    await market.createMarketItem(nftContractAddress, 2, auctionPrice, {
      value: listingPrice,
    });

    const buyerAddress = accounts[1];

    /* execute sale of token to another user */
    await market.createMarketSale(nftContractAddress, 1, {
      from: buyerAddress,
      value: auctionPrice,
    });

    /* query for and return the unsold items */
    items = await market.fetchMarketItems();
    items = await Promise.all(
      items.map(async (i) => {
        const tokenUri = await nft.tokenURI(i.tokenId);
        let item = {
          price: i.price.toString(),
          tokenId: i.tokenId.toString(),
          seller: i.seller,
          owner: i.owner,
          tokenUri,
        };
        return item;
      })
    );
    console.log('items: ', items);
  });
});
