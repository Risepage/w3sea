import { useState } from 'react';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { useRouter } from 'next/router';

import NFT from '../build/contracts/NFT.json';
import Marketplace from '../build/contracts/Marketplace.json';
import { connect } from '../helper/wallet';
import Loader from 'react-loader-spinner';

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

export default function Mint() {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: '',
    name: '',
    description: '',
  });
  const [txnType, setTxnType] = useState('');

  const router = useRouter();

  async function onChange(e) {
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      console.log('Error uploading file: ', error);
    }
  }
  async function createMarket() {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;

    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });
    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      createSale(url);
    } catch (error) {
      console.log('Error uploading file: ', error);
    }
  }

  async function createSale(url) {
    const { web3, networkId } = await connect();

    if (!web3 || !networkId) return;
    if (parseFloat(formInput.price) < 0.025) {
      window.alert('Price should be atleast 0.025 MATIC');
      return;
    }

    setTxnType('mint');
    const marketplaceData = Marketplace.networks[networkId];
    const nftContractData = NFT.networks[networkId];

    const accounts = await web3.eth.getAccounts();
    const address = accounts[0];

    const marketplace = new web3.eth.Contract(
      Marketplace.abi,
      marketplaceData.address
    );

    const nftContract = new web3.eth.Contract(NFT.abi, nftContractData.address);

    const tx = await nftContract.methods
      .createToken(url)
      .send({ from: address, gasPrice: 30000000000 });

    const event = tx.events.Transfer.returnValues;
    const value = event.tokenId;
    const tokenId = parseInt(value);
    const price = web3.utils.toWei(formInput.price, 'ether');

    const listingPrice = await marketplace.methods
      .getListingPrice()
      .call({ from: address });

    setTxnType('sale');
    await marketplace.methods
      .createMarketItem(nftContractData.address, tokenId, price)
      .send({ from: address, value: listingPrice, gasPrice: 30000000000 });

    setTxnType('');
    router.push('/');
  }

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8 my-6 font-manrope">
      <div className="w-full flex flex-col mt-8">
        <label className="text-lg font-bold">Name</label>
        <input
          type="text"
          placeholder="Item name..."
          className="mt-2 border rounded-md p-4"
          required
          onChange={(e) =>
            updateFormInput({ ...formInput, name: e.target.value })
          }
        />
        <label className="text-lg font-bold mt-4">Description</label>
        <textarea
          type="text"
          placeholder="Provide a detailed description of your item..."
          className="h-32 mt-2 border rounded-md p-4 resize-none"
          required
          onChange={(e) =>
            updateFormInput({ ...formInput, description: e.target.value })
          }
        />
        <label className="text-lg font-bold mt-4">Price</label>
        <input
          type="number"
          placeholder="Price in MATIC"
          className="mt-2 border rounded-md p-4"
          required
          onChange={(e) =>
            updateFormInput({ ...formInput, price: e.target.value })
          }
        />
        <div className="flex items-center justify-between mt-4">
          <div className="flex flex-col">
            <label className="text-lg font-bold">Image</label>
            <input
              type="file"
              name="Asset"
              className="my-4"
              required
              onChange={onChange}
            />
          </div>
          <div className="w-72 h-72 rounded-md p-2 border border-gray-400 flex justify-center">
            {fileUrl && <img className="block w-32" src={fileUrl} />}
          </div>
        </div>
        <button
          type="submit"
          onClick={createMarket}
          className="flex justify-center items-center gap-4 text-lg font-bold mt-4 bg-purple-700 text-white rounded-md px-8 py-4 shadow-lg"
        >
          {(txnType === 'mint' || txnType === 'sale') && (
            <Loader type="Oval" color="#FFFFFF" height={20} width={20} />
          )}
          <span>
            {txnType === 'mint'
              ? 'Minting...'
              : txnType === 'sale'
              ? 'Listing on marketplace...'
              : 'Create'}
          </span>
        </button>
      </div>
    </div>
  );
}
