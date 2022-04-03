import { useEffect, useState } from 'react';
import { createAlchemyWeb3 } from '@alch/alchemy-web3';

import Loader from 'react-loader-spinner';
import { connect } from '../helper/wallet';

export default function MyGallery() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState(true);

  useEffect(() => {
    getNfts();
    window.ethereum.on('accountsChanged', getNfts);
  }, []);

  function shortAddress(address) {
    return `${address.slice(0, 23)}...${address.slice(-4)}`;
  }

  async function getNfts() {
    try {
      const web3 = createAlchemyWeb3(
        `https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
      );

      const [ownerAddr] = await web3.eth.getAccounts();
      const nfts = await web3.alchemy.getNfts({
        owner: ownerAddr,
      });

      setNfts(nfts.ownedNfts);
    } catch (error) {
      await connect();
    }
    setLoadingState(false);
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 my-6 font-manrope">
      {loadingState ? (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Loader type="Bars" color="#6D28D9" height={100} width={100} />
        </div>
      ) : !loadingState && !nfts.length ? (
        <h1 className="text-center text-3xl">No assets owned</h1>
      ) : (
        <>
          <div className="py-4">
            <h2 className="text-2xl py-2">W3Sea NFTs</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              {nfts
                .filter(
                  (nft) =>
                    nft.contract.address ===
                    '0xe38837957e9c27ce8b8ef83c5c50c58ef13e0b64'
                )
                .map((nft, i) => (
                  <div
                    key={i}
                    className="w-72 border shadow rounded-xl overflow-hidden"
                  >
                    <img className="h-72 p-4 m-auto" src={nft.metadata.image} />
                    <div className="p-4 border-t border-gray-200">
                      <p className="text-lg font-semibold">
                        {nft.metadata.name}
                      </p>
                      <div>
                        <p className="text-gray-400">{nft.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div className="py-4">
            <h2 className="text-2xl py-2">Other NFTs</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              {nfts
                .filter(
                  (nft) =>
                    nft.contract.address !==
                    '0xe38837957e9c27ce8b8ef83c5c50c58ef13e0b64'
                )
                .map((nft, i) => (
                  <div
                    key={i}
                    className="w-72 border shadow rounded-xl overflow-hidden"
                  >
                    <p className="pt-4 px-4 text-gray-900 font-bold">
                      Contract address
                    </p>
                    <p className="pb-4 px-4 text-gray-900">
                      {shortAddress(nft.contract.address)}
                    </p>
                    <img className="h-72 p-4 m-auto" src={nft.metadata.image} />
                    <div className="p-4 border-t border-gray-200">
                      <p className="text-lg font-bold">{nft.metadata.name}</p>
                      <div>
                        <p className="text-gray-400">{nft.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
