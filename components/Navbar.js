import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { connect } from '../helper/wallet';

export default function Navbar() {
  const [address, setAddress] = useState(null);

  useEffect(() => {
    fetchAddress();
    window.ethereum.on('accountsChanged', fetchAddress);
  }, []);

  async function fetchAddress() {
    const account = window.ethereum.selectedAddress;
    account ? setAddress(account) : null;
  }

  return (
    <nav className="flex flex-col md:flex-row gap-6 md:gap-0 justify-between items-center border-b p-6 font-manrope">
      <p className="text-3xl font-extrabold">
        W3<span className="text-3xl font-light">Sea</span>
      </p>
      <div className="flex flex-col md:flex-row text-center gap-6">
        <Link href="/">
          <a className="text-purple-700">Marketplace</a>
        </Link>
        <Link href="/mint">
          <a className="text-purple-700">Mint</a>
        </Link>
        <Link href="/my-gallery">
          <a className="text-purple-700">My Gallery</a>
        </Link>
        <Link href="/minted-tokens">
          <a className="text-purple-700">Minted Tokens</a>
        </Link>
      </div>
      <button
        className="px-4 py-2 bg-gray-200 rounded-full flex justify-center items-center gap-2"
        onClick={() => connect().then(() => fetchAddress())}
      >
        <Image src="/static/metamask-fox.svg" width={26} height={26} />
        <span>
          {address
            ? `${address.slice(0, 6)}...${address.slice(-4)}`
            : 'Connect Wallet'}
        </span>
      </button>
    </nav>
  );
}
