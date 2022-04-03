import { useEffect, useState } from 'react';
import axios from 'axios';

import Marketplace from '../build/contracts/Marketplace.json';
import NFT from '../build/contracts/NFT.json';
import Loader from 'react-loader-spinner';
import { connect } from '../helper/wallet';

export default function Dashboard() {
  const [nfts, setNfts] = useState([]);
  const [sold, setSold] = useState([]);
  const [loadingState, setLoadingState] = useState(true);

  useEffect(() => {
    loadNFTs();
    window.ethereum.on('accountsChanged', loadNFTs);
  }, []);

  async function loadNFTs() {
    const { web3, networkId } = await connect();

    const marketplaceData = Marketplace.networks[networkId];
    const nftContractData = NFT.networks[networkId];

    const accounts = await web3.eth.getAccounts();
    const address = accounts[0];

    const marketplace = new web3.eth.Contract(
      Marketplace.abi,
      marketplaceData.address
    );

    const nftContract = new web3.eth.Contract(NFT.abi, nftContractData.address);

    const data = await marketplace.methods
      .fetchItemsCreated()
      .call({ from: address });

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await nftContract.methods
          .tokenURI(i.tokenId)
          .call({ from: address });
        const meta = await axios.get(tokenUri);
        let price = web3.utils.fromWei(i.price.toString(), 'ether');
        let item = {
          price,
          tokenId: parseInt(i.tokenId),
          seller: i.seller,
          owner: i.owner,
          sold: i.sold,
          image: meta.data.image,
        };
        return item;
      })
    );

    const soldItems = items.filter((i) => i.sold);
    setSold(soldItems);
    setNfts(items);
    setLoadingState(false);
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 my-6 font-manrope">
      {loadingState ? (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Loader type="Bars" color="#6D28D9" height={100} width={100} />
        </div>
      ) : !loadingState && !nfts.length ? (
        <h1 className="text-center text-3xl">No tokens minted</h1>
      ) : (
        <>
          <div className="py-4">
            <h2 className="text-2xl py-2">Items Created</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              {nfts.map((nft, i) => (
                <div
                  key={i}
                  className="w-72 border shadow rounded-xl overflow-hidden"
                >
                  <img src={nft.image} className="h-72 p-4 m-auto" />
                  <p className="text-right p-4 border-t text-lg font-medium">
                    {nft.price} MATIC
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="py-4">
            {!!sold.length && (
              <div>
                <h2 className="text-2xl py-2">Items sold</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  {sold.map((nft, i) => (
                    <div
                      key={i}
                      className="w-72 border shadow rounded-xl overflow-hidden"
                    >
                      <img src={nft.image} className="h-72 p-4 m-auto" />
                      <p className="text-right p-4 border-t text-lg font-medium">
                        {nft.price} MATIC
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
