import Web3Modal from 'web3modal';
import Web3 from 'web3';

export async function connect() {
  const web3Modal = new Web3Modal();

  const provider = await web3Modal.connect();
  const web3 = new Web3(provider);

  const networkId = await web3.eth.net.getId();
  const polygonTestnet = `0x${Number(80001).toString(16)}`;

  if (networkId !== 80001) {
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: polygonTestnet }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: polygonTestnet,
                chainName: 'Polygon Mumbai Testnet',
                rpcUrls: ['https://matic-mumbai.chainstacklabs.com'],
                blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
                nativeCurrency: {
                  name: 'Polygon Matic',
                  symbol: 'MATIC',
                  decimals: 18,
                },
              },
            ],
          });
        } catch (addError) {
          console.log('Failed to add network');
        }
      }
      console.log('Failed to switch to the network');
    }
  }

  return { web3, networkId };
}
