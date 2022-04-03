// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';

contract NFT is ERC721URIStorage {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;
  address marketplaceAddr;

  constructor(address _marketplaceAddr) ERC721('Metaverse Tokens', 'MTT') {
    marketplaceAddr = _marketplaceAddr;
  }

  function createToken(string memory _tokenURI) public returns (uint) {
    _tokenIds.increment();
    uint256 newItemId = _tokenIds.current();

    _mint(msg.sender, newItemId);
    _setTokenURI(newItemId, _tokenURI);
    setApprovalForAll(marketplaceAddr, true);

    return newItemId;
  }
}
