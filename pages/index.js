import { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from 'react-loader-spinner';
import Image from 'next/image';

import Marketplace from '../build/contracts/Marketplace.json';
import NFT from '../build/contracts/NFT.json';
import { connect } from '../helper/wallet';

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState(true);
  const [marketplace, setMarketplace] = useState(null);
  const [nftContract, setNftContract] = useState(null);
  const [nftContractAddr, setNftContractAddr] = useState(null);
  const [address, setAddress] = useState('');
  const [attemptingTxn, setAttemptingTxn] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState(0);

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
    setAddress(address);

    if (marketplaceData && nftContractData) {
      const marketplace = new web3.eth.Contract(
        Marketplace.abi,
        marketplaceData.address
      );
      setMarketplace(marketplace);

      const nftContract = new web3.eth.Contract(
        NFT.abi,
        nftContractData.address
      );
      setNftContract(nftContract);
      setNftContractAddr(nftContractData.address);

      const data = await marketplace.methods
        .fetchMarketItems()
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
            image: meta.data.image,
            name: meta.data.name,
            description: meta.data.description,
          };
          return item;
        })
      );
      setNfts(items);
    }
    setLoadingState(false);
  }

  async function buyNft(nft) {
    const { web3, networkId } = await connect();
    if (!web3 || !networkId) return;
    setAttemptingTxn(true);
    setSelectedTokenId(nft.tokenId);
    const price = web3.utils.toWei(nft.price.toString(), 'ether');
    try {
      await marketplace.methods
        .createMarketSale(nftContractAddr, nft.tokenId)
        .send({ from: address, value: price, gasPrice: 30000000000 })
        .then(() => loadNFTs());
    } catch (error) {
      console.log(error);
      window.alert('Transaction failed');
    }
    setAttemptingTxn(false);
    setSelectedTokenId(0);
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 my-6 font-manrope">
      {loadingState ? (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Loader type="Bars" color="#6D28D9" height={100} width={100} />
        </div>
      ) : !marketplace && !nftContract ? (
        <h1 className="text-center text-3xl">
          Switch to Polygon Mumbai Testnet
        </h1>
      ) : !loadingState && !nfts.length ? (
        <h1 className="text-center text-3xl">No items in marketplace</h1>
      ) : (
        <div className="flex flex-wrap justify-center md:justify-start gap-4">
          {nfts.map((nft, i) => (
            <div
              key={i}
              className="w-72 border shadow rounded-xl overflow-hidden"
            >
              <img className="h-72 p-4 m-auto" src={nft.image} />
              <div className="p-4">
                <p className="text-lg font-semibold">{nft.name}</p>
                <div>
                  <p className="text-gray-400">{nft.description}</p>
                </div>
              </div>
              <div className="p-4 border-t border-gray-200">
                <div className="text-lg mb-4 font-bold flex items-center">
                  <span className="mr-2">{nft.price}</span>
                  <Image src="/static/polygon.svg" width={18} height={18} />
                  <span className="ml-1">MATIC</span>
                </div>
                <button
                  className="flex justify-center items-center gap-2 w-full bg-purple-700 text-white font-light py-2 rounded-md"
                  onClick={() => buyNft(nft)}
                >
                  {attemptingTxn && selectedTokenId === nft.tokenId && (
                    <Loader
                      type="Oval"
                      color="#FFFFFF"
                      height={16}
                      width={16}
                    />
                  )}
                  <span>
                    {attemptingTxn && selectedTokenId === nft.tokenId
                      ? 'Processing...'
                      : 'Buy'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
